// Utilità di Esportazione PontiPA (iCal .ics e Microsoft Excel .xlsx)
import * as XLSX from 'xlsx';
import { DAY_TYPES, MONTH_NAMES_IT } from './optimizer.js';

/**
 * Esporta il calendario in formato standard iCalendar (.ics)
 * Compatibile con Google Calendar, Apple Calendar, Outlook
 */
export function exportToICal(calendar, year, config) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PontiPA//Portale Pubblica Amministrazione IT//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:PontiPA - Piano Ferie & Ponti ${year}`,
    'X-WR-TIMEZONE:Europe/Rome',
  ];

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  calendar.forEach((day, idx) => {
    if (
      day.type === DAY_TYPES.FERIE ||
      day.type === DAY_TYPES.PERMESSO_PERSONALE ||
      day.type === DAY_TYPES.PERMESSO_MEDICO ||
      day.type === DAY_TYPES.HOLIDAY ||
      day.type === DAY_TYPES.PATRON
    ) {
      const y = day.year;
      const m = String(day.month + 1).padStart(2, '0');
      const d = String(day.day).padStart(2, '0');
      const dtStart = `${y}${m}${d}`;

      const nextDate = new Date(day.date);
      nextDate.setDate(nextDate.getDate() + 1);
      const ny = nextDate.getFullYear();
      const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDate.getDate()).padStart(2, '0');
      const dtEnd = `${ny}${nm}${nd}`;

      let summary = '';
      let category = 'VACATION';

      if (day.type === DAY_TYPES.FERIE) {
        summary = '🌴 PontiPA: Congedo Ordinario (Ferie)';
      } else if (day.type === DAY_TYPES.PERMESSO_PERSONALE) {
        summary = `📋 PontiPA: Permesso Motivi Personali (${day.usedPermitHours || day.scheduledHours}h)`;
      } else if (day.type === DAY_TYPES.PERMESSO_MEDICO) {
        summary = `🩺 PontiPA: Permesso Visita Medica (${day.usedPermitHours || day.scheduledHours}h)`;
      } else if (day.type === DAY_TYPES.HOLIDAY) {
        summary = `🇮🇹 Festività Ufficiale: ${day.label}`;
        category = 'HOLIDAY';
      } else if (day.type === DAY_TYPES.PATRON) {
        summary = `🏛️ Festività Santo Patrono: ${day.label}`;
        category = 'HOLIDAY';
      }

      const description = day.bridgeInfo ? `Note Decreto: ${day.bridgeInfo}` : (day.label || '');

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:pontipa-${year}-${idx}-${dtStart}@pontipa.gov.it`);
      icsContent.push(`DTSTAMP:${nowStr}`);
      icsContent.push(`DTSTART;VALUE=DATE:${dtStart}`);
      icsContent.push(`DTEND;VALUE=DATE:${dtEnd}`);
      icsContent.push(`SUMMARY:${summary}`);
      icsContent.push(`DESCRIPTION:${description}`);
      icsContent.push(`CATEGORIES:${category}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('TRANSP:TRANSPARENT');
      icsContent.push('END:VEVENT');
    }
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `PontiPA_Calendario_${year}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Esporta il piano annuale, le statistiche e le buste paga in un file Excel .xlsx
 */
export function exportToExcel(calendar, stats, bridgeSummaries, year, config = {}, payroll = null) {
  const wb = XLSX.utils.book_new();
  const totalFerieTarget = config.totalFerie ?? 30;
  const personalHoursTarget = config.personalPermitHours ?? 18;
  const medicalHoursTarget = config.medicalPermitHours ?? 18;

  // Foglio 1: Calendario Completo Dettagliato
  const detailedData = calendar.map(d => {
    let statoDescrizione = 'Servizio Ordinario';
    if (d.type === DAY_TYPES.WEEKEND) statoDescrizione = 'Riposo Settimanale';
    else if (d.type === DAY_TYPES.HOLIDAY) statoDescrizione = 'Festività Civile / Religiosa';
    else if (d.type === DAY_TYPES.PATRON) statoDescrizione = 'Santo Patrono';
    else if (d.type === DAY_TYPES.FERIE) statoDescrizione = 'Congedo Ordinario (Ferie)';
    else if (d.type === DAY_TYPES.PERMESSO_PERSONALE) statoDescrizione = 'Permesso Motivi Personali CCNL';
    else if (d.type === DAY_TYPES.PERMESSO_MEDICO) statoDescrizione = 'Permesso Visita Medica CCNL';

    return {
      Data: d.dateKey,
      Giorno: d.dayName,
      Numero: d.day,
      Mese: MONTH_NAMES_IT[d.month],
      'Stato Giuridico': statoDescrizione,
      'Ore Contrattuali': d.scheduledHours,
      'Ore Effettive Servizio': d.workedHours,
      'Ore Straordinario': d.overtimeHours || 0,
      'Ore Permesso Fruite': d.usedPermitHours,
      'Decreto / Ponte Attivo': d.bridgeInfo || d.overtimeNote || d.label || '',
    };
  });
  const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(wb, wsDetailed, 'Foglio Presenze Annuale');

  // Foglio 2: Registro Ponti e Vacanze
  const bridgeData = bridgeSummaries.map((b, i) => ({
    'N. Fascicolo': i + 1,
    'Denominazione Ponte / Chiusura': b.title,
    'Data Inizio': b.startDate,
    'Data Fine': b.endDate,
    'Giorni Consecutivi Astensione': b.totalRestDays,
    'Giorni Assenza Impegnati': b.leavesSpent,
    'Ferie Fruite (gg)': b.ferieUsed,
    'Permessi Personali Fruiti (gg)': b.permessiPers,
    'Permessi Medici Fruiti (gg)': b.permessiMed,
    'Rendimento ROI': `${b.roi}x`,
  }));
  const wsBridges = XLSX.utils.json_to_sheet(bridgeData);
  XLSX.utils.book_append_sheet(wb, wsBridges, 'Registro Ponti Festivi');

  // Foglio 3: Prospetto Riepilogativo CCNL
  const statsData = [
    { Indicatore: 'Ente / Applicativo', Valore: 'PontiVVF • PA - Repubblica Italiana' },
    { Indicatore: 'Anno di Esercizio', Valore: year },
    ...(payroll
      ? [
          { Indicatore: 'Qualifica / Figura Professionale', Valore: `${payroll.role.name} (${payroll.role.category})` },
          { Indicatore: 'Anzianità di Servizio', Valore: `${config.seniorityYears ?? 8} anni (${payroll.seniority.bracketLabel})` },
          { Indicatore: 'Tariffa Oraria Straordinario Applicata', Valore: `€ ${payroll.effectiveOvertimeRate.toFixed(2)} / ora` },
        ]
      : []),
    { Indicatore: 'Giorni Totali Calendario', Valore: stats.totalDaysInYear },
    { Indicatore: 'Giorni di Servizio Effettivo', Valore: stats.workDays },
    { Indicatore: 'Percentuale Servizio su Totale Anno', Valore: `${stats.workDaysPercentage}%` },
    { Indicatore: 'Giorni Totali Astensione e Riposo', Valore: stats.totalRestDays },
    { Indicatore: 'Percentuale Riposo e Congedi', Valore: `${stats.restDaysPercentage}%` },
    { Indicatore: 'Massimo Periodo Continuativo di Riposo', Valore: `${stats.maxConsecutiveRestDays} giorni` },
    { Indicatore: 'Numero Ponti Riconosciuti', Valore: stats.bridgesCount },
    { Indicatore: 'Congedo Ordinario (Ferie) Fruito / Spettante', Valore: `${stats.totalFerieUsed} / ${totalFerieTarget} giorni` },
    { Indicatore: 'Ore Permesso Personale Fruite / Spettanti', Valore: `${stats.totalPermessiPersUsed}h / ${personalHoursTarget}h` },
    { Indicatore: 'Ore Permesso Visita Medica Fruite / Spettanti', Valore: `${stats.totalPermessiMedUsed}h / ${medicalHoursTarget}h` },
    { Indicatore: 'Ore Totali di Servizio Effettuate', Valore: `${stats.totalWorkedHours} ore` },
    { Indicatore: 'Ore Totali Risparmiate con Ferie/Permessi', Valore: `${stats.totalSavedHours} ore` },
    { Indicatore: 'Ore Totali di Straordinario Pianificate', Valore: `${stats.totalOvertimeHours || 0} ore` },
    { Indicatore: 'Compenso Straordinario Lordo Stimato', Valore: `€ ${stats.totalOvertimePay || '0.00'}` },
    ...(payroll
      ? [
          { Indicatore: 'Retribuzione Annua Lorda Complessiva (RAL + Straord.)', Valore: `€ ${payroll.summary.annualGrossTotal.toFixed(2)}` },
          { Indicatore: 'Netto Annuo Complessivo in Busta Paga (12 mesi + 13ª)', Valore: `€ ${payroll.summary.annualNetPay.toFixed(2)}` },
          { Indicatore: 'Valore Annuo Buoni Pasto Maturati (Esentasse)', Valore: `€ ${payroll.summary.annualMealVouchersAmount.toFixed(2)} (${payroll.summary.annualMealVouchersCount} buoni)` },
        ]
      : []),
  ];
  const wsStats = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Riepilogo Quadro Presenze');

  // Foglio 4: Prospetto Buste Paga NoiPA (12 Mesi + 13ª Mensilità)
  if (payroll && payroll.monthlySlips) {
    const payrollRows = payroll.monthlySlips.map(m => ({
      Mensilità: m.monthName,
      'Giorni Presenza': m.workDays,
      'Giorni Ferie/Perm.': m.ferieDays + m.permessiDays,
      'Ore Lavorate': m.workedHours,
      'Lordo Fisso (€)': Number(m.grossFixedMonth.toFixed(2)),
      'Ore Straordinario': m.overtimeHours,
      'Lordo Straordinario (€)': Number(m.grossOvertimeMonth.toFixed(2)),
      'Totale Competenze Lorde (€)': Number(m.totalGross.toFixed(2)),
      'Contributi Previdenziali INPS (€)': Number(m.inpsContributions.toFixed(2)),
      'Ritenute Fiscali IRPEF + Add. (€)': Number((m.monthlyIrpefNet + m.monthlyLocalTaxes).toFixed(2)),
      'Netto Busta Paga (€)': Number(m.netPay.toFixed(2)),
      'Di cui Netto Straordinario (€)': Number(m.netOvertimePay.toFixed(2)),
      'Buoni Pasto Maturati (n.)': m.mealVouchersCount,
      'Valore Buoni Pasto (€)': Number(m.mealVouchersAmount.toFixed(2)),
    }));

    // Riga 13ª Mensilità
    payrollRows.push({
      Mensilità: payroll.tredicesima.monthName,
      'Giorni Presenza': '-',
      'Giorni Ferie/Perm.': '-',
      'Ore Lavorate': '-',
      'Lordo Fisso (€)': Number(payroll.tredicesima.grossFixedMonth.toFixed(2)),
      'Ore Straordinario': 0,
      'Lordo Straordinario (€)': 0,
      'Totale Competenze Lorde (€)': Number(payroll.tredicesima.totalGross.toFixed(2)),
      'Contributi Previdenziali INPS (€)': Number(payroll.tredicesima.inpsContributions.toFixed(2)),
      'Ritenute Fiscali IRPEF + Add. (€)': Number((payroll.tredicesima.monthlyIrpefNet + payroll.tredicesima.monthlyLocalTaxes).toFixed(2)),
      'Netto Busta Paga (€)': Number(payroll.tredicesima.netPay.toFixed(2)),
      'Di cui Netto Straordinario (€)': 0,
      'Buoni Pasto Maturati (n.)': 0,
      'Valore Buoni Pasto (€)': 0,
    });

    // Riga Totale Annuo
    payrollRows.push({
      Mensilità: `TOTALE ANNUO ${year}`,
      'Giorni Presenza': stats.workDays,
      'Giorni Ferie/Perm.': stats.totalFerieUsed + stats.permessiDaysCount,
      'Ore Lavorate': stats.totalWorkedHours,
      'Lordo Fisso (€)': Number(payroll.summary.annualGrossFixed.toFixed(2)),
      'Ore Straordinario': payroll.summary.annualTotalOvertimeHours,
      'Lordo Straordinario (€)': Number(payroll.summary.annualGrossOvertime.toFixed(2)),
      'Totale Competenze Lorde (€)': Number(payroll.summary.annualGrossTotal.toFixed(2)),
      'Contributi e Ritenute Totali (€)': Number(payroll.summary.annualTotalDeductions.toFixed(2)),
      'Ritenute Fiscali IRPEF + Add. (€)': '-',
      'Netto Busta Paga (€)': Number(payroll.summary.annualNetPay.toFixed(2)),
      'Di cui Netto Straordinario (€)': Number(payroll.summary.annualNetOvertime.toFixed(2)),
      'Buoni Pasto Maturati (n.)': payroll.summary.annualMealVouchersCount,
      'Valore Buoni Pasto (€)': Number(payroll.summary.annualMealVouchersAmount.toFixed(2)),
    });

    const wsPayroll = XLSX.utils.json_to_sheet(payrollRows);
    XLSX.utils.book_append_sheet(wb, wsPayroll, 'Prospetto Buste Paga NoiPA');
  }

  XLSX.writeFile(wb, `PontiVVF_Piano_Servizio_e_BustePaga_${year}.xlsx`);
}
