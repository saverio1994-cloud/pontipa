import React, { useState } from 'react';
import { MONTH_NAMES_IT, DAY_NAMES_IT, DAY_TYPES } from '../utils/optimizer.js';
import { ChevronLeft, ChevronRight, Clock, Palmtree, Briefcase, Flag, Sparkles, Building2 } from 'lucide-react';

export function CalendarMonthView({ calendar, year, onUpdateDayStatus }) {
  const [currentMonth, setCurrentMonth] = useState(0);

  if (!calendar || calendar.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-300 text-center text-slate-500">
        Caricamento del prospetto mensile...
      </div>
    );
  }

  const monthDays = calendar.filter(d => d.month === currentMonth);

  const workDaysCount = monthDays.filter(d => d.type === DAY_TYPES.WORK).length;
  const ferieCount = monthDays.filter(d => d.type === DAY_TYPES.FERIE).length;
  const permessiCount = monthDays.filter(d => 
    d.type === DAY_TYPES.PERMESSO_PERSONALE || d.type === DAY_TYPES.PERMESSO_MEDICO
  ).length;
  const workedHoursTotal = monthDays.reduce((acc, d) => acc + d.workedHours, 0);
  const overtimeHoursTotal = monthDays.reduce((acc, d) => acc + (d.type === DAY_TYPES.WORK ? (d.overtimeHours || 0) : 0), 0);

  return (
    <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden">
      {/* Month Selector Bar in stile VVF */}
      <div className="p-4 bg-gradient-to-r from-[#8f141b] to-[#6e0e14] text-white border-b border-[#590a0e] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(prev => (prev > 0 ? prev - 1 : 11))}
            className="p-1.5 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-[190px] text-center">
            <span className="text-xs uppercase font-black text-amber-300 tracking-wider block leading-none">
              Foglio Presenze Mensile
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">
              {MONTH_NAMES_IT[currentMonth]} {year}
            </h2>
          </div>
          <button
            onClick={() => setCurrentMonth(prev => (prev < 11 ? prev + 1 : 0))}
            className="p-1.5 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Month Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {MONTH_NAMES_IT.map((mName, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentMonth(idx)}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap font-extrabold ${
                currentMonth === idx
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-black/25 text-white hover:bg-black/40 border border-white/20'
              }`}
            >
              {mName.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="px-5 py-3 bg-red-50/50 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-5 text-slate-800 font-semibold">
          <span>Giorni di servizio: <strong className="text-slate-950 font-black">{workDaysCount} gg</strong></span>
          <span>Ferie fruite: <strong className="text-emerald-800 font-black">{ferieCount} gg</strong></span>
          <span>Permessi fruiti: <strong className="text-[#0059b3] font-black">{permessiCount} gg</strong></span>
          <span>Ore ordinarie: <strong className="text-slate-950 font-mono font-black">{workedHoursTotal.toFixed(1)}h</strong></span>
          {overtimeHoursTotal > 0 && (
            <span>Straordinari mese: <strong className="text-amber-800 font-mono font-black">+{overtimeHoursTotal.toFixed(1)}h</strong></span>
          )}
        </div>
        <span className="text-slate-600 font-semibold text-xs sm:text-sm">
          Modifica lo stato giuridico di ogni giornata dai pulsanti dedicati nella colonna a destra
        </span>
      </div>

      {/* Detailed Days Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-800">
          <thead className="bg-slate-100 text-slate-900 uppercase tracking-wider font-black border-b-2 border-slate-300 text-xs">
            <tr>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Giorno</th>
              <th className="py-3 px-4">Stato Giuridico</th>
              <th className="py-3 px-4 text-center">Ore Contrattuali</th>
              <th className="py-3 px-4 text-center">Ore Servizio</th>
              <th className="py-3 px-4">Motivazione / Decreto</th>
              <th className="py-3 px-4 text-right">Variazione Presenza</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {monthDays.map(day => {
              const isWeekend = day.type === DAY_TYPES.WEEKEND;
              const isHoliday = day.type === DAY_TYPES.HOLIDAY || day.type === DAY_TYPES.PATRON;

              return (
                <tr 
                  key={day.dateKey}
                  className={`hover:bg-slate-50 transition-colors ${
                    isWeekend ? 'bg-slate-50/60 text-slate-400' : ''
                  }`}
                >
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">
                    {day.dateKey}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`font-semibold ${day.dayOfWeek === 0 || day.dayOfWeek === 6 ? 'text-[#cd212a]' : 'text-slate-700'}`}>
                      {day.dayName}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {day.type === DAY_TYPES.WORK && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        Servizio ({day.scheduledHours}h)
                      </span>
                    )}
                    {day.type === DAY_TYPES.FERIE && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Palmtree className="w-3 h-3 text-emerald-700" />
                        Ferie Ordinarie
                      </span>
                    )}
                    {day.type === DAY_TYPES.PERMESSO_PERSONALE && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#0059b3] border border-blue-300">
                        <Clock className="w-3 h-3 text-[#0066cc]" />
                        Permesso Personale ({day.usedPermitHours || day.scheduledHours}h)
                      </span>
                    )}
                    {day.type === DAY_TYPES.PERMESSO_MEDICO && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                        <Clock className="w-3 h-3 text-sky-600" />
                        Visita Medica ({day.usedPermitHours || day.scheduledHours}h)
                      </span>
                    )}
                    {day.type === DAY_TYPES.HOLIDAY && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        <Flag className="w-3 h-3 text-rose-600" />
                        {day.label}
                      </span>
                    )}
                    {day.type === DAY_TYPES.PATRON && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        {day.label}
                      </span>
                    )}
                    {day.type === DAY_TYPES.WEEKEND && (
                      <span className="text-slate-400 text-xs font-medium">Riposo settimanale</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center font-mono font-medium">
                    {day.scheduledHours ? `${day.scheduledHours}h` : '—'}
                  </td>
                  <td className="py-2 px-4 text-center font-mono font-bold">
                    {day.workedHours > 0 ? (
                      <span className="text-slate-800">
                        {day.workedHours}h
                        {day.overtimeHours > 0 && (
                          <span className="ml-1 text-amber-700 font-black">+{day.overtimeHours}h str.</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-emerald-800">0h</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {day.bridgeInfo ? (
                      <span className="text-[#0059b3] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        {day.bridgeInfo}
                      </span>
                    ) : day.overtimeNote && day.overtimeHours > 0 ? (
                      <span className="text-amber-800 font-medium">
                        {day.overtimeNote}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {!isWeekend && !isHoliday && (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onUpdateDayStatus(day.dateKey, DAY_TYPES.WORK)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer border ${
                            day.type === DAY_TYPES.WORK 
                              ? 'bg-slate-700 text-white border-slate-800' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title="Imposta come giorno di servizio"
                        >
                          Servizio
                        </button>
                        <button
                          onClick={() => onUpdateDayStatus(day.dateKey, DAY_TYPES.FERIE)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer border ${
                            day.type === DAY_TYPES.FERIE 
                              ? 'bg-emerald-700 text-white border-emerald-800' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                          title="Imposta Ferie Ordinarie"
                        >
                          Ferie
                        </button>
                        <button
                          onClick={() => onUpdateDayStatus(day.dateKey, DAY_TYPES.PERMESSO_PERSONALE)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer border ${
                            day.type === DAY_TYPES.PERMESSO_PERSONALE 
                              ? 'bg-[#0059b3] text-white border-[#00478f]' 
                              : 'bg-blue-50 hover:bg-blue-100 text-[#0059b3] border-blue-300'
                          }`}
                          title="Imposta Permesso Personale Retribuito"
                        >
                          Perm. Pers.
                        </button>
                        <button
                          onClick={() => onUpdateDayStatus(day.dateKey, DAY_TYPES.PERMESSO_MEDICO)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer border ${
                            day.type === DAY_TYPES.PERMESSO_MEDICO 
                              ? 'bg-sky-700 text-white border-sky-800' 
                              : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
                          }`}
                          title="Imposta Permesso Visita Medica Retribuito"
                        >
                          Visita Med.
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
