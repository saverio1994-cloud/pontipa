// Motore di Ottimizzazione Calendario Lavorativo Annuale
import { getNationalHolidays, formatDateKey } from './holidays.js';

export const SCHEDULE_MODES = {
  THREE_SIX_TWO_NINE: '3x6_2x9', // 3 giorni da 6h e 2 giorni da 9h = 36h
  FIVE_SEVEN_TWELVE: '5x7.2',    // 5 giorni da 7h 12m = 36h
};

export const OPTIMIZATION_GOALS = {
  MIN_WORK: 'min_work',         // Lavorare il meno possibile (massimizza riposo e ore risparmiate)
  MAX_OVERTIME: 'max_overtime', // Guadagnare il più possibile con gli straordinari
};

export const DAY_TYPES = {
  WORK: 'work',
  WEEKEND: 'weekend',
  HOLIDAY: 'holiday',
  PATRON: 'patron',
  FERIE: 'ferie',
  PERMESSO_PERSONALE: 'permesso_personale',
  PERMESSO_MEDICO: 'permesso_medico',
};

export const DAY_NAMES_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
export const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Calcola l'orario base previsto per un giorno feriale.
 * @param {number} dayOfWeek - 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab, 0=Dom
 * @param {string} scheduleMode
 * @param {number[]} nineHourDays - Array di giorni (1-5) che hanno orario da 9h
 */
export function getScheduledHours(dayOfWeek, scheduleMode, nineHourDays = [2, 4]) {
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0; // Weekend

  if (scheduleMode === SCHEDULE_MODES.FIVE_SEVEN_TWELVE) {
    return 7.2; // 7 ore e 12 minuti = 7.2 ore
  }

  // 3x6h + 2x9h
  if (nineHourDays.includes(dayOfWeek)) {
    return 9;
  }
  return 6;
}

/**
 * Genera il calendario base dell'anno con festività
 */
export function generateBaseCalendar(year, config) {
  const { scheduleMode, nineHourDays, patronConfig } = config;
  const holidays = getNationalHolidays(year, patronConfig);
  const calendar = [];

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateKey = formatDateKey(current);
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayInfo = holidays[dateKey];

    let type = DAY_TYPES.WORK;
    let label = '';
    let scheduledHours = 0;

    if (isWeekend) {
      type = DAY_TYPES.WEEKEND;
      label = dayOfWeek === 0 ? 'Domenica' : 'Sabato';
      scheduledHours = 0;
    } else if (holidayInfo) {
      type = holidayInfo.type === 'patron' ? DAY_TYPES.PATRON : DAY_TYPES.HOLIDAY;
      label = holidayInfo.name;
      scheduledHours = 0;
    } else {
      type = DAY_TYPES.WORK;
      label = 'Lavoro';
      scheduledHours = getScheduledHours(dayOfWeek, scheduleMode, nineHourDays);
    }

    calendar.push({
      date: new Date(current),
      dateKey,
      day: current.getDate(),
      month: current.getMonth(),
      year: current.getFullYear(),
      dayOfWeek,
      dayName: DAY_NAMES_IT[dayOfWeek],
      type,
      originalType: type,
      label,
      scheduledHours,
      workedHours: type === DAY_TYPES.WORK ? scheduledHours : 0,
      overtimeHours: 0,
      overtimeNote: '',
      usedPermitHours: 0,
      bridgeInfo: null,
      customNote: '',
    });

    current.setDate(current.getDate() + 1);
  }

  return calendar;
}

/**
 * Trova i blocchi di ponti e opportunità di massimizzazione
 */
