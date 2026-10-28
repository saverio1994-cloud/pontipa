// Motore Economico & Calcolo Buste Paga (Stile NoiPA - Corpo Nazionale Vigili del Fuoco & Comparto PA)
import { DAY_TYPES, MONTH_NAMES_IT } from './optimizer.js';

/**
 * Catalogo Qualifiche / Figure Professionali (Ruolo Operativo VVF & Ruolo Tecnico-Professionale RTP / PA)
 * Importi mensili lordi medi (12 mensilità + 13ª) ispirati alle tabelle contrattuali D.Lgs. 217/2005 e CCNL VVF/PA.
 */
export const PROFESSIONAL_ROLES = [
  // --- RUOLO OPERATIVO VIGILI DEL FUOCO ---
  {
    id: 'vigile_fuoco',
    category: 'Ruolo Operativo VVF',
    name: 'Vigile del Fuoco',
    code: 'VVF-01',
    parametro: '104,50',
    baseTabellare: 1595.0,
    indennitaRischio: 448.0,
    baseOvertimeRate: 14.9,
  },
  {
    id: 'vigile_qualificato',
    category: 'Ruolo Operativo VVF',
    name: 'Vigile del Fuoco Qualificato',
    code: 'VVF-02',
    parametro: '108,50',
    baseTabellare: 1655.0,
    indennitaRischio: 478.0,
    baseOvertimeRate: 15.5,
  },
  {
    id: 'vigile_esperto',
    category: 'Ruolo Operativo VVF',
    name: 'Vigile del Fuoco Esperto',
    code: 'VVF-03',
    parametro: '113,50',
    baseTabellare: 1730.0,
    indennitaRischio: 515.0,
    baseOvertimeRate: 16.3,
  },
  {
    id: 'vigile_coordinatore',
    category: 'Ruolo Operativo VVF',
    name: 'Vigile del Fuoco Coordinatore',
    code: 'VVF-04',
    parametro: '120,75',
    baseTabellare: 1840.0,
    indennitaRischio: 565.0,
    baseOvertimeRate: 17.3,
  },

  // --- RUOLO CAPI SQUADRA E CAPI REPARTO ---
  {
    id: 'capo_squadra',
    category: 'Capi Squadra e Capi Reparto',
    name: 'Capo Squadra',
    code: 'CS-01',
    parametro: '125,50',
    baseTabellare: 1915.0,
    indennitaRischio: 635.0,
    baseOvertimeRate: 18.1,
  },
  {
    id: 'capo_squadra_esperto',
    category: 'Capi Squadra e Capi Reparto',
    name: 'Capo Squadra Esperto',
    code: 'CS-02',
    parametro: '130,00',
    baseTabellare: 1985.0,
    indennitaRischio: 662.0,
    baseOvertimeRate: 18.8,
  },
  {
    id: 'capo_reparto',
    category: 'Capi Squadra e Capi Reparto',
    name: 'Capo Reparto',
    code: 'CR-01',
    parametro: '136,75',
    baseTabellare: 2085.0,
    indennitaRischio: 715.0,
    baseOvertimeRate: 19.8,
  },
  {
    id: 'capo_reparto_esperto',
    category: 'Capi Squadra e Capi Reparto',
    name: 'Capo Reparto Esperto',
    code: 'CR-02',
    parametro: '142,50',
    baseTabellare: 2175.0,
    indennitaRischio: 752.0,
    baseOvertimeRate: 20.7,
  },

  // --- RUOLO ISPETTORI E DIRETTIVI ANTINCENDI ---
  {
    id: 'vice_ispettore',
    category: 'Ispettori e Direttivi Antincendi',
    name: 'Vice Ispettore Antincendi',
    code: 'IA-01',
    parametro: '134,00',
    baseTabellare: 2045.0,
    indennitaRischio: 685.0,
    baseOvertimeRate: 19.4,
  },
  {
    id: 'ispettore',
    category: 'Ispettori e Direttivi Antincendi',
    name: 'Ispettore Antincendi',
    code: 'IA-02',
    parametro: '141,50',
    baseTabellare: 2160.0,
    indennitaRischio: 728.0,
    baseOvertimeRate: 20.5,
  },
  {
    id: 'ispettore_esperto',
    category: 'Ispettori e Direttivi Antincendi',
    name: 'Ispettore Antincendi Esperto / Sost. Direttore',
    code: 'IA-03',
    parametro: '151,00',
    baseTabellare: 2305.0,
    indennitaRischio: 785.0,
    baseOvertimeRate: 22.0,
  },
  {
    id: 'direttivo_vvf',
    category: 'Ispettori e Direttivi Antincendi',
    name: 'Direttore / Vice Dirigente Antincendi',
    code: 'DIR-01',
    parametro: '168,00',
    baseTabellare: 2565.0,
    indennitaRischio: 865.0,
    baseOvertimeRate: 24.5,
  },

  // --- RUOLO TECNICO-PROFESSIONALE (RTP) / AMMINISTRATIVO PA ---
  {
    id: 'operatore_rtp',
    category: 'Ruolo Tecnico-Professionale (RTP) / PA',
    name: 'Operatore Tecnico / Amministrativo RTP',
    code: 'RTP-01',
    parametro: '102,00',
    baseTabellare: 1565.0,
    indennitaRischio: 315.0,
    baseOvertimeRate: 14.5,
  },
  {
    id: 'assistente_rtp',
    category: 'Ruolo Tecnico-Professionale (RTP) / PA',
    name: 'Assistente Amministrativo / Informatico RTP',
    code: 'RTP-02',
    parametro: '111,00',
    baseTabellare: 1695.0,
    indennitaRischio: 370.0,
    baseOvertimeRate: 15.9,
  },
  {
    id: 'ispettore_rtp',
    category: 'Ruolo Tecnico-Professionale (RTP) / PA',
    name: 'Ispettore Logistico-Gestionale / Informatico RTP',
    code: 'RTP-03',
    parametro: '131,00',
    baseTabellare: 1995.0,
    indennitaRischio: 455.0,
    baseOvertimeRate: 18.7,
  },
  {
    id: 'funzionario_rtp',
    category: 'Ruolo Tecnico-Professionale (RTP) / PA',
    name: 'Funzionario / Direttivo Tecnico RTP',
    code: 'RTP-04',
    parametro: '150,00',
    baseTabellare: 2290.0,
    indennitaRischio: 545.0,
    baseOvertimeRate: 21.5,
  },
];

