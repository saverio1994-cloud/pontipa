import React from 'react';
import { 
  Building2, 
  Settings, 
  Download, 
  Sparkles, 
  Printer, 
  FileSpreadsheet, 
  HelpCircle,
  Clock,
  ShieldCheck,
  CalendarDays,
  Flame,
  ReceiptEuro
} from 'lucide-react';
import { SCHEDULE_MODES } from '../utils/optimizer.js';
import { getRoleById } from '../utils/payroll.js';

export function Header({ 
  year, 
  config, 
  onOpenSettings, 
  onReoptimize, 
  onExportExcel, 
  onExportICal, 
  onPrint,
  activeTab,
  setActiveTab
}) {
  const is3x6 = config.scheduleMode === SCHEDULE_MODES.THREE_SIX_TWO_NINE;
  const activeRole = getRoleById(config.roleId);

  return (
    <header className="bg-white border-b-2 border-[#8f141b] sticky top-0 z-30 shadow-md">
      {/* Barra Tricolore Istituzionale Maggiorata */}
      <div className="flex h-1.5 w-full">
        <div className="w-1/3 bg-[#008c45]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#cd212a]"></div>
      </div>

      {/* Top Slim Bar — Stile vigilfuoco.it / Ministero dell'Interno */}
      <div className="bg-[#1c1f24] text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm font-bold border-b border-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-black tracking-wider uppercase text-amber-400">Ministero dell&apos;Interno</span>
          <span className="text-red-400">•</span>
          <span className="text-slate-100">Dipartimento dei Vigili del Fuoco, del Soccorso Pubblico e della Difesa Civile</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-200">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            CCNL 36 Ore • Portale Turni & Congedi
          </span>
          <span className="bg-[#8f141b] border border-red-400/40 px-2.5 py-0.5 rounded text-xs text-white font-mono font-bold">
            VVF / PA v3.0
          </span>
        </div>
      </div>

      {/* Fascia Principale Rosso Cremisi Istituzionale vigilfuoco.it */}
      <div className="bg-gradient-to-r from-[#8f141b] via-[#9e1b22] to-[#751016] text-white border-b border-[#5e0b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between py-4 gap-4">
            {/* Emblema Araldico Fiamma VVF & Titolo ad Alta Visibilità */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#14171c] p-1 flex items-center justify-center border-2 border-amber-400 shadow-xl shrink-0 overflow-hidden group">
                <img
                  src="/logo-pontipa-vvf.jpg"
                  alt="Emblema PontiPA - Fiamma Vigili del Fuoco"
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div>
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-300 leading-tight">
                  Corpo Nazionale dei Vigili del Fuoco • Gestione Personale
                </div>
                <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Ponti<span className="text-amber-400">VVF</span>
                  </h1>
                  <span className="bg-black/35 text-amber-300 border border-amber-400/60 text-sm font-extrabold px-3 py-0.5 rounded-md">
                    Anno {year}
                  </span>
                  <span className="bg-white/15 text-white border border-white/30 text-sm font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-300" />
                    36h / settimana
                  </span>
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/50 text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-md">
                    {activeRole.name} ({config.seniorityYears ?? 8} anni anz.)
                  </span>
                </div>
                <p className="text-sm sm:text-base text-red-100 mt-1 font-medium">
                  Orario: <strong className="text-white font-extrabold">{is3x6 ? '3 giorni da 6h + 2 rientri da 9h' : '5 giorni da 7h e 12m'}</strong> • Obiettivo:{' '}
                  <span className="text-amber-300 font-black underline decoration-amber-400/70 underline-offset-4">
                    {config.optimizationGoal === 'max_overtime' ? 'Massimo Guadagno Straordinari' : 'Lavorare il Meno Possibile'}
                  </span>
                  {config.minimizeCommute && (
                    <span className="ml-1.5 inline-block bg-emerald-900/80 border border-emerald-400/60 text-emerald-200 text-xs font-extrabold px-2 py-0.5 rounded">
                      ✓ Minimi Accessi in Sede
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Barra Pulsanti Azioni ad Alta Visibilità */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onReoptimize}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all cursor-pointer border border-amber-200"
                title="Ricalcola automaticamente la combinazione ottimale"
              >
                <Sparkles className="w-4 h-4 text-red-900" />
                Ricalcola Piano
              </button>

              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold rounded-lg bg-white text-[#751016] hover:bg-red-50 border-2 border-white shadow-sm transition-colors cursor-pointer"
                title="Configura orario, obiettivo, straordinari, ferie, permessi e patrono"
              >
                <Settings className="w-4 h-4 text-[#8f141b]" />
                Parametri Servizio
              </button>

              <button
                onClick={onExportExcel}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold rounded-lg bg-black/30 hover:bg-black/45 text-white border border-white/30 transition-colors cursor-pointer"
                title="Esporta il prospetto dettagliato in formato Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                Excel
              </button>

              <button
                onClick={onExportICal}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold rounded-lg bg-black/30 hover:bg-black/45 text-white border border-white/30 transition-colors cursor-pointer"
                title="Esporta il calendario in formato iCalendar (.ics)"
              >
                <Download className="w-4 h-4 text-amber-300" />
                iCal (.ics)
              </button>

              <button
                onClick={onPrint}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold rounded-lg bg-black/30 hover:bg-black/45 text-white border border-white/30 transition-colors cursor-pointer"
                title="Stampa prospetto ufficiale o salva in PDF"
              >
                <Printer className="w-4 h-4 text-slate-200" />
                Stampa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation ad Alta Leggibilità Stile Portale VVF */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('year')}
            className={`px-5 py-3.5 text-sm sm:text-base font-extrabold border-b-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'year'
                ? 'border-[#8f141b] text-[#8f141b] bg-red-50/70'
                : 'border-transparent text-slate-700 hover:text-[#8f141b] hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendario Annuale (12 Mesi)
          </button>
          
          <button
            onClick={() => setActiveTab('bridges')}
            className={`px-5 py-3.5 text-sm sm:text-base font-extrabold border-b-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bridges'
                ? 'border-[#8f141b] text-[#8f141b] bg-red-50/70'
                : 'border-transparent text-slate-700 hover:text-[#8f141b] hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Registro Ponti Festivi & ROI
          </button>

          <button
            onClick={() => setActiveTab('month')}
            className={`px-5 py-3.5 text-sm sm:text-base font-extrabold border-b-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'month'
                ? 'border-[#8f141b] text-[#8f141b] bg-red-50/70'
                : 'border-transparent text-slate-700 hover:text-[#8f141b] hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Foglio Presenze Mensile
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-5 py-3.5 text-sm sm:text-base font-extrabold border-b-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'payroll'
                ? 'border-[#8f141b] text-[#8f141b] bg-red-50/70'
                : 'border-transparent text-slate-700 hover:text-[#8f141b] hover:bg-slate-50'
            }`}
          >
            <ReceiptEuro className="w-4 h-4 text-emerald-700" />
            Buste Paga & Stipendio NoiPA
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-5 py-3.5 text-sm sm:text-base font-extrabold border-b-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'strategy'
                ? 'border-[#8f141b] text-[#8f141b] bg-red-50/70'
                : 'border-transparent text-slate-700 hover:text-[#8f141b] hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#8f141b]" />
            Circolare Operativa 36h & Straordinari
          </button>
        </div>
      </div>
    </header>
  );
}
