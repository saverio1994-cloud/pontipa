import React from 'react';
import { X, Briefcase, Palmtree, Clock, Flag, Award, Sparkles, Check, Building2, Coins } from 'lucide-react';
import { DAY_TYPES } from '../utils/optimizer.js';

export function DayEditModal({ day, onClose, onUpdateStatus }) {
  if (!day) return null;

  const isWeekend = day.originalType === DAY_TYPES.WEEKEND;
  const isHoliday = day.originalType === DAY_TYPES.HOLIDAY || day.originalType === DAY_TYPES.PATRON;
  const currentDateObj = day.date instanceof Date ? day.date : new Date(day.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-md w-full overflow-hidden">
        {/* Header Istituzionale VVF */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#8f141b] to-[#6b0d12] text-white flex items-center justify-between border-b border-[#590a0e]">
          <div>
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              Registro Presenze • Variazione Stato Giuridico
            </span>
            <h3 className="text-base sm:text-lg font-black mt-0.5">
              {day.dayName} {day.day} {currentDateObj.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Contrattuale</span>
              <span className="text-sm font-black text-slate-800">
                {day.scheduledHours ? `${day.scheduledHours}h` : '0h'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Servizio Ord.</span>
              <span className="text-sm font-black text-emerald-800">
                {day.workedHours}h
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Straordinario</span>
              <span className="text-sm font-black text-amber-700">
                +{day.overtimeHours || 0}h
              </span>
            </div>
          </div>

          {day.overtimeNote && day.overtimeHours > 0 && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
              <span className="font-bold flex items-center gap-1 mb-0.5 text-xs">
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                Piano Straordinario:
              </span>
              <p className="text-[11px]">{day.overtimeNote}</p>
            </div>
          )}

          {day.bridgeInfo && (
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#0059b3]">
              <span className="font-bold flex items-center gap-1 mb-0.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
                Decreto / Motivazione Ponte:
              </span>
              <p className="text-[11px]">{day.bridgeInfo}</p>
            </div>
          )}

          {isHoliday && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Festività Ufficiale: <strong>{day.label}</strong> (astensione obbligatoria dal servizio)</span>
            </div>
          )}

          {isWeekend && (
            <div className="p-2.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
              Giornata di riposo settimanale ordinario (Sabato/Domenica).
            </div>
          )}

          {!isWeekend && !isHoliday && (
            <div>
              <span className="font-bold text-slate-800 block mb-2 text-[11px] uppercase tracking-wider">
                Seleziona Stato Giuridico per la Giornata:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    onUpdateStatus(day.dateKey, DAY_TYPES.WORK);
                    onClose();
                  }}
                  className={`p-2.5 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    day.type === DAY_TYPES.WORK 
                      ? 'border-[#0059b3] bg-blue-50/50 font-bold text-[#0059b3] ring-1 ring-[#0059b3]' 
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>Servizio Ordinario ({day.scheduledHours}h)</span>
                  </div>
                  {day.type === DAY_TYPES.WORK && <Check className="w-4 h-4 text-[#0059b3]" />}
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(day.dateKey, DAY_TYPES.FERIE);
                    onClose();
                  }}
                  className={`p-2.5 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    day.type === DAY_TYPES.FERIE 
                      ? 'border-emerald-700 bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-700' 
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Palmtree className="w-4 h-4 text-emerald-700" />
                    <span>Congedo Ordinario / Ferie (1 giorno intero)</span>
                  </div>
                  {day.type === DAY_TYPES.FERIE && <Check className="w-4 h-4 text-emerald-700" />}
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(day.dateKey, DAY_TYPES.PERMESSO_PERSONALE);
                    onClose();
                  }}
                  className={`p-2.5 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    day.type === DAY_TYPES.PERMESSO_PERSONALE 
                      ? 'border-[#0059b3] bg-blue-50 font-bold text-[#0059b3] ring-1 ring-[#0059b3]' 
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0066cc]" />
                    <span>Permesso Retribuito Motivi Personali ({day.scheduledHours}h)</span>
                  </div>
                  {day.type === DAY_TYPES.PERMESSO_PERSONALE && <Check className="w-4 h-4 text-[#0059b3]" />}
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(day.dateKey, DAY_TYPES.PERMESSO_MEDICO);
                    onClose();
                  }}
                  className={`p-2.5 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    day.type === DAY_TYPES.PERMESSO_MEDICO 
                      ? 'border-sky-700 bg-sky-50 font-bold text-sky-900 ring-1 ring-sky-700' 
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-700" />
                    <span>Permesso Retribuito Visita Medica ({day.scheduledHours}h)</span>
                  </div>
                  {day.type === DAY_TYPES.PERMESSO_MEDICO && <Check className="w-4 h-4 text-sky-700" />}
                </button>
              </div>

              {/* Selezione Rapida Ore di Straordinario sulla Giornata */}
              <div className="mt-3.5 pt-3 border-t border-slate-200">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  Servizio con Ore di Straordinario:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map(hrs => {
                    const isSelected = day.type === DAY_TYPES.WORK && (day.overtimeHours || 0) === hrs;
                    return (
                      <button
                        key={hrs}
                        onClick={() => {
                          onUpdateStatus(day.dateKey, DAY_TYPES.WORK, hrs);
                          onClose();
                        }}
                        className={`py-2 px-2 rounded border text-center font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-amber-50/60 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {hrs === 0 ? '0h Str.' : `+${hrs}h Str.`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
