import React from 'react';
import { Sparkles, Calendar, TrendingUp, Clock, CheckCircle2, Palmtree, ArrowRight, Building2, ShieldAlert } from 'lucide-react';
import { DAY_TYPES, MONTH_NAMES_IT } from '../utils/optimizer.js';

export function BridgeInspector({ bridgeSummaries, year, onSelectDay }) {
  return (
    <div className="space-y-6">
      {/* Intestazione Sezione VVF / PA */}
      <div className="bg-gradient-to-r from-[#8f141b] to-[#6b0d12] rounded-xl p-6 text-white shadow-md border-2 border-[#590a0e] relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/35 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-3 border border-amber-400/50">
            <Building2 className="w-4 h-4 text-amber-400" />
            Registro Ufficiale Ponti Festivi • Anno {year}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Prospetto Analitico di Astensione dal Servizio & Super-Ponti
          </h2>
          <p className="text-red-50 text-sm sm:text-base leading-relaxed font-medium">
            Il piano combina le festività civili e religiose con il riposo settimanale e i permessi retribuiti ex art. CCNL. 
            Con l&apos;orario a <strong className="text-white font-black">3 giorni da 6h + 2 rientri da 9h</strong>, l&apos;assegnazione delle 36 ore di permesso sui turni brevi genera <strong className="text-amber-300 font-black">6 intere giornate libere</strong> a costo zero di ferie ordinarie.
          </p>
        </div>
      </div>

      {/* Griglia Card dei Ponti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bridgeSummaries.map((b, index) => {
          const isTopTier = parseFloat(b.roi) >= 3.0 || b.totalRestDays >= 9;

          return (
            <div 
              key={b.id} 
              className={`bg-white rounded-xl p-5 border-2 shadow-sm transition-all flex flex-col justify-between ${
                isTopTier ? 'border-[#8f141b] ring-2 ring-red-100' : 'border-slate-300'
              }`}
            >
              <div>
                {/* Header Card con Riferimento Amministrativo */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-white bg-[#8f141b] px-2.5 py-0.5 rounded-md">
                        FASCICOLO #{index + 1}
                      </span>
                      <h3 className="font-black text-slate-950 text-base sm:text-lg">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-700 mt-1.5 flex items-center gap-1.5 font-mono font-bold">
                      <Calendar className="w-4 h-4 text-[#8f141b]" />
                      {b.startDate} <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> {b.endDate}
                    </p>
                  </div>

                  {/* Badge ROI / Efficienza */}
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-black px-3 py-1 rounded-lg ${
                      parseFloat(b.roi) >= 3.5 
                        ? 'bg-emerald-700 text-white' 
                        : parseFloat(b.roi) >= 2.0 
                          ? 'bg-[#0059b3] text-white' 
                          : 'bg-slate-200 text-slate-900'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      ROI: {b.roi}x
                    </span>
                    <span className="block text-xs text-slate-700 mt-1 font-bold">
                      {b.leavesSpent > 0 ? `${b.totalRestDays}gg liberi / ${b.leavesSpent}gg spesi` : '100% weekend/feste'}
                    </span>
                  </div>
                </div>

                {/* Box Statistiche di Servizio */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border-2 border-slate-200 mb-3.5 text-center">
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-slate-950">{b.totalRestDays}</span>
                    <span className="text-xs font-bold text-slate-700">Giorni a casa</span>
                  </div>
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-emerald-800">{b.ferieUsed}</span>
                    <span className="text-xs font-bold text-slate-700">Ferie usate</span>
                  </div>
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-[#0059b3]">
                      {b.permessiPers + b.permessiMed}
                    </span>
                    <span className="text-xs font-bold text-slate-700">Permessi gg</span>
                  </div>
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-[#8f141b]">
                      {b.holidaysCount + b.weekendDays}
                    </span>
                    <span className="text-xs font-bold text-slate-700">Feste+Weekend</span>
                  </div>
                </div>

                {/* Timeline Visuale dei Giorni */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    Composizione Periodo di Sospensione:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {b.periodDays.map(day => {
                      let tagStyle = 'bg-slate-200 text-slate-800 font-bold';
                      let icon = '';

                      if (day.type === DAY_TYPES.FERIE) {
                        tagStyle = 'bg-emerald-700 text-white font-black';
                        icon = 'FER';
                      } else if (day.type === DAY_TYPES.PERMESSO_PERSONALE) {
                        tagStyle = 'bg-[#0059b3] text-white font-black';
                        icon = 'PERM';
                      } else if (day.type === DAY_TYPES.PERMESSO_MEDICO) {
                        tagStyle = 'bg-sky-700 text-white font-black';
                        icon = 'MED';
                      } else if (day.type === DAY_TYPES.HOLIDAY || day.type === DAY_TYPES.PATRON) {
                        tagStyle = 'bg-[#8f141b] text-white font-black';
                        icon = '★';
                      } else if (day.type === DAY_TYPES.WEEKEND) {
                        tagStyle = 'bg-slate-200 text-slate-800 font-bold';
                        icon = '';
                      }

                      return (
                        <button
                          key={day.dateKey}
                          onClick={() => onSelectDay(day)}
                          className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity ${tagStyle}`}
                          title={`${day.dateKey} (${day.dayName}): ${day.label}`}
                        >
                          {icon && <span className="text-[10px] opacity-90">{icon}</span>}
                          <span>{day.day} {MONTH_NAMES_IT[day.month].slice(0, 3)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Riferimento a Fondo Scheda */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {b.leavesSpent === 1 
                    ? 'Ponte secco a massimo ritorno (1gg speso = 4gg riposo)' 
                    : b.totalRestDays >= 9 
                      ? 'Cluster congedo straordinario continuativo' 
                      : 'Estensione fine settimana con permesso orario'}
                </span>
                <span className="text-slate-800 font-mono font-bold text-xs">
                  Ore risp.: {b.periodDays.reduce((acc, d) => acc + (d.scheduledHours || 0), 0)}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