export function optimizeAnnualCalendar(initialCalendar, options = {}) {
  const {
    scheduleMode = SCHEDULE_MODES.THREE_SIX_TWO_NINE,
    optimizationGoal = OPTIMIZATION_GOALS.MIN_WORK,
    minimizeCommute = true,
    totalFerie = 30,
    personalPermitHours = 18,
    medicalPermitHours = 18,
    reserveSummerWeeks = 2, // Settimane ad agosto attorno al 15 agosto
    maxOvertimeHoursYear = 180,
    overtimeHourlyRate = 16.5,
    maxDailyOvertimeOn6h = 3,
    maxDailyOvertimeOn9h = 1,
  } = options;

  const isMaxOvertime = optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME;

  // Clona il calendario per lavorare senza mutare l'originale
  const cal = initialCalendar.map(day => ({
    ...day,
    type: day.originalType,
    label: day.originalType === DAY_TYPES.WORK ? 'Lavoro' : day.label,
    workedHours: day.originalType === DAY_TYPES.WORK ? day.scheduledHours : 0,
    overtimeHours: 0,
    overtimeNote: '',
    usedPermitHours: 0,
    bridgeInfo: null,
  }));

  let ferieLeft = totalFerie;
  let personalHoursLeft = personalPermitHours;
  let medicalHoursLeft = medicalPermitHours;

  // Helper per assegnare assenza a un giorno lavorativo
  const assignAbsence = (index, absenceType, reason = '') => {
    const d = cal[index];
    if (d.type !== DAY_TYPES.WORK) return false;

    if (absenceType === DAY_TYPES.FERIE) {
      if (ferieLeft <= 0) return false;
      ferieLeft--;
      d.type = DAY_TYPES.FERIE;
      d.label = 'Ferie';
      d.workedHours = 0;
      d.overtimeHours = 0;
      d.bridgeInfo = reason;
      return true;
    }

    if (absenceType === DAY_TYPES.PERMESSO_PERSONALE) {
      const hoursToCover = d.scheduledHours;
      if (personalHoursLeft < hoursToCover) return false;
      personalHoursLeft = Number((personalHoursLeft - hoursToCover).toFixed(1));
      d.type = DAY_TYPES.PERMESSO_PERSONALE;
      d.label = `Permesso Personale (${hoursToCover}h)`;
      d.workedHours = 0;
      d.overtimeHours = 0;
      d.usedPermitHours = hoursToCover;
      d.bridgeInfo = reason;
      return true;
    }

    if (absenceType === DAY_TYPES.PERMESSO_MEDICO) {
      const hoursToCover = d.scheduledHours;
      if (medicalHoursLeft < hoursToCover) return false;
      medicalHoursLeft = Number((medicalHoursLeft - hoursToCover).toFixed(1));
      d.type = DAY_TYPES.PERMESSO_MEDICO;
      d.label = `Permesso Visita Medica (${hoursToCover}h)`;
      d.workedHours = 0;
      d.overtimeHours = 0;
      d.usedPermitHours = hoursToCover;
      d.bridgeInfo = reason;
      return true;
    }

    return false;
  };

  // Helper per decidere il tipo di assenza migliore:
  // - Se è attiva la clausola "Venire al lavoro meno volte possibile" (minimizeCommute = true),
  //   i permessi (18h+18h) vengono usati ESCLUSIVAMENTE sui giorni da 6h per ottenere 6 intere giornate libere (-6 viaggi)!
  // - Se invece siamo in "Massimizza Straordinari" SENZA clausola minimi accessi (minimizeCommute = false),
  //   usiamo i permessi sui giorni da 9h (4 giornate da 9h coperte) per lasciare liberi in servizio più giorni da 6h
  //   su cui fare fino a +3h di straordinario retribuito!
  const pickBestAbsenceType = (index) => {
    const d = cal[index];
    if (scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE) {
      const targetPermitHours = (!minimizeCommute && isMaxOvertime) ? 9 : 6;
      if (d.scheduledHours === targetPermitHours) {
        if (personalHoursLeft >= targetPermitHours) return DAY_TYPES.PERMESSO_PERSONALE;
        if (medicalHoursLeft >= targetPermitHours) return DAY_TYPES.PERMESSO_MEDICO;
      }
    } else {
      // In 5x7.2h, se abbiamo abbastanza ore di permesso per coprire la giornata (7.2h)
      if (personalHoursLeft >= 7.2) return DAY_TYPES.PERMESSO_PERSONALE;
      if (medicalHoursLeft >= 7.2) return DAY_TYPES.PERMESSO_MEDICO;
    }
    if (ferieLeft > 0) return DAY_TYPES.FERIE;
    return null;
  };

  // 1. Identifica e pianifica i Grandi Ponti Nazionali Prioritari
  // A. Natale / Capodanno / Epifania (24 Dicembre - 6 Gennaio)
  const planWinterHolidayCluster = () => {
    const year = cal[0].year;
    // Date dal 24 Dicembre al 6 Gennaio dell'anno
    const decDays = cal.filter(d => d.month === 11 && d.day >= 23);
    const janDays = cal.filter(d => d.month === 0 && d.day <= 6);

    const winterTarget = [...decDays, ...janDays];
    const workDaysInWinter = winterTarget.filter(d => d.type === DAY_TYPES.WORK);

    if (workDaysInWinter.length > 0 && workDaysInWinter.length <= ferieLeft + 4) {
      workDaysInWinter.forEach(d => {
        const idx = cal.findIndex(c => c.dateKey === d.dateKey);
        const absence = pickBestAbsenceType(idx);
        if (absence) {
          assignAbsence(idx, absence, 'Super Ponte Invernale (Natale - Capodanno - Epifania)');
        }
      });
    }
  };

  // B. Ponte 25 Aprile - 1 Maggio
  const planSpringCluster = () => {
    // Intervallo tra il 24 Aprile e il 2 Maggio
    const springDays = cal.filter(d => {
      if (d.month === 3 && d.day >= 24) return true; // Fine Aprile
      if (d.month === 4 && d.day <= 4) return true;  // Inizio Maggio
      return false;
    });

    const workDays = springDays.filter(d => d.type === DAY_TYPES.WORK);
    // Se ci sono tra 1 e 5 giorni lavorativi tra 25 Aprile e 1 Maggio, creiamo il super ponte
    if (workDays.length > 0 && workDays.length <= 4 && workDays.length <= ferieLeft) {
      workDays.forEach(d => {
        const idx = cal.findIndex(c => c.dateKey === d.dateKey);
        const absence = pickBestAbsenceType(idx);
        if (absence) {
          assignAbsence(idx, absence, 'Super Ponte della Liberazione & Festa del Lavoro');
        }
      });
    }
  };

  // C. Blocco Estivo (Settimane attorno a Ferragosto, 15 Agosto)
  const planSummerCluster = () => {
    if (reserveSummerWeeks <= 0) return;

    // Troviamo il 15 Agosto
    const ferragostoIdx = cal.findIndex(d => d.month === 7 && d.day === 15);
    if (ferragostoIdx === -1) return;

    // Prendiamo la settimana di Ferragosto + una settimana adiacente (es. dal lunedì prima al venerdì dopo)
    const ferragostoDate = cal[ferragostoIdx].date;
    const ferragostoDow = cal[ferragostoIdx].dayOfWeek; // 0=dom, 1=lun ...

    // Lunedì della settimana di ferragosto
    const diffToMonday = ferragostoDow === 0 ? -6 : 1 - ferragostoDow;
    const mondayFerragostoIdx = ferragostoIdx + diffToMonday;

    // Se vogliamo 2 settimane: prendiamo dal lunedì prima o facciamo 2 settimane consecutive
    let startIdx = mondayFerragostoIdx;
    let endIdx = mondayFerragostoIdx + 11; // 2 settimane da lun a ven successivo

    if (reserveSummerWeeks === 2) {
      // 2 settimane intere
      startIdx = mondayFerragostoIdx - 7;
      endIdx = mondayFerragostoIdx + 6;
    }

    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(cal.length - 1, endIdx);

    for (let i = startIdx; i <= endIdx; i++) {
      if (cal[i].type === DAY_TYPES.WORK && ferieLeft > 0) {
        // In estate preferiamo usare ferie (i permessi medici/personali sono ideali per i ponti o giorni singoli)
        assignAbsence(i, DAY_TYPES.FERIE, 'Ferie Estive di Ferragosto');
      }
    }
  };

  // Esegui i cluster principali
  planWinterHolidayCluster();
  planSpringCluster();
  planSummerCluster();

  // 2. Rileva tutti i ponti isolati da 1 giorno (Giovedì festivo -> Venerdì ferie; Martedì festivo -> Lunedì ferie)
  // ROI = 4.0 (1 giorno di ferie/permesso = 4 giorni consecutivi a casa!)
  const scanAndFillBridges = (maxGapDays = 2) => {
    for (let gap = 1; gap <= maxGapDays; gap++) {
      for (let i = 0; i < cal.length - gap - 1; i++) {
        const dayBefore = cal[i];
        const dayAfter = cal[i + gap + 1];

        // Verifichiamo se prima c'è un riposo/festa e dopo c'è un riposo/festa
        const isRestBefore = dayBefore.type !== DAY_TYPES.WORK;
        const isRestAfter = dayAfter.type !== DAY_TYPES.WORK;

        if (isRestBefore && isRestAfter) {
          // Controlliamo i giorni in mezzo
          let allWork = true;
          for (let g = 1; g <= gap; g++) {
            if (cal[i + g].type !== DAY_TYPES.WORK) {
              allWork = false;
              break;
            }
          }

          if (allWork) {
            // È un ponte candidato perfetto!
            let canCoverAll = true;
            for (let g = 1; g <= gap; g++) {
              const targetIdx = i + g;
              const absType = pickBestAbsenceType(targetIdx);
              if (!absType) {
                canCoverAll = false;
                break;
              }
            }

            if (canCoverAll) {
              const bridgeName = gap === 1 ? 'Ponte Secco (1 giorno = 4 liberi)' : `Ponte Breve (${gap} giorni)`;
              for (let g = 1; g <= gap; g++) {
                const targetIdx = i + g;
                const absType = pickBestAbsenceType(targetIdx);
                assignAbsence(targetIdx, absType, bridgeName);
              }
            }
          }
        }
      }
    }
  };

  // Esegui scansione ponti da 1 giorno e poi da 2 giorni
  scanAndFillBridges(1);
  scanAndFillBridges(2);

  // 3. Usa le ore di permesso rimanenti (Personale & Medico)
  const allocateRemainingPermits = () => {
    if (personalHoursLeft <= 0 && medicalHoursLeft <= 0) return;

    // Se siamo in MAX_OVERTIME e SENZA clausola minimi accessi (minimizeCommute = false),
    // usiamo i permessi sui giorni da 9h per abbattere i rientri ordinari non retribuiti extra e lasciare liberi i giorni da 6h!
    const targetHoursIn3x6 = (!minimizeCommute && isMaxOvertime) ? 9 : 6;

    const preferredDays = [];
    const fallbackDays = [];
    cal.forEach((d, idx) => {
      if (d.type === DAY_TYPES.WORK) {
        if (scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE) {
          if (d.scheduledHours === targetHoursIn3x6) {
            if (d.dayOfWeek === 5 || d.dayOfWeek === 1) preferredDays.unshift(idx);
            else preferredDays.push(idx);
          } else {
            fallbackDays.push(idx);
          }
        } else {
          if (d.dayOfWeek === 5 || d.dayOfWeek === 1) preferredDays.push(idx);
          else fallbackDays.push(idx);
        }
      }
    });

    const candidates = [...preferredDays, ...fallbackDays];
    const neededSlots = scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE ? (targetHoursIn3x6 === 6 ? 6 : 4) : 5;
    const stride = Math.max(1, Math.floor(preferredDays.length / Math.max(1, neededSlots)));
    const selectedIndices = [];
    for (let s = 0; s < preferredDays.length && selectedIndices.length < neededSlots; s += stride) {
      selectedIndices.push(preferredDays[s]);
    }
    for (const c of candidates) {
      if (!selectedIndices.includes(c)) selectedIndices.push(c);
    }

    for (const idx of selectedIndices) {
      if (personalHoursLeft <= 0 && medicalHoursLeft <= 0) break;
      const d = cal[idx];
      if (d.type !== DAY_TYPES.WORK) continue;

      if (scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE) {
        const h = d.scheduledHours;
        if (personalHoursLeft >= h) {
          const reason = h === 6
            ? 'Weekend Lungo / Minimi Accessi (Permesso Personale 6h)'
            : 'Abbattimento Turno 9h pro-Straordinari (Permesso Personale 9h)';
          assignAbsence(idx, DAY_TYPES.PERMESSO_PERSONALE, reason);
          continue;
        }
        if (medicalHoursLeft >= h) {
          const reason = h === 6
            ? 'Weekend Lungo / Minimi Accessi (Permesso Medico 6h)'
            : 'Abbattimento Turno 9h pro-Straordinari (Permesso Medico 9h)';
          assignAbsence(idx, DAY_TYPES.PERMESSO_MEDICO, reason);
          continue;
        }
      } else {
        if (personalHoursLeft >= 7.2) {
          assignAbsence(idx, DAY_TYPES.PERMESSO_PERSONALE, 'Weekend Lungo (Permesso Personale 7h12m)');
          continue;
        }
        if (medicalHoursLeft >= 7.2) {
          assignAbsence(idx, DAY_TYPES.PERMESSO_MEDICO, 'Weekend Lungo (Permesso Medico 7h12m)');
          continue;
        }
      }
    }
  };

  allocateRemainingPermits();

  // 4. Allocazione Ferie Rimanenti in base all'Obiettivo e alla Clausola Minimi Accessi
  const allocateRemainingFerie = () => {
    if (ferieLeft <= 0) return;

    // A. Se l'obiettivo è GUADAGNARE CON GLI STRAORDINARI (o lavorare meno ORE complessive senza dare priorità ai soli venerdì da 6h):
    // Allocare le ferie residue sui GIORNI DA 9 ORE (es. Martedì/Giovedì) è matematicamente vincente:
    // - Cancella 9 ore di lavoro ordinario spendendo 1 solo giorno di ferie (risparmio +3h/giorno)
    // - Lascia in servizio le giornate corte da 6h in cui il dipendente può fare fino a +3h di straordinario retribuito!
    // - Riduce comunque di 1 unità i viaggi casa-lavoro!
    if (isMaxOvertime || !minimizeCommute) {
      const nineHourIndices = [];
      cal.forEach((d, idx) => {
        if (d.type === DAY_TYPES.WORK && d.scheduledHours === 9) {
          nineHourIndices.push(idx);
        }
      });

      if (nineHourIndices.length > 0 && ferieLeft > 0) {
        const step = Math.max(1, Math.floor(nineHourIndices.length / ferieLeft));
        const chosen9h = [];
        for (let i = 0; i < nineHourIndices.length; i += step) {
          chosen9h.push(nineHourIndices[i]);
        }
        for (const idx of nineHourIndices) {
          if (!chosen9h.includes(idx)) chosen9h.push(idx);
        }
        for (const idx of chosen9h) {
          if (ferieLeft <= 0) break;
          if (cal[idx].type === DAY_TYPES.WORK) {
            const reason = isMaxOvertime
              ? 'Arbitraggio Straordinari: Ferie su Turno 9h (preserva turni 6h per straordinario)'
              : 'Massimo Risparmio Orario: Ferie su Turno Lungo da 9h';
            assignAbsence(idx, DAY_TYPES.FERIE, reason);
          }
        }
      }
    }

    // B. Raccoglie i venerdì lavorativi rimasti (per weekend lunghi)
    const availableFridays = [];
    cal.forEach((d, idx) => {
      if (d.type === DAY_TYPES.WORK && d.dayOfWeek === 5) {
        availableFridays.push(idx);
      }
    });

    if (availableFridays.length > 0 && ferieLeft > 0) {
      const step = Math.max(1, Math.floor(availableFridays.length / ferieLeft));
      const chosen = [];
      for (let i = 0; i < availableFridays.length; i += step) {
        chosen.push(availableFridays[i]);
      }
      for (const idx of availableFridays) {
        if (!chosen.includes(idx)) chosen.push(idx);
      }
      for (const idx of chosen) {
        if (ferieLeft <= 0) break;
        if (cal[idx].type === DAY_TYPES.WORK) {
          assignAbsence(idx, DAY_TYPES.FERIE, 'Weekend Lungo (Venerdì di Ferie)');
        }
      }
    }

    // C. Se avanzano ancora, prova con i Lunedì
    const availableMondays = [];
    cal.forEach((d, idx) => {
      if (d.type === DAY_TYPES.WORK && d.dayOfWeek === 1) {
        availableMondays.push(idx);
      }
    });

    for (const idx of availableMondays) {
      if (ferieLeft <= 0) break;
      if (cal[idx].type === DAY_TYPES.WORK) {
        assignAbsence(idx, DAY_TYPES.FERIE, 'Weekend Lungo (Lunedì di Ferie)');
      }
    }

    // D. Fallback su qualsiasi giorno da 9h o feriale rimasto
    for (let i = 0; i < cal.length; i++) {
      if (ferieLeft <= 0) break;
      if (cal[i].type === DAY_TYPES.WORK && cal[i].scheduledHours === 9) {
        assignAbsence(i, DAY_TYPES.FERIE, 'Ferie Strategica su Giornata da 9 Ore');
      }
    }
    for (let i = 0; i < cal.length; i++) {
      if (ferieLeft <= 0) break;
      if (cal[i].type === DAY_TYPES.WORK) {
        assignAbsence(i, DAY_TYPES.FERIE, 'Congedo Ordinario');
      }
    }
  };

  allocateRemainingFerie();

  // 4b. Pianificazione Straordinari (quando l'obiettivo è MAX_OVERTIME)
  const allocateOvertime = () => {
    if (!isMaxOvertime || maxOvertimeHoursYear <= 0) return;

    let overtimeLeft = Number(maxOvertimeHoursYear);

    // Priorità 1: Giorni lavorativi corti da 6h (o 7.2h in 5x7.2)
    // Con la clausola "Venire al lavoro meno volte possibile" (minimizeCommute = true),
    // concentriamo il massimo di ore giornaliere (+3h) nel minor numero di giornate già in presenza!
    const shortWorkIndices = [];
    const longWorkIndices = [];

    cal.forEach((d, idx) => {
      if (d.type === DAY_TYPES.WORK) {
        if (d.scheduledHours <= 7.2) {
          shortWorkIndices.push(idx);
        } else {
          longWorkIndices.push(idx);
        }
      }
    });

    const dailyCapShort = scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE
      ? Number(maxDailyOvertimeOn6h || 3)
      : Math.min(2, Number(maxDailyOvertimeOn6h || 2));

    if (shortWorkIndices.length > 0 && dailyCapShort > 0) {
      const daysNeeded = Math.ceil(overtimeLeft / dailyCapShort);
      const stride = minimizeCommute
        ? Math.max(1, Math.floor(shortWorkIndices.length / Math.max(1, daysNeeded)))
        : 1;

      const orderedShort = [];
      for (let i = 0; i < shortWorkIndices.length; i += stride) {
        orderedShort.push(shortWorkIndices[i]);
      }
      for (const idx of shortWorkIndices) {
        if (!orderedShort.includes(idx)) orderedShort.push(idx);
      }

      for (const idx of orderedShort) {
        if (overtimeLeft <= 0) break;
        const hrs = Math.min(dailyCapShort, overtimeLeft);
        cal[idx].overtimeHours = Number(hrs.toFixed(1));
        cal[idx].overtimeNote = minimizeCommute
          ? `Straordinario concentrato (+${hrs}h su turno breve, zero viaggi extra)`
          : `Rientro Straordinario su turno da ${cal[idx].scheduledHours}h (+${hrs}h + Buono Pasto)`;
        overtimeLeft = Number((overtimeLeft - hrs).toFixed(1));
      }
    }

    // Priorità 2: Giorni da 9h (se il budget annuo straordinari eccede la capienza dei giorni brevi)
    const dailyCapLong = Number(maxDailyOvertimeOn9h || 1);
    if (overtimeLeft > 0 && longWorkIndices.length > 0 && dailyCapLong > 0) {
      for (const idx of longWorkIndices) {
        if (overtimeLeft <= 0) break;
        const hrs = Math.min(dailyCapLong, overtimeLeft);
        cal[idx].overtimeHours = Number(hrs.toFixed(1));
        cal[idx].overtimeNote = `Straordinario su rientro lungo (+${hrs}h)`;
        overtimeLeft = Number((overtimeLeft - hrs).toFixed(1));
      }
    }
  };

  allocateOvertime();

  // 5. Analisi statistica dei blocchi consecutivi di riposo (Streaks e Ponti) e Straordinari
  const { bridgeSummaries, stats } = calculateCalendarMetrics(cal, {
    totalFerie,
    personalPermitHours,
    medicalPermitHours,
    overtimeHourlyRate,
    maxOvertimeHoursYear,
    optimizationGoal,
    minimizeCommute,
  });

  return {
    calendar: cal,
    bridgeSummaries,
    stats,
  };
}

