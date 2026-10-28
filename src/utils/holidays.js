// Calcolo festività nazionali italiane e patroni locali

export function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const ITALIAN_PATRON_PRESETS = [
  { city: 'Nessuno', month: 0, day: 0, name: 'Nessun Patrono' },
  { city: 'Roma', month: 6, day: 29, name: 'Santi Pietro e Paolo' },
  { city: 'Milano', month: 12, day: 7, name: "Sant'Ambrogio" },
  { city: 'Napoli', month: 9, day: 19, name: 'San Gennaro' },
  { city: 'Torino', month: 6, day: 24, name: 'San Giovanni Battista' },
  { city: 'Firenze', month: 6, day: 24, name: 'San Giovanni Battista' },
  { city: 'Bologna', month: 10, day: 4, name: 'San Petronio' },
  { city: 'Genova', month: 6, day: 24, name: 'San Giovanni Battista' },
  { city: 'Palermo', month: 7, day: 15, name: 'Santa Rosalia' },
  { city: 'Bari', month: 12, day: 6, name: 'San Nicola' },
  { city: 'Catania', month: 2, day: 5, name: "Sant'Agata" },
  { city: 'Verona', month: 5, day: 21, name: 'San Zeno' },
  { city: 'Padova', month: 6, day: 13, name: "Sant'Antonio" },
  { city: 'Trieste', month: 11, day: 3, name: 'San Giusto' },
  { city: 'Venezia (Salute)', month: 11, day: 21, name: 'Madonna della Salute' },
  { city: 'Cagliari', month: 10, day: 30, name: 'San Saturnino' },
  { city: 'Personalizzato', month: 1, day: 1, name: 'Patrono Personalizzato' },
];

export function getNationalHolidays(year, patronConfig = null) {
  const holidays = {};

  // Festività fisse nazionali
  const fixed = [
    { m: 1, d: 1, name: 'Capodanno' },
    { m: 1, d: 6, name: 'Epifania' },
    { m: 4, d: 25, name: 'Festa della Liberazione' },
    { m: 5, d: 1, name: 'Festa del Lavoro' },
    { m: 6, d: 2, name: 'Festa della Repubblica' },
    { m: 8, d: 15, name: 'Ferragosto (Assunzione)' },
    { m: 11, d: 1, name: 'Tutti i Santi (Ognissanti)' },
    { m: 12, d: 8, name: 'Immacolata Concezione' },
    { m: 12, d: 25, name: 'Natale' },
    { m: 12, d: 26, name: 'Santo Stefano' },
  ];

  fixed.forEach(h => {
    const key = `${year}-${String(h.m).padStart(2, '0')}-${String(h.d).padStart(2, '0')}`;
    holidays[key] = {
      type: 'holiday',
      name: h.name,
      isNational: true,
    };
  });

  // Pasqua e Pasquetta (Lunedì dell'Angelo)
  const easter = getEaster(year);
  const easterKey = formatDateKey(easter);
  holidays[easterKey] = {
    type: 'holiday',
    name: 'Pasqua',
    isNational: true,
  };

  const pasquetta = new Date(easter);
  pasquetta.setDate(pasquetta.getDate() + 1);
  const pasquettaKey = formatDateKey(pasquetta);
  holidays[pasquettaKey] = {
    type: 'holiday',
    name: "Lunedì dell'Angelo (Pasquetta)",
    isNational: true,
  };

  // Santo Patrono (se abilitato e data valida)
  if (patronConfig && patronConfig.month > 0 && patronConfig.day > 0) {
    const patronKey = `${year}-${String(patronConfig.month).padStart(2, '0')}-${String(patronConfig.day).padStart(2, '0')}`;
    // Se non si sovrappone a una festività nazionale già presente
    if (!holidays[patronKey]) {
      holidays[patronKey] = {
        type: 'patron',
        name: patronConfig.name || 'Santo Patrono',
        isNational: false,
      };
    } else {
      holidays[patronKey].name += ` + ${patronConfig.name}`;
    }
  }

  return holidays;
}
