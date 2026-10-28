import React from 'react';
import { MONTH_NAMES_IT, DAY_TYPES } from '../utils/optimizer.js';
import { Palmtree, Clock, Flag, Award, Sparkles, Building2 } from 'lucide-react';

const WEEKDAYS_SHORT = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function CalendarYearView({ calendar, year, onSelectDay }) {
  if (!calendar || calendar.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-300 text-center text-slate-500">
        Caricamento del calendario in corso...
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, monthIdx) => {
    return calendar.filter(d => d.month === monthIdx);
  });

  return (
    <div className="space-y-6">
      {/* Legenda Istituzionale VVF / PA ad Alta Visibilità */}
      <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#8f141b] uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#8f141b]" />
            Legenda Codici Presenza / Assenza (clicca su un giorno per variarlo):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-200"></span>
            Ferie (FER)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0059b3] text-white font-extrabold text-xs sm:text-sm shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-200" />
            Perm. Personale (P)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
            <Clock className="w-3.5 h-3.5 text-sky-200" />
            Visita Medica (M)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#8f141b] text-white font-extrabold text-xs sm:text-sm shadow-xs">
            <Flag className="w-3.5 h-3.5 text-amber-300" />
            Festività / Patrono
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-950 border-2 border-amber-500 font-extrabold text-xs sm:text-sm">
            Servizio + Straord. (+h)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-900 border-2 border-slate-300 font-extrabold text-xs sm:text-sm">
            Servizio (6h / 9h)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-200 text-slate-600 font-bold text-xs sm:text-sm">
            Riposo (Sab/Dom)
          </div>
        </div>
      </div>

      {/* Griglia dei 12 Mesi Maggiorata (3 colonne su schermi ampi per caratteri grandi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {months.map((monthDays, monthIdx) => {
          const firstDay = monthDays[0];
          const firstDayDow = firstDay.dayOfWeek === 0 ? 6 : firstDay.dayOfWeek - 1;

          const workCount = monthDays.filter(d => d.type === DAY_TYPES.WORK).length;
          const ferieCount = monthDays.filter(d => d.type === DAY_TYPES.FERIE).length;
          const permessiCount = monthDays.filter(d => 
            d.type === DAY_TYPES.PERMESSO_PERSONALE || d.type === DAY_TYPES.PERMESSO_MEDICO
          ).length;
          const overtimeMonthHours = Number(monthDays.reduce((acc, d) => acc + (d.type === DAY_TYPES.WORK ? (d.overtimeHours || 0) : 0), 0).toFixed(1));

          return (
            <div 
              key={monthIdx} 
              className="bg-white rounded-xl border-2 border-slate-300 shadow-sm hover:border-[#8f141b] transition-colors flex flex-col overflow-hidden"
            >
              {/* Intestazione Mese in Stile VVF */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#8f141b] to-[#6e0e14] text-white flex items-center justify-between border-b border-[#590a0e]">
                <span className="font-black text-base sm:text-lg uppercase tracking-wide">
                  {MONTH_NAMES_IT[monthIdx]}
                </span>
                <span className="text-xs font-extrabold text-slate-950 bg-amber-300 px-2.5 py-0.5 rounded-md shadow-2xs">
                  {workCount} serv. {ferieCount + permessiCount > 0 && `• ${ferieCount + permessiCount} ass.`} {overtimeMonthHours > 0 && `• +${overtimeMonthHours}h`}
                </span>
              </div>

              {/* Griglia Calendario Mese */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                {/* Header giorni settimana */}
                <div className="grid grid-cols-7 gap-1.5 text-center mb-2 border-b border-slate-200 pb-1.5">
                  {WEEKDAYS_SHORT.map((wd, i) => (
                    <span 
                      key={i} 
                      className={`text-xs sm:text-sm font-black ${i >= 5 ? 'text-[#8f141b]' : 'text-slate-600'}`}
                    >
                      {wd}
                    </span>
                  ))}
                </div>

                {/* Griglia Giorni con Caselle Grandi e Caratteri Nitidi */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {Array.from({ length: firstDayDow }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11 sm:h-12"></div>
                  ))}

                  {monthDays.map(day => {
                    let cellStyle = 'bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-300 font-bold';
                    let badge = '';

                    if (day.type === DAY_TYPES.FERIE) {
                      cellStyle = 'bg-emerald-700 text-white font-black hover:bg-emerald-800 shadow-xs border-2 border-emerald-900';
                      badge = 'FER';
                    } else if (day.type === DAY_TYPES.PERMESSO_PERSONALE) {
                      cellStyle = 'bg-[#0059b3] text-white font-black hover:bg-[#00478f] shadow-xs border-2 border-[#003d80]';
                      badge = 'PERM';
                    } else if (day.type === DAY_TYPES.PERMESSO_MEDICO) {
                      cellStyle = 'bg-sky-700 text-white font-black hover:bg-sky-800 shadow-xs border-2 border-sky-900';
                      badge = 'MED';
                    } else if (day.type === DAY_TYPES.HOLIDAY) {
                      cellStyle = 'bg-[#8f141b] text-white border-2 border-[#5e0b10] font-black hover:bg-[#751016]';
                      badge = 'FESTA';
                    } else if (day.type === DAY_TYPES.PATRON) {
                      cellStyle = 'bg-amber-600 text-white border-2 border-amber-800 font-black hover:bg-amber-700';
                      badge = 'PATR';
                    } else if (day.type === DAY_TYPES.WEEKEND) {
                      cellStyle = 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/80 font-bold';
                      badge = '';
                    } else if ((day.overtimeHours || 0) > 0) {
                      cellStyle = 'bg-amber-100 text-amber-950 border-2 border-amber-500 font-black hover:bg-amber-200 shadow-2xs';
                      badge = `${day.scheduledHours}+${day.overtimeHours}h`;
                    } else {
                      badge = `${day.scheduledHours}h`;
                    }

                    return (
                      <button
                        key={day.dateKey}
                        onClick={() => onSelectDay(day)}
                        className={`h-11 sm:h-12 rounded-lg flex flex-col items-center justify-center relative transition-transform active:scale-95 cursor-pointer ${cellStyle}`}
                        title={`${day.dateKey} (${day.dayName}): ${day.label || 'Servizio Ordinario'} ${day.scheduledHours ? `[${day.scheduledHours}h ord.${day.overtimeHours ? ` + ${day.overtimeHours}h straord.` : ''}]` : ''} ${day.bridgeInfo ? `\nMotivazione: ${day.bridgeInfo}` : ''}${day.overtimeNote ? `\nStraordinario: ${day.overtimeNote}` : ''}`}
                      >
                        <span className="leading-none text-sm sm:text-base font-black">{day.day}</span>
                        {badge && (
                          <span className={`text-[10px] leading-none mt-1 font-extrabold tracking-tight ${
                            day.type === DAY_TYPES.WORK
                              ? (day.overtimeHours ? 'text-amber-900 font-mono' : 'text-slate-600 font-mono')
                              : 'text-white/95'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Mese con segnalazione ponte se presente */}
                {monthDays.some(d => d.bridgeInfo) && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700 truncate">
                    <span className="text-[#8f141b] font-black">Ponte / Nota: </span>
                    {monthDays.find(d => d.bridgeInfo)?.bridgeInfo}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
