import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { 
  generateBaseCalendar, 
  optimizeAnnualCalendar, 
  SCHEDULE_MODES, 
  DAY_TYPES, 
  MONTH_NAMES_IT 
} from '../src/utils/optimizer.js';

const year = 2026;
const config = {
  year,
  scheduleMode: SCHEDULE_MODES.THREE_SIX_TWO_NINE,
  nineHourDays: [2, 4], // Martedì e Giovedì da 9h
  totalFerie: 30,
  personalPermitHours: 18,
  medicalPermitHours: 18,
  reserveSummerWeeks: 2,
  patronConfig: {
    city: 'Roma',
    name: 'Santi Pietro e Paolo',
    month: 6,
    day: 29,
  },
};

const baseCal = generateBaseCalendar(year, config);
const res = optimizeAnnualCalendar(baseCal, config);
const { calendar, stats, bridgeSummaries } = res;

// 1. Genera File Excel .xlsx in stile PontiPA
const wb = XLSX.utils.book_new();

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
    'Ore Permesso Fruite': d.usedPermitHours,
    'Decreto / Ponte Attivo': d.bridgeInfo || d.label || '',
  };
});
const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
XLSX.utils.book_append_sheet(wb, wsDetailed, 'Foglio Presenze Annuale');

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

const statsData = [
  { Indicatore: 'Ente / Applicativo', Valore: 'PontiPA - Repubblica Italiana' },
  { Indicatore: 'Anno di Esercizio', Valore: year },
  { Indicatore: 'Articolazione Oraria', Valore: '3 giorni da 6h + 2 rientri da 9h (36h/settimana)' },
  { Indicatore: 'Giorni Totali Calendario', Valore: stats.totalDaysInYear },
  { Indicatore: 'Giorni di Servizio Effettivo', Valore: stats.workDays },
  { Indicatore: 'Percentuale Servizio su Totale Anno', Valore: `${stats.workDaysPercentage}%` },
  { Indicatore: 'Giorni Totali Astensione e Riposo', Valore: stats.totalRestDays },
  { Indicatore: 'Percentuale Riposo e Congedi', Valore: `${stats.restDaysPercentage}%` },
  { Indicatore: 'Massimo Periodo Continuativo di Riposo', Valore: `${stats.maxConsecutiveRestDays} giorni` },
  { Indicatore: 'Numero Ponti Riconosciuti', Valore: stats.bridgesCount },
  { Indicatore: 'Congedo Ordinario (Ferie) Fruito / Spettante', Valore: `${stats.totalFerieUsed} / 30 giorni` },
  { Indicatore: 'Ore Permesso Personale Fruite / Spettanti', Valore: `${stats.totalPermessiPersUsed}h / 18h` },
  { Indicatore: 'Ore Permesso Visita Medica Fruite / Spettanti', Valore: `${stats.totalPermessiMedUsed}h / 18h` },
  { Indicatore: 'Ore Totali di Servizio Effettuate', Valore: `${stats.totalWorkedHours} ore` },
  { Indicatore: 'Ore Totali Risparmiate con Ferie/Permessi', Valore: `${stats.totalSavedHours} ore` },
];
const wsStats = XLSX.utils.json_to_sheet(statsData);
XLSX.utils.book_append_sheet(wb, wsStats, 'Riepilogo Quadro Presenze');

const excelPath = path.resolve(process.cwd(), `PontiPA_Piano_Servizio_${year}.xlsx`);
XLSX.writeFile(wb, excelPath);
console.log('Generato file Excel PontiPA:', excelPath);

// 2. Genera File iCal .ics
let icsLines = [
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

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:pontipa-${year}-${idx}-${dtStart}@pontipa.gov.it`);
    icsLines.push(`DTSTAMP:${nowStr}`);
    icsLines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    icsLines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    icsLines.push(`SUMMARY:${summary}`);
    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push(`CATEGORIES:${category}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('TRANSP:TRANSPARENT');
    icsLines.push('END:VEVENT');
  }
});
icsLines.push('END:VCALENDAR');

const icsPath = path.resolve(process.cwd(), `PontiPA_Calendario_${year}.ics`);
fs.writeFileSync(icsPath, icsLines.join('\r\n'), 'utf8');
console.log('Generato file iCal PontiPA:', icsPath);
