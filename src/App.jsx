import React, { useState, useEffect, useMemo } from 'react';
import { 
  SCHEDULE_MODES, 
  OPTIMIZATION_GOALS,
  DAY_TYPES, 
  generateBaseCalendar, 
  optimizeAnnualCalendar,
  calculateCalendarMetrics
} from './utils/optimizer.js';
import { exportToICal, exportToExcel } from './utils/exporter.js';
import { calculateAnnualPayroll } from './utils/payroll.js';
import { Header } from './components/Header.jsx';
import { KpiCards } from './components/KpiCards.jsx';
import { CalendarYearView } from './components/CalendarYearView.jsx';
import { BridgeInspector } from './components/BridgeInspector.jsx';
import { CalendarMonthView } from './components/CalendarMonthView.jsx';
import { PayrollView } from './components/PayrollView.jsx';
import { StrategyGuide } from './components/StrategyGuide.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DayEditModal } from './components/DayEditModal.jsx';
import { Building2, ShieldCheck, Palmtree, Coins, Car, SlidersHorizontal } from 'lucide-react';

const STORAGE_CONFIG_KEY = 'pontipa_config_v2';
const STORAGE_CALENDAR_KEY = 'pontipa_calendar_v2';

const DEFAULT_CONFIG = {
  year: 2026,
  scheduleMode: SCHEDULE_MODES.THREE_SIX_TWO_NINE, // 3gg da 6h + 2gg da 9h
  optimizationGoal: OPTIMIZATION_GOALS.MIN_WORK,   // 'min_work' | 'max_overtime'
  minimizeCommute: true,                           // Clausola opzionale: venire al lavoro meno volte possibile
  roleId: 'vigile_esperto',                        // Figura professionale CCNL VVF / PA
  seniorityYears: 8,                               // Anni di anzianità di servizio
  overtimeTypeId: 'diurno',                        // Fascia maggiorazione straordinario ('diurno' | 'notturno_festivo' | 'notturno_festivo_max')
  mealVoucherValue: 7.0,                           // Valore buono pasto elettronico (€)
  nineHourDays: [2, 4], // Martedì e Giovedì da 9h
  totalFerie: 30,
  personalPermitHours: 18,
  medicalPermitHours: 18,
  reserveSummerWeeks: 2,
  maxOvertimeHoursYear: 180,
  overtimeHourlyRate: 17.44,
  maxDailyOvertimeOn6h: 3,
  maxDailyOvertimeOn9h: 1,
  patronConfig: {
    city: 'Roma',
    name: 'Santi Pietro e Paolo',
    month: 6,
    day: 29,
  },
};

