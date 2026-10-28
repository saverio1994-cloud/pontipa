import React from 'react';
import { 
  Briefcase, 
  Palmtree, 
  CalendarDays, 
  Clock, 
  Flame, 
  Sparkles,
  Award,
  FileCheck2,
  Coins
} from 'lucide-react';

export function KpiCards({ stats, config }) {
  const is3x6 = config.scheduleMode === '3x6_2x9';
  const isMaxOvertime = config.optimizationGoal === 'max_overtime' || (stats.totalOvertimeHours || 0) > 0;
  const totalFerieTarget = config.totalFerie ?? 30;
  const feriePct = totalFerieTarget > 0 ? Math.min(100, Math.round((stats.totalFerieUsed / totalFerieTarget) * 100)) : 100;
  const isFerieOver = stats.totalFerieUsed > totalFerieTarget;

  const totalPermitHoursTarget = Number(((config.personalPermitHours ?? 18) + (config.medicalPermitHours ?? 18)).toFixed(1));
  const usedPermitHoursTotal = Number((stats.totalPermessiPersUsed + stats.totalPermessiMedUsed).toFixed(1));
  const permitPct = totalPermitHoursTarget > 0 ? Math.min(100, Math.round((usedPermitHoursTotal / totalPermitHoursTarget) * 100)) : 100;
  const isPermitOver = usedPermitHoursTotal > totalPermitHoursTarget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* 1. Giorni di Servizio Effettivo */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm relative overflow-hidden border-t-4 border-t-[#8f141b]">
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b]">Giorni in Sede</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8f141b] flex items-center justify-center border border-red-200">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-950">{stats.workDays}</span>
          <span className="text-sm text-slate-600 font-bold">/ {stats.totalDaysInYear} gg</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-[#8f141b] font-extrabold">{stats.workDaysPercentage}% annuo</span>
          <span className="text-slate-700 font-mono font-bold">{stats.totalWorkedHours}h ord.</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-[#8f141b] h-full rounded-full transition-all duration-500" 
            style={{ width: `${stats.workDaysPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Giorni di Riposo & Congedo Totali */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm relative overflow-hidden border-t-4 border-t-[#008c45]">
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-900">Giorni a Casa</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#008c45] flex items-center justify-center border border-emerald-200">
            <Palmtree className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-[#008c45]">{stats.totalRestDays}</span>
          <span className="text-sm text-emerald-900 font-bold">gg liberi</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-[#008c45] font-extrabold">{stats.restDaysPercentage}% riposo</span>
          <span className="text-slate-600 font-bold text-xs">Weekend + Congedi</span>
        </div>
        <div className="w-full bg-emerald-100 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-[#008c45] h-full rounded-full transition-all duration-500" 
            style={{ width: `${stats.restDaysPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Ferie Ordinarie CCNL */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm border-t-4 border-t-emerald-700">
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Ferie Ordinarie</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-black ${isFerieOver ? 'text-rose-700' : 'text-slate-950'}`}>{stats.totalFerieUsed}</span>
          <span className="text-sm text-slate-600 font-bold">/ {totalFerieTarget} gg</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-700 font-semibold">Residuo: <strong className="font-black">{stats.ferieRemaining} gg</strong></span>
          {isFerieOver ? (
            <span className="text-rose-700 font-extrabold text-xs">+{stats.totalFerieUsed - totalFerieTarget} gg oltre</span>
          ) : (
            <span className="text-[#008c45] font-extrabold text-xs">{feriePct}% Fruite</span>
          )}
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className={`${isFerieOver ? 'bg-rose-600' : 'bg-emerald-600'} h-full rounded-full transition-all duration-500`} 
            style={{ width: `${feriePct}%` }}
          />
        </div>
      </div>

      {/* 4. Permessi Orari Retribuiti */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm border-t-4 border-t-[#0059b3]">
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0059b3]">Permessi Orari</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0059b3] flex items-center justify-center border border-blue-200">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl sm:text-4xl font-black ${isPermitOver ? 'text-rose-700' : 'text-[#0059b3]'}`}>
            {usedPermitHoursTotal}h
          </span>
          <span className="text-sm text-slate-600 font-bold">/ {totalPermitHoursTarget}h</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-800">
            {isPermitOver ? (
              <strong className="text-rose-700 font-black">Oltre massimale!</strong>
            ) : (
              <strong className="text-[#0059b3] font-black">+{stats.permessiDaysUsed ?? (is3x6 ? 6 : 4)} gg a casa!</strong>
            )}
          </span>
          <span className="text-slate-600 font-bold text-xs">{config.personalPermitHours ?? 18}h + {config.medicalPermitHours ?? 18}h</span>
        </div>
        <div className="w-full bg-blue-100 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className={`${isPermitOver ? 'bg-rose-600' : 'bg-[#0059b3]'} h-full rounded-full transition-all duration-500`} 
            style={{ width: `${permitPct}%` }}
          />
        </div>
      </div>

      {/* 5. Max Astensione Continuativa */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm border-t-4 border-t-amber-500">
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900">Max Riposo</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-amber-700">{stats.maxConsecutiveRestDays}</span>
          <span className="text-sm text-amber-950 font-bold">gg di fila</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-700 font-semibold">Continuativi</span>
          <span className="text-amber-800 font-extrabold text-xs">Super Ponte</span>
        </div>
        <div className="w-full bg-amber-100 h-2 rounded-full mt-2.5 overflow-hidden">
          <div className="bg-amber-500 h-full rounded-full w-full" />
        </div>
      </div>

      {/* 6. Straordinari & Ponti Riconosciuti */}
      {isMaxOvertime ? (
        <div className="bg-white rounded-xl p-4 border-2 border-amber-500 shadow-sm border-t-4 border-t-amber-600 bg-gradient-to-b from-amber-50/60 to-white">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">Extra Straord.</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">+{stats.totalOvertimePay}€</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-amber-950 font-extrabold">{stats.totalOvertimeHours}h ({stats.overtimeDaysCount} gg)</span>
            <span className="text-[#8f141b] font-extrabold text-xs">{stats.bridgesCount} ponti</span>
          </div>
          <div className="w-full bg-amber-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((stats.totalOvertimeHours || 0) / (config.maxOvertimeHoursYear || 180)) * 100))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-sm border-t-4 border-t-[#8f141b]">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b]">Ponti Attivi</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8f141b] flex items-center justify-center border border-red-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#8f141b]">{stats.bridgesCount}</span>
            <span className="text-sm text-slate-600 font-bold">blocchi</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-700 font-bold">-{stats.commuteDaysSaved || 36} viaggi A/R</span>
            <span className="text-[#8f141b] font-extrabold text-xs">{stats.totalSavedHours}h risp.</span>
          </div>
          <div className="w-full bg-red-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#8f141b] h-full rounded-full w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