/**
 * Tipologie di Maggiorazione Straordinario CCNL
 */
export const OVERTIME_TYPES = [
  { id: 'diurno', label: 'Feriale Diurno (+15% CCNL)', multiplier: 1.0 },
  { id: 'notturno_festivo', label: 'Festivo o Notturno (+30% CCNL)', multiplier: 1.13 },
  { id: 'notturno_festivo_max', label: 'Notturno Festivo (+50% CCNL)', multiplier: 1.30 },
];

/**
 * Calcola i coefficienti legati all'anzianità di servizio (in anni)
 */
export function getSeniorityProfile(years = 5) {
  const y = Math.max(0, Number(years) || 0);

  if (y < 5) {
    return {
      bracketLabel: '0–4 anni (Fascia Iniziale)',
      tabellarePct: 0.0,
      assegnoSpecificita: 35.0,
      overtimeSeniorityBoost: 1.0,
    };
  }
  if (y < 9) {
    return {
      bracketLabel: '5–8 anni (1° Scatto Anzianità)',
      tabellarePct: 0.035,
      assegnoSpecificita: 75.0,
      overtimeSeniorityBoost: 1.035,
    };
  }
  if (y < 14) {
    return {
      bracketLabel: '9–13 anni (2° Scatto & Specificità)',
      tabellarePct: 0.07,
      assegnoSpecificita: 120.0,
      overtimeSeniorityBoost: 1.07,
    };
  }
  if (y < 17) {
    return {
      bracketLabel: '14–16 anni (3° Scatto & Specificità)',
      tabellarePct: 0.105,
      assegnoSpecificita: 165.0,
      overtimeSeniorityBoost: 1.105,
    };
  }
  if (y < 22) {
    return {
      bracketLabel: '17–21 anni (4° Scatto & Specificità)',
      tabellarePct: 0.14,
      assegnoSpecificita: 210.0,
      overtimeSeniorityBoost: 1.14,
    };
  }
  if (y < 28) {
    return {
      bracketLabel: '22–27 anni (5° Scatto & Specificità)',
      tabellarePct: 0.18,
      assegnoSpecificita: 260.0,
      overtimeSeniorityBoost: 1.18,
    };
  }
  return {
    bracketLabel: '28+ anni (Fascia Apicale / Max Anzianità)',
    tabellarePct: 0.225,
    assegnoSpecificita: 315.0,
    overtimeSeniorityBoost: 1.225,
  };
}