export default function App() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback a default config
    }
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState('year'); // 'year' | 'bridges' | 'month' | 'strategy'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Calcolo iniziale sincrono (con recupero da localStorage se disponibile e coerente con l'anno)
  const initialData = useMemo(() => {
    try {
      const savedCalRaw = localStorage.getItem(STORAGE_CALENDAR_KEY);
      if (savedCalRaw) {
        const parsedCal = JSON.parse(savedCalRaw).map(d => ({
          ...d,
          date: new Date(d.date),
        }));
        if (parsedCal.length > 0 && parsedCal[0].year === config.year) {
          const { bridgeSummaries, stats } = calculateCalendarMetrics(parsedCal, config);
          return { calendar: parsedCal, bridgeSummaries, stats };
        }
      }
    } catch {
      // Fallback a ricalcolo completo
    }

    const baseCal = generateBaseCalendar(config.year, config);
    return optimizeAnnualCalendar(baseCal, config);
  }, []);

  const [calendar, setCalendar] = useState(() => initialData.calendar);
  const [bridgeSummaries, setBridgeSummaries] = useState(() => initialData.bridgeSummaries);
  const [stats, setStats] = useState(() => initialData.stats);

  // Calcolo dinamico Prospetto Economico & Buste Paga NoiPA (12 mensilità + 13ª)
  const payroll = useMemo(() => {
    return calculateAnnualPayroll(calendar, config);
  }, [calendar, config]);

  // Salvataggio automatico su localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // Ignora errori di storage
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CALENDAR_KEY, JSON.stringify(calendar));
    } catch {
      // Ignora errori di storage
    }
  }, [calendar]);

  const computeSchedule = (currentConfig) => {
    const baseCal = generateBaseCalendar(currentConfig.year, currentConfig);
    const optimized = optimizeAnnualCalendar(baseCal, currentConfig);

    setCalendar(optimized.calendar);
    setBridgeSummaries(optimized.bridgeSummaries);
    setStats(optimized.stats);
  };

  const handleQuickStrategyChange = (partialConfig) => {
    const nextConfig = { ...config, ...partialConfig };
    setConfig(nextConfig);
    computeSchedule(nextConfig);
  };

  const handleUpdatePayrollConfig = (partialConfig) => {
    const nextConfig = { ...config, ...partialConfig };
    setConfig(nextConfig);
    if (
      partialConfig.optimizationGoal !== undefined ||
      partialConfig.maxOvertimeHoursYear !== undefined ||
      partialConfig.minimizeCommute !== undefined
    ) {
      computeSchedule(nextConfig);
    } else {
      const { bridgeSummaries: nextBridges, stats: nextStats } = calculateCalendarMetrics(calendar, nextConfig);
      setBridgeSummaries(nextBridges);
      setStats(nextStats);
    }
  };

  const handleUpdateDayStatus = (dateKey, newType, customOvertimeHours = null) => {
    const nextCal = calendar.map(d => {
      if (d.dateKey === dateKey) {
        let workedHours = 0;
        let usedPermitHours = 0;
        let overtimeHours = customOvertimeHours !== null ? Number(customOvertimeHours) : (d.overtimeHours || 0);
        let overtimeNote = d.overtimeNote || '';
        let label = d.label;
        let bridgeInfo = d.bridgeInfo;

        if (newType === DAY_TYPES.WORK) {
          workedHours = d.scheduledHours;
          label = 'Servizio';
          bridgeInfo = null;
          if (overtimeHours > 0 && !overtimeNote) {
            overtimeNote = `Straordinario manuale (+${overtimeHours}h)`;
          } else if (overtimeHours === 0) {
            overtimeNote = '';
          }
        } else if (newType === DAY_TYPES.FERIE) {
          label = 'Ferie Ordinarie';
          overtimeHours = 0;
          overtimeNote = '';
          bridgeInfo = bridgeInfo || 'Assegnazione manuale utente';
        } else if (newType === DAY_TYPES.PERMESSO_PERSONALE) {
          usedPermitHours = d.scheduledHours;
          overtimeHours = 0;
          overtimeNote = '';
          label = `Permesso Personale (${d.scheduledHours}h)`;
          bridgeInfo = bridgeInfo || 'Assegnazione manuale utente';
        } else if (newType === DAY_TYPES.PERMESSO_MEDICO) {
          usedPermitHours = d.scheduledHours;
          overtimeHours = 0;
          overtimeNote = '';
          label = `Visita Medica (${d.scheduledHours}h)`;
          bridgeInfo = bridgeInfo || 'Assegnazione manuale utente';
        }

        return {
          ...d,
          type: newType,
          label,
          workedHours,
          overtimeHours,
          overtimeNote,
          usedPermitHours,
          bridgeInfo,
        };
      }
      return d;
    });

    const { bridgeSummaries: nextBridges, stats: nextStats } = calculateCalendarMetrics(nextCal, config);
    setCalendar(nextCal);
    setBridgeSummaries(nextBridges);
    setStats(nextStats);
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    computeSchedule(newConfig);
  };

  const handleReoptimize = () => {
    computeSchedule(config);
  };

  const handleExportExcel = () => {
    exportToExcel(calendar, stats, bridgeSummaries, config.year, config, payroll);
  };

  const handleExportICal = () => {
    exportToICal(calendar, config.year, config);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header Sticky PontiPA */}
      <Header
        year={config.year}
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReoptimize={handleReoptimize}
        onExportExcel={handleExportExcel}
        onExportICal={handleExportICal}
        onPrint={handlePrint}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Barra Rapida Strategia di Ottimizzazione & Clausola Accessi — Stile VVF */}
        <div className="bg-white rounded-xl border-2 border-slate-300 border-l-8 border-l-[#8f141b] shadow-sm p-4 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-black uppercase tracking-wider text-[#8f141b] flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#8f141b]" />
              Obiettivo Piano:
            </span>
            <div className="inline-flex flex-wrap rounded-xl p-1.5 bg-slate-100 border border-slate-300 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickStrategyChange({ optimizationGoal: OPTIMIZATION_GOALS.MIN_WORK })}
                className={`px-4 py-2 rounded-lg text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  config.optimizationGoal !== OPTIMIZATION_GOALS.MAX_OVERTIME
                    ? 'bg-[#8f141b] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                <Palmtree className="w-4 h-4" />
                Lavorare il Meno Possibile
              </button>
              <button
                type="button"
                onClick={() => handleQuickStrategyChange({ optimizationGoal: OPTIMIZATION_GOALS.MAX_OVERTIME })}
                className={`px-4 py-2 rounded-lg text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  config.optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                <Coins className="w-4 h-4" />
                Guadagnare il Più Possibile (Straordinari)
              </button>
            </div>
          </div>

          {/* Clausola Opzionale: Venire al lavoro meno volte possibile */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none bg-slate-50 hover:bg-red-50/40 px-4 py-2 rounded-xl border-2 border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(config.minimizeCommute)}
                onChange={(e) => handleQuickStrategyChange({ minimizeCommute: e.target.checked })}
                className="w-5 h-5 accent-[#8f141b] rounded cursor-pointer"
              />
              <div className="text-sm">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#8f141b]" />
                  Clausola: &ldquo;Venire al lavoro meno volte possibile&rdquo;
                </span>
                <span className="block text-xs font-semibold text-slate-600">
                  {config.minimizeCommute
                    ? `Attiva: permessi solo su turni da 6h (-${stats.commuteDaysSaved || 36} viaggi A/R, solo ${stats.workDays} presenze)`
                    : 'Disattivata: privilegia arbitraggio 9h (più turni da 6h in presenza per straordinari/ore)'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* KPI Cards Istituzionali */}
        <KpiCards stats={stats} config={config} />

        {/* Tab Views */}
        {activeTab === 'year' && (
          <CalendarYearView
            calendar={calendar}
            year={config.year}
            onSelectDay={(day) => setSelectedDay(day)}
          />
        )}

        {activeTab === 'bridges' && (
          <BridgeInspector
            bridgeSummaries={bridgeSummaries}
            year={config.year}
            onSelectDay={(day) => setSelectedDay(day)}
          />
        )}

        {activeTab === 'month' && (
          <CalendarMonthView
            calendar={calendar}
            year={config.year}
            onUpdateDayStatus={handleUpdateDayStatus}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollView
            payroll={payroll}
            config={config}
            year={config.year}
            onUpdatePayrollConfig={handleUpdatePayrollConfig}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyGuide config={config} />
        )}
      </main>

      {/* Modale Parametri Servizio */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Modale Variazione Stato Giornata */}
      <DayEditModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onUpdateStatus={handleUpdateDayStatus}
      />

      {/* Footer Istituzionale VVF / PA */}
      <footer className="bg-[#1c1f24] text-slate-200 border-t-4 border-[#8f141b] py-5 text-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-pontipa-vvf.jpg"
              alt="Logo PontiPA VVF"
              className="w-10 h-10 rounded-lg border border-amber-400/70 object-contain bg-[#14171c]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-amber-400 tracking-wide">PontiPA • VVF</span>
              <span className="text-red-400">•</span>
              <span className="font-semibold">Portale Pianificazione Oraria, Congedi, Straordinari e Buste Paga</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Conforme ai CCNL 36h/settimana — Grafica ispirata a vigilfuoco.it</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