/**
 * Calcola dinamicamente i ponti (bridgeSummaries) e gli indicatori statistici (stats)
 * a partire da qualsiasi stato del calendario (sia ottimizzato sia modificato manualmente).
 */
export function calculateCalendarMetrics(cal, options = {}) {
  const {
    totalFerie = 30,
    personalPermitHours = 18,
    medicalPermitHours = 18,
    overtimeHourlyRate = 16.5,
    maxOvertimeHoursYear = 180,
  } = options;

  let currentStreak = [];
  let maxStreak = 0;
  const allRestPeriods = [];

  for (let i = 0; i < cal.length; i++) {
    const isRest = cal[i].type !== DAY_TYPES.WORK;
    if (isRest) {
      currentStreak.push(cal[i]);
    } else {
      if (currentStreak.length > 0) {
        allRestPeriods.push([...currentStreak]);
        if (currentStreak.length > maxStreak) {
          maxStreak = currentStreak.length;
        }
        currentStreak = [];
      }
    }
  }
  if (currentStreak.length > 0) {
    allRestPeriods.push([...currentStreak]);
    if (currentStreak.length > maxStreak) {
      maxStreak = currentStreak.length;
    }
  }

  // Identifica i "Super Ponti" (periodi di riposo >= 3 giorni che contengono almeno 1 giorno di ferie o permesso)
  const bridgeSummaries = allRestPeriods
    .filter(period => {
      const hasLeave = period.some(d =>
        d.type === DAY_TYPES.FERIE ||
        d.type === DAY_TYPES.PERMESSO_PERSONALE ||
        d.type === DAY_TYPES.PERMESSO_MEDICO
      );
      return period.length >= 3 && hasLeave;
    })
    .map((period, index) => {
      const startDate = period[0].date instanceof Date ? period[0].date : new Date(period[0].date);
      const endDate = period[period.length - 1].date instanceof Date ? period[period.length - 1].date : new Date(period[period.length - 1].date);
      const ferieUsed = period.filter(d => d.type === DAY_TYPES.FERIE).length;
      const permessiPers = period.filter(d => d.type === DAY_TYPES.PERMESSO_PERSONALE).length;
      const permessiMed = period.filter(d => d.type === DAY_TYPES.PERMESSO_MEDICO).length;
      const leavesSpent = ferieUsed + permessiPers + permessiMed;
      const holidaysCount = period.filter(d => d.type === DAY_TYPES.HOLIDAY || d.type === DAY_TYPES.PATRON).length;
      const weekendDays = period.filter(d => d.type === DAY_TYPES.WEEKEND).length;

      // Nome / descrizione ponte
      const holidayNames = period
        .filter(d => d.originalType === DAY_TYPES.HOLIDAY || d.originalType === DAY_TYPES.PATRON)
        .map(d => d.label);

      let title = `Ponte #${index + 1}`;
      if (holidayNames.length > 0) {
        title = `Ponte di ${holidayNames.join(' & ')}`;
      } else if (period.some(d => d.month === 7)) {
        title = 'Ferie Estive di Ferragosto';
      } else {
        title = `Weekend Lungo (${period.length} giorni)`;
      }

      const roi = leavesSpent > 0 ? (period.length / leavesSpent).toFixed(1) : period.length.toFixed(1);

      return {
        id: `bridge-${index}`,
        title,
        startDate: formatDateKey(startDate),
        endDate: formatDateKey(endDate),
        totalRestDays: period.length,
        leavesSpent,
        ferieUsed,
        permessiPers,
        permessiMed,
        holidaysCount,
        weekendDays,
        roi,
        periodDays: period,
      };
    })
    .sort((a, b) => b.totalRestDays - a.totalRestDays);

  // Calcolo KPI riassuntivi
  const totalDaysInYear = cal.length;
  const workDays = cal.filter(d => d.type === DAY_TYPES.WORK).length;
  const totalRestDays = totalDaysInYear - workDays;
  const totalFerieUsed = cal.filter(d => d.type === DAY_TYPES.FERIE).length;
  const permessiPersDays = cal.filter(d => d.type === DAY_TYPES.PERMESSO_PERSONALE).length;
  const permessiMedDays = cal.filter(d => d.type === DAY_TYPES.PERMESSO_MEDICO).length;
  const permessiDaysUsed = permessiPersDays + permessiMedDays;
  const commuteDaysSaved = totalFerieUsed + permessiDaysUsed;

  const rawPermessiPersUsed = cal.filter(d => d.type === DAY_TYPES.PERMESSO_PERSONALE).reduce((acc, d) => acc + d.usedPermitHours, 0);
  const rawPermessiMedUsed = cal.filter(d => d.type === DAY_TYPES.PERMESSO_MEDICO).reduce((acc, d) => acc + d.usedPermitHours, 0);
  const totalPermessiPersUsed = Number(rawPermessiPersUsed.toFixed(1));
  const totalPermessiMedUsed = Number(rawPermessiMedUsed.toFixed(1));
  const totalWorkedHours = cal.reduce((acc, d) => acc + d.workedHours, 0);
  const totalOvertimeHours = Number(cal.reduce((acc, d) => acc + (d.type === DAY_TYPES.WORK ? (d.overtimeHours || 0) : 0), 0).toFixed(1));
  const overtimeDaysCount = cal.filter(d => d.type === DAY_TYPES.WORK && (d.overtimeHours || 0) > 0).length;
  const totalOvertimePay = (totalOvertimeHours * (overtimeHourlyRate || 16.5)).toFixed(2);
  const nineHourWorkDaysLeft = cal.filter(d => d.type === DAY_TYPES.WORK && d.scheduledHours === 9).length;
  const sixHourWorkDaysLeft = cal.filter(d => d.type === DAY_TYPES.WORK && d.scheduledHours === 6).length;

  const totalSavedHours = cal.reduce((acc, d) => {
    if (d.type === DAY_TYPES.FERIE || d.type === DAY_TYPES.PERMESSO_PERSONALE || d.type === DAY_TYPES.PERMESSO_MEDICO) {
      return acc + d.scheduledHours;
    }
    return acc;
  }, 0);

  return {
    bridgeSummaries,
    stats: {
      totalDaysInYear,
      workDays,
      workDaysPercentage: ((workDays / totalDaysInYear) * 100).toFixed(1),
      totalRestDays,
      restDaysPercentage: ((totalRestDays / totalDaysInYear) * 100).toFixed(1),
      maxConsecutiveRestDays: maxStreak,
      totalFerieUsed,
      ferieRemaining: Math.max(0, totalFerie - totalFerieUsed),
      permessiDaysUsed,
      commuteDaysSaved,
      totalPermessiPersUsed,
      personalHoursRemaining: Math.max(0, Number((personalPermitHours - totalPermessiPersUsed).toFixed(1))),
      totalPermessiMedUsed,
      medicalHoursRemaining: Math.max(0, Number((medicalPermitHours - totalPermessiMedUsed).toFixed(1))),
      totalWorkedHours: totalWorkedHours.toFixed(1),
      totalSavedHours: totalSavedHours.toFixed(1),
      totalOvertimeHours,
      maxOvertimeHoursYear,
      overtimeDaysCount,
      totalOvertimePay,
      nineHourWorkDaysLeft,
      sixHourWorkDaysLeft,
      bridgesCount: bridgeSummaries.length,
    },
  };
}