export function getRoleById(roleId) {
  return PROFESSIONAL_ROLES.find(r => r.id === roleId) || PROFESSIONAL_ROLES[2];
}

/**
 * Calcola la tariffa oraria lorda dello straordinario in base a qualifica, anzianità e fascia
 */
export function getComputedOvertimeRate(roleId, seniorityYears = 5, overtimeTypeId = 'diurno') {
  const role = getRoleById(roleId);
  const seniority = getSeniorityProfile(seniorityYears);
  const otType = OVERTIME_TYPES.find(t => t.id === overtimeTypeId) || OVERTIME_TYPES[0];

  const rate = role.baseOvertimeRate * seniority.overtimeSeniorityBoost * otType.multiplier;
  return Number(rate.toFixed(2));
}

/**
 * Calcola l'IRPEF mensile netta stimata secondo gli scaglioni vigenti (23%, 35%, 43%) + detrazioni lavoro dipendente
 */
function computeMonthlyTaxAndContributions(grossTaxableMonth, grossOvertimeMonth = 0) {
  // 1. Contributi previdenziali a carico del dipendente (INPS gestione ex-INPDAP 8.80% + Fondo Credito 0.35% = 9.15%)
  const inpsRate = 0.0915;
  const totalGross = grossTaxableMonth + grossOvertimeMonth;
  const inpsContributions = totalGross * inpsRate;

  // 2. Imponibile fiscale mensile (proiettato su base annua per scaglioni IRPEF)
  const taxableIrpefMonth = Math.max(0, totalGross - inpsContributions);
  const projectedAnnualTaxable = taxableIrpefMonth * 13;

  let annualIrpefGross = 0;
  if (projectedAnnualTaxable <= 28000) {
    annualIrpefGross = projectedAnnualTaxable * 0.23;
  } else if (projectedAnnualTaxable <= 50000) {
    annualIrpefGross = 28000 * 0.23 + (projectedAnnualTaxable - 28000) * 0.35;
  } else {
    annualIrpefGross = 28000 * 0.23 + 22000 * 0.35 + (projectedAnnualTaxable - 50000) * 0.43;
  }

  // Detrazione lavoro dipendente media annua (art. 13 TUIR)
  let annualDeduction = 0;
  if (projectedAnnualTaxable <= 15000) {
    annualDeduction = 1955;
  } else if (projectedAnnualTaxable <= 28000) {
    annualDeduction = 1910 + 1190 * ((28000 - projectedAnnualTaxable) / 13000);
  } else if (projectedAnnualTaxable <= 50000) {
    annualDeduction = 1910 * ((50000 - projectedAnnualTaxable) / 22000);
  }

  const annualIrpefNet = Math.max(0, annualIrpefGross - annualDeduction);
  const monthlyIrpefNet = annualIrpefNet / 13;

  // Addizionali Regionale + Comunale (~1.75% medio)
  const monthlyLocalTaxes = taxableIrpefMonth * 0.0175;

  const totalDeductions = inpsContributions + monthlyIrpefNet + monthlyLocalTaxes;
  const netPay = totalGross - totalDeductions;

  // Stima quota netta del solo straordinario (aliquota marginale + contributi ~32-38%)
  const marginalRetentionRate = projectedAnnualTaxable > 28000 ? 0.38 : 0.29;
  const netOvertimePay = grossOvertimeMonth * (1 - marginalRetentionRate);

  return {
    totalGross: Number(totalGross.toFixed(2)),
    inpsContributions: Number(inpsContributions.toFixed(2)),
    taxableIrpefMonth: Number(taxableIrpefMonth.toFixed(2)),
    monthlyIrpefNet: Number(monthlyIrpefNet.toFixed(2)),
    monthlyLocalTaxes: Number(monthlyLocalTaxes.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netPay: Number(netPay.toFixed(2)),
    netOvertimePay: Number(netOvertimePay.toFixed(2)),
  };
}

/**
 * Genera i 12 cedolini mensili + la 13ª mensilità + il riepilogo annuale completo
 * partendo dal calendario corrente e dalla configurazione utente.
 */
export function calculateAnnualPayroll(calendar, config = {}) {
  const roleId = config.roleId || 'vigile_esperto';
  const seniorityYears = config.seniorityYears ?? 8;
  const overtimeTypeId = config.overtimeTypeId || 'diurno';
  const mealVoucherValue = Number(config.mealVoucherValue ?? 7.0);

  const role = PROFESSIONAL_ROLES.find(r => r.id === roleId) || PROFESSIONAL_ROLES[2];
  const seniority = getSeniorityProfile(seniorityYears);

  // Tariffa oraria straordinario (usa quella calcolata da qualifica+anzianità o l'override se impostato)
  const computedRate = getComputedOvertimeRate(roleId, seniorityYears, overtimeTypeId);
  const effectiveOvertimeRate = Number(config.overtimeHourlyRate || computedRate);

  // Voci fisse mensili lorde
  const tabellareBase = role.baseTabellare;
  const scattoAnzianita = Number((tabellareBase * seniority.tabellarePct).toFixed(2));
  const indennitaRischio = role.indennitaRischio;
  const assegnoSpecificita = seniority.assegnoSpecificita;
  const indennitaPresenzaGiornaliera = 4.2; // Indennità giornaliera di presenza/servizio esterno

  const monthlySlips = Array.from({ length: 12 }, (_, monthIdx) => {
    const mDays = calendar.filter(d => d.month === monthIdx);
    const workDays = mDays.filter(d => d.type === DAY_TYPES.WORK).length;
    const ferieDays = mDays.filter(d => d.type === DAY_TYPES.FERIE).length;
    const permessiDays = mDays.filter(
      d => d.type === DAY_TYPES.PERMESSO_PERSONALE || d.type === DAY_TYPES.PERMESSO_MEDICO
    ).length;
    const workedHours = Number(mDays.reduce((acc, d) => acc + d.workedHours, 0).toFixed(1));
    const overtimeHours = Number(
      mDays.reduce((acc, d) => acc + (d.type === DAY_TYPES.WORK ? (d.overtimeHours || 0) : 0), 0).toFixed(1)
    );
    const overtimeDays = mDays.filter(d => d.type === DAY_TYPES.WORK && (d.overtimeHours || 0) > 0).length;

    // Giorni in cui si matura il Buono Pasto:
    // - Giorni lavorati con turno lungo >= 7.2h (es. rientri da 9h o turni 7h12m)
    // - Giorni lavorati da 6h in cui si effettuano almeno 2 ore di straordinario (superando le 6h con pausa)
    const mealVouchersCount = mDays.filter(
      d => d.type === DAY_TYPES.WORK && (d.scheduledHours >= 7.2 || (d.overtimeHours || 0) >= 2)
    ).length;
    const mealVouchersAmount = Number((mealVouchersCount * mealVoucherValue).toFixed(2));

    const indennitaPresenzaMese = Number((workDays * indennitaPresenzaGiornaliera).toFixed(2));
    const grossFixedMonth = Number(
      (tabellareBase + scattoAnzianita + indennitaRischio + assegnoSpecificita + indennitaPresenzaMese).toFixed(2)
    );
    const grossOvertimeMonth = Number((overtimeHours * effectiveOvertimeRate).toFixed(2));

    const taxResult = computeMonthlyTaxAndContributions(grossFixedMonth, grossOvertimeMonth);

    return {
      monthIndex: monthIdx,
      monthName: MONTH_NAMES_IT[monthIdx],
      workDays,
      ferieDays,
      permessiDays,
      workedHours,
      overtimeHours,
      overtimeDays,
      effectiveOvertimeRate,
      tabellareBase,
      scattoAnzianita,
      indennitaRischio,
      assegnoSpecificita,
      indennitaPresenzaMese,
      grossFixedMonth,
      grossOvertimeMonth,
      ...taxResult,
      mealVouchersCount,
      mealVouchersAmount,
      totalTakeHomeWithVouchers: Number((taxResult.netPay + mealVouchersAmount).toFixed(2)),
    };
  });

  // Calcolo 13ª Mensilità (Dicembre): comprende Tabellare + Scatto Anzianità + Indennità Rischio/Amministrazione
  const tredicesimaGross = Number((tabellareBase + scattoAnzianita + indennitaRischio).toFixed(2));
  const tredicesimaTax = computeMonthlyTaxAndContributions(tredicesimaGross, 0);

  // Totali Annuali
  const annualGrossFixed = Number(
    (monthlySlips.reduce((acc, m) => acc + m.grossFixedMonth, 0) + tredicesimaGross).toFixed(2)
  );
  const annualGrossOvertime = Number(monthlySlips.reduce((acc, m) => acc + m.grossOvertimeMonth, 0).toFixed(2));
  const annualGrossTotal = Number((annualGrossFixed + annualGrossOvertime).toFixed(2));
  const annualNetOvertime = Number(monthlySlips.reduce((acc, m) => acc + m.netOvertimePay, 0).toFixed(2));
  const annualNetPay = Number(
    (monthlySlips.reduce((acc, m) => acc + m.netPay, 0) + tredicesimaTax.netPay).toFixed(2)
  );
  const annualMealVouchersCount = monthlySlips.reduce((acc, m) => acc + m.mealVouchersCount, 0);
  const annualMealVouchersAmount = Number(
    monthlySlips.reduce((acc, m) => acc + m.mealVouchersAmount, 0).toFixed(2)
  );
  const annualTotalDeductions = Number(
    (monthlySlips.reduce((acc, m) => acc + m.totalDeductions, 0) + tredicesimaTax.totalDeductions).toFixed(2)
  );
  const annualTotalOvertimeHours = Number(
    monthlySlips.reduce((acc, m) => acc + m.overtimeHours, 0).toFixed(1)
  );
  const averageMonthlyNet = Number((annualNetPay / 12).toFixed(2));

  return {
    role,
    seniority,
    effectiveOvertimeRate,
    computedRate,
    monthlySlips,
    tredicesima: {
      monthName: '13ª Mensilità (Dicembre)',
      grossFixedMonth: tredicesimaGross,
      grossOvertimeMonth: 0,
      ...tredicesimaTax,
    },
    summary: {
      annualGrossFixed,
      annualGrossOvertime,
      annualGrossTotal,
      annualNetOvertime,
      annualNetPay,
      averageMonthlyNet,
      annualMealVouchersCount,
      annualMealVouchersAmount,
      annualTotalTakeHome: Number((annualNetPay + annualMealVouchersAmount).toFixed(2)),
      annualTotalDeductions,
      annualTotalOvertimeHours,
    },
  };
}
