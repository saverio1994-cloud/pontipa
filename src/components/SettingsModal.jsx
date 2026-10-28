import React, { useState, useEffect } from 'react';
import { X, Settings, Check, Clock, Calendar, Building2, ShieldCheck, Palmtree, Coins, Car, Award } from 'lucide-react';
import { SCHEDULE_MODES, OPTIMIZATION_GOALS } from '../utils/optimizer.js';
import { ITALIAN_PATRON_PRESETS } from '../utils/holidays.js';
import { PROFESSIONAL_ROLES, OVERTIME_TYPES, getComputedOvertimeRate } from '../utils/payroll.js';

export function SettingsModal({ isOpen, onClose, config, onSaveConfig }) {
  const [year, setYear] = useState(config.year || 2026);
  const [scheduleMode, setScheduleMode] = useState(config.scheduleMode || SCHEDULE_MODES.THREE_SIX_TWO_NINE);
  const [optimizationGoal, setOptimizationGoal] = useState(config.optimizationGoal || OPTIMIZATION_GOALS.MIN_WORK);
  const [minimizeCommute, setMinimizeCommute] = useState(config.minimizeCommute ?? true);
  const [roleId, setRoleId] = useState(config.roleId || 'vigile_esperto');
  const [seniorityYears, setSeniorityYears] = useState(config.seniorityYears ?? 8);
  const [overtimeTypeId, setOvertimeTypeId] = useState(config.overtimeTypeId || 'diurno');
  const [mealVoucherValue, setMealVoucherValue] = useState(config.mealVoucherValue ?? 7.0);
  const [nineHourDays, setNineHourDays] = useState(config.nineHourDays || [2, 4]); // 2=Mar, 4=Gio
  const [totalFerie, setTotalFerie] = useState(config.totalFerie ?? 30);
  const [personalPermitHours, setPersonalPermitHours] = useState(config.personalPermitHours ?? 18);
  const [medicalPermitHours, setMedicalPermitHours] = useState(config.medicalPermitHours ?? 18);
  const [reserveSummerWeeks, setReserveSummerWeeks] = useState(config.reserveSummerWeeks ?? 2);
  const [maxOvertimeHoursYear, setMaxOvertimeHoursYear] = useState(config.maxOvertimeHoursYear ?? 180);
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState(config.overtimeHourlyRate ?? 17.44);
  const [maxDailyOvertimeOn6h, setMaxDailyOvertimeOn6h] = useState(config.maxDailyOvertimeOn6h ?? 3);
  const [maxDailyOvertimeOn9h, setMaxDailyOvertimeOn9h] = useState(config.maxDailyOvertimeOn9h ?? 1);
  
  // Patrono
  const [patronCity, setPatronCity] = useState(config.patronConfig?.city || 'Roma');
  const [patronName, setPatronName] = useState(config.patronConfig?.name || 'Santi Pietro e Paolo');
  const [patronMonth, setPatronMonth] = useState(config.patronConfig?.month ?? 6);
  const [patronDay, setPatronDay] = useState(config.patronConfig?.day ?? 29);

  useEffect(() => {
    if (isOpen && config) {
      setYear(config.year || 2026);
      setScheduleMode(config.scheduleMode || SCHEDULE_MODES.THREE_SIX_TWO_NINE);
      setOptimizationGoal(config.optimizationGoal || OPTIMIZATION_GOALS.MIN_WORK);
      setMinimizeCommute(config.minimizeCommute ?? true);
      setRoleId(config.roleId || 'vigile_esperto');
      setSeniorityYears(config.seniorityYears ?? 8);
      setOvertimeTypeId(config.overtimeTypeId || 'diurno');
      setMealVoucherValue(config.mealVoucherValue ?? 7.0);
      setNineHourDays(config.nineHourDays || [2, 4]);
      setTotalFerie(config.totalFerie ?? 30);
      setPersonalPermitHours(config.personalPermitHours ?? 18);
      setMedicalPermitHours(config.medicalPermitHours ?? 18);
      setReserveSummerWeeks(config.reserveSummerWeeks ?? 2);
      setMaxOvertimeHoursYear(config.maxOvertimeHoursYear ?? 180);
      setOvertimeHourlyRate(config.overtimeHourlyRate ?? 17.44);
      setMaxDailyOvertimeOn6h(config.maxDailyOvertimeOn6h ?? 3);
      setMaxDailyOvertimeOn9h(config.maxDailyOvertimeOn9h ?? 1);
      setPatronCity(config.patronConfig?.city || 'Roma');
      setPatronName(config.patronConfig?.name || 'Santi Pietro e Paolo');
      setPatronMonth(config.patronConfig?.month ?? 6);
      setPatronDay(config.patronConfig?.day ?? 29);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleRoleProfileUpdate = (nextRole, nextSeniority, nextOtType) => {
    setRoleId(nextRole);
    setSeniorityYears(nextSeniority);
    setOvertimeTypeId(nextOtType);
    const computedRate = getComputedOvertimeRate(nextRole, Number(nextSeniority) || 0, nextOtType);
    setOvertimeHourlyRate(computedRate);
  };

  const handleCityChange = (cityName) => {
    setPatronCity(cityName);
    const found = ITALIAN_PATRON_PRESETS.find(p => p.city === cityName);
    if (found) {
      setPatronName(found.name);
      setPatronMonth(found.month);
      setPatronDay(found.day);
    }
  };

  const handleToggle9hDay = (dayNum) => {
    if (nineHourDays.includes(dayNum)) {
      if (nineHourDays.length > 2) {
        setNineHourDays(nineHourDays.filter(d => d !== dayNum));
      }
    } else {
      if (nineHourDays.length < 2) {
        setNineHourDays([...nineHourDays, dayNum].sort());
      } else {
        setNineHourDays([nineHourDays[1], dayNum].sort());
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      year: parseInt(year, 10),
      scheduleMode,
      optimizationGoal,
      minimizeCommute: Boolean(minimizeCommute),
      roleId,
      seniorityYears: parseInt(seniorityYears, 10) || 0,
      overtimeTypeId,
      mealVoucherValue: parseFloat(mealVoucherValue) || 7.0,
      nineHourDays,
      totalFerie: parseInt(totalFerie, 10),
      personalPermitHours: parseFloat(personalPermitHours),
      medicalPermitHours: parseFloat(medicalPermitHours),
      reserveSummerWeeks: parseInt(reserveSummerWeeks, 10),
      maxOvertimeHoursYear: parseFloat(maxOvertimeHoursYear),
      overtimeHourlyRate: parseFloat(overtimeHourlyRate),
      maxDailyOvertimeOn6h: parseFloat(maxDailyOvertimeOn6h),
      maxDailyOvertimeOn9h: parseFloat(maxDailyOvertimeOn9h),
      patronConfig: {
        city: patronCity,
        name: patronName,
        month: parseInt(patronMonth, 10),
        day: parseInt(patronDay, 10),
      },
    });
    onClose();
  };

  const dayLabels = [
    { num: 1, label: 'Lunedì' },
    { num: 2, label: 'Martedì' },
    { num: 3, label: 'Mercoledì' },
    { num: 4, label: 'Giovedì' },
    { num: 5, label: 'Venerdì' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header — Stile VVF */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8f141b] to-[#6b0d12] text-white flex items-center justify-between border-b border-[#590a0e]">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Scheda Parametri di Servizio • PontiVVF / PA</h2>
              <p className="text-xs sm:text-sm text-amber-200 font-semibold">Configurazione oraria, obiettivi, straordinari e congedi CCNL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-800">
          {/* Anno di Esercizio */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 text-[11px] uppercase tracking-wider">
              Anno di Esercizio
            </label>
            <div className="flex items-center gap-2">
              {[2025, 2026, 2027, 2028, 2029].map(y => (
                <button
                  type="button"
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded font-bold border transition-colors cursor-pointer text-xs ${
                    year === y 
                      ? 'bg-[#0059b3] text-white border-[#0059b3] shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {y}
                </button>
              ))}
              <input
                type="number"
                min="2020"
                max="2040"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-20 px-2 py-1.5 rounded border border-slate-300 text-center font-bold text-xs"
              />
            </div>
          </div>

          {/* Inquadramento Giuridico-Economico VVF / PA (Qualifica & Anzianità) */}
          <div className="border-t border-slate-200 pt-3.5 space-y-2.5">
            <label className="block font-bold text-[#8f141b] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#8f141b]" />
              Inquadramento Professionale, Anzianità & Busta Paga NoiPA
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-red-50/40 p-3 rounded-lg border border-red-200">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                  Qualifica / Figura Professionale (CCNL VVF &amp; PA)
                </label>
                <select
                  value={roleId}
                  onChange={(e) => handleRoleProfileUpdate(e.target.value, seniorityYears, overtimeTypeId)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold text-slate-900 text-xs"
                >
                  {PROFESSIONAL_ROLES.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.code}] {r.name} — {r.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                  Anzianità di Servizio (anni)
                </label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={seniorityYears}
                  onChange={(e) => handleRoleProfileUpdate(roleId, e.target.value, overtimeTypeId)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold text-slate-900 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                  Fascia Maggiorazione Straordinario CCNL
                </label>
                <select
                  value={overtimeTypeId}
                  onChange={(e) => handleRoleProfileUpdate(roleId, seniorityYears, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-800 text-xs"
                >
                  {OVERTIME_TYPES.map(ot => (
                    <option key={ot.id} value={ot.id}>
                      {ot.label} (×{ot.multiplier.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                  Buono Pasto (€ / rientro)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={mealVoucherValue}
                  onChange={(e) => setMealVoucherValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold text-emerald-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Obiettivo Strategico & Clausola Minimi Accessi */}
          <div className="border-t border-slate-200 pt-3.5 space-y-2.5">
            <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Obiettivo Strategico dell&apos;Algoritmo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer transition-all ${
                  optimizationGoal === OPTIMIZATION_GOALS.MIN_WORK
                    ? 'border-[#0059b3] bg-blue-50/50 ring-1 ring-[#0059b3]'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="optimizationGoal"
                  value={OPTIMIZATION_GOALS.MIN_WORK}
                  checked={optimizationGoal === OPTIMIZATION_GOALS.MIN_WORK}
                  onChange={() => setOptimizationGoal(OPTIMIZATION_GOALS.MIN_WORK)}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-[#0b2b4d] flex items-center gap-1 text-xs">
                    <Palmtree className="w-3.5 h-3.5 text-emerald-700" />
                    Lavorare il Meno Possibile
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Massimizza ponti, ferie e permessi per ridurre al minimo assoluto le ore lavorate.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer transition-all ${
                  optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="optimizationGoal"
                  value={OPTIMIZATION_GOALS.MAX_OVERTIME}
                  checked={optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME}
                  onChange={() => setOptimizationGoal(OPTIMIZATION_GOALS.MAX_OVERTIME)}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-[#0b2b4d] flex items-center gap-1 text-xs">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    Guadagnare il Più Possibile (Straordinari)
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Usa le ferie sui turni lunghi da 9h e conserva i turni da 6h per massimizzare gli straordinari pagati.
                  </span>
                </div>
              </label>
            </div>

            {/* Clausola Opzionale: Venire al lavoro meno volte possibile */}
            <label className="flex items-start gap-2.5 p-3 rounded bg-slate-50 border border-slate-300 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(minimizeCommute)}
                onChange={(e) => setMinimizeCommute(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0059b3]"
              />
              <div>
                <span className="font-bold text-[#0b2b4d] flex items-center gap-1.5 text-xs">
                  <Car className="w-3.5 h-3.5 text-[#0066cc]" />
                  Clausola Opzionale: &ldquo;Venire al lavoro meno volte possibile&rdquo; (Minimi Accessi in Sede)
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5 leading-snug">
                  Impone di usare le 36h di permessi esclusivamente su giornate corte da 6h (ottenendo <strong>6 giorni interi a casa</strong> invece di 4) e concentra gli eventuali straordinari nelle sole giornate di effettiva presenza, riducendo al minimo i viaggi casa-ufficio.
                </span>
              </div>
            </label>

            {/* Parametri Straordinario (visibili quando è selezionato MAX_OVERTIME) */}
            {optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME && (
              <div className="p-3 rounded bg-amber-50/60 border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-amber-900 mb-1 text-[10px]">
                    Budget Straord. Annuo (ore)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="400"
                    value={maxOvertimeHoursYear}
                    onChange={(e) => setMaxOvertimeHoursYear(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white font-bold text-amber-900 text-xs"
                  />
                  <span className="text-[9px] text-amber-700">Tetto CCNL: 180h</span>
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1 text-[10px]">
                    Tariffa Oraria (€/ora)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="0.5"
                    value={overtimeHourlyRate}
                    onChange={(e) => setOvertimeHourlyRate(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white font-bold text-emerald-800 text-xs"
                  />
                  <span className="text-[9px] text-amber-700">Media PA: ~16.50€</span>
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1 text-[10px]">
                    Max Straord. su Turno 6h
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    step="0.5"
                    value={maxDailyOvertimeOn6h}
                    onChange={(e) => setMaxDailyOvertimeOn6h(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white font-bold text-slate-800 text-xs"
                  />
                  <span className="text-[9px] text-amber-700">Consigliato: +3h</span>
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1 text-[10px]">
                    Max Straord. su Turno 9h
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    step="0.5"
                    value={maxDailyOvertimeOn9h}
                    onChange={(e) => setMaxDailyOvertimeOn9h(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white font-bold text-slate-800 text-xs"
                  />
                  <span className="text-[9px] text-amber-700">Consigliato: +1h</span>
                </div>
              </div>
            )}
          </div>

          {/* Configurazione Orario (36 ore settimanali) */}
          <div className="border-t border-slate-200 pt-3.5">
            <label className="block font-bold text-slate-800 mb-1.5 text-[11px] uppercase tracking-wider">
              Articolazione Oraria Settimanale (36h ex CCNL)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label 
                className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer transition-all ${
                  scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE 
                    ? 'border-[#0059b3] bg-blue-50/50 ring-1 ring-[#0059b3]' 
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  value={SCHEDULE_MODES.THREE_SIX_TWO_NINE}
                  checked={scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE}
                  onChange={() => setScheduleMode(SCHEDULE_MODES.THREE_SIX_TWO_NINE)}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-[#0b2b4d] block text-xs">
                    3 giorni da 6h + 2 rientri da 9h
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Permette di coprire 6 intere giornate da 6h con le sole 36h di permessi!
                  </span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer transition-all ${
                  scheduleMode === SCHEDULE_MODES.FIVE_SEVEN_TWELVE 
                    ? 'border-[#0059b3] bg-blue-50/50 ring-1 ring-[#0059b3]' 
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  value={SCHEDULE_MODES.FIVE_SEVEN_TWELVE}
                  checked={scheduleMode === SCHEDULE_MODES.FIVE_SEVEN_TWELVE}
                  onChange={() => setScheduleMode(SCHEDULE_MODES.FIVE_SEVEN_TWELVE)}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-[#0b2b4d] block text-xs">
                    5 giorni da 7h e 12m (7.2h)
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Orario uniforme continuato dal Lunedì al Venerdì.
                  </span>
                </div>
              </label>
            </div>

            {/* Scelta dei 2 giorni con rientro da 9h */}
            {scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE && (
              <div className="mt-2.5 p-3 rounded bg-slate-50 border border-slate-200">
                <span className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                  Giornate settimanali con rientro pomeridiano da 9h (i rimanenti saranno da 6h):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dayLabels.map(d => {
                    const is9h = nineHourDays.includes(d.num);
                    return (
                      <button
                        type="button"
                        key={d.num}
                        onClick={() => handleToggle9hDay(d.num)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                          is9h 
                            ? 'bg-[#0059b3] text-white border-[#00478f]' 
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}: {is9h ? '9h' : '6h'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Saldo Congedi e Permessi */}
          <div className="border-t border-slate-200 pt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                Ferie Ordinarie Spettanti (gg)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={totalFerie}
                onChange={(e) => setTotalFerie(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 font-bold text-emerald-800 text-sm"
              />
              <span className="text-[10px] text-slate-400">CCNL: 30 gg lavorativi</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                Permesso Motivi Pers. (ore)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={personalPermitHours}
                onChange={(e) => setPersonalPermitHours(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 font-bold text-[#0059b3] text-sm"
              />
              <span className="text-[10px] text-slate-400">CCNL: 18 ore retribuite</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 text-[11px]">
                Permesso Visita Med. (ore)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={medicalPermitHours}
                onChange={(e) => setMedicalPermitHours(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 font-bold text-sky-800 text-sm"
              />
              <span className="text-[10px] text-slate-400">CCNL: 18 ore retribuite</span>
            </div>
          </div>

          {/* Santo Patrono */}
          <div className="border-t border-slate-200 pt-3.5">
            <label className="block font-bold text-slate-800 mb-1 text-[11px] uppercase tracking-wider">
              Santo Patrono (Sede di Servizio)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={patronCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white font-medium text-xs"
              >
                {ITALIAN_PATRON_PRESETS.map(p => (
                  <option key={p.city} value={p.city}>
                    {p.city} {p.day > 0 ? `(${p.day}/${p.month} - ${p.name})` : ''}
                  </option>
                ))}
              </select>

              {patronCity === 'Personalizzato' && (
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Giorno"
                    value={patronDay}
                    onChange={(e) => setPatronDay(e.target.value)}
                    className="w-14 px-2 py-1 rounded border border-slate-300 text-center text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Mese"
                    value={patronMonth}
                    onChange={(e) => setPatronMonth(e.target.value)}
                    className="w-14 px-2 py-1 rounded border border-slate-300 text-center text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nome Patrono"
                    value={patronName}
                    onChange={(e) => setPatronName(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Riserva Estiva (Ferragosto) */}
          <div className="border-t border-slate-200 pt-3.5 flex items-center justify-between">
            <div>
              <label className="font-bold text-slate-800 block text-[11px]">
                Riserva Feriale Estiva (Ferragosto)
              </label>
              <span className="text-[11px] text-slate-500">
                Settimane consecutive ad Agosto da tutelare prima di allocare i ponti
              </span>
            </div>
            <select
              value={reserveSummerWeeks}
              onChange={(e) => setReserveSummerWeeks(e.target.value)}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white font-semibold text-xs"
            >
              <option value="0">0 settimane (Tutte le ferie sui ponti)</option>
              <option value="1">1 settimana ad Agosto</option>
              <option value="2">2 settimane ad Agosto (Consigliato PA)</option>
              <option value="3">3 settimane ad Agosto</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="border-t-2 border-slate-200 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border-2 border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors font-bold cursor-pointer text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#8f141b] hover:bg-[#751016] text-white font-black transition-colors flex items-center gap-2 shadow-sm cursor-pointer text-sm"
            >
              <Check className="w-4 h-4 text-amber-300" />
              Applica e Ricalcola Piano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
