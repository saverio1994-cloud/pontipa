import React, { useState } from 'react';
import {
  PROFESSIONAL_ROLES,
  OVERTIME_TYPES,
  getComputedOvertimeRate,
} from '../utils/payroll.js';
import { OPTIMIZATION_GOALS } from '../utils/optimizer.js';
import {
  Coins,
  UserCheck,
  Award,
  FileText,
  TrendingUp,
  Clock,
  Utensils,
  Building2,
  Printer,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

export function PayrollView({ payroll, config, year, onUpdatePayrollConfig }) {
  const [selectedSlipIdx, setSelectedSlipIdx] = useState(0); // 0..11 = Gen..Dic, 12 = 13a Mensilità

  if (!payroll) return null;

  const { role, seniority, effectiveOvertimeRate, monthlySlips, tredicesima, summary } = payroll;
  const isTredicesima = selectedSlipIdx === 12;
  const activeSlip = isTredicesima ? tredicesima : monthlySlips[selectedSlipIdx];

  const handleRoleChange = (newRoleId) => {
    const newRate = getComputedOvertimeRate(
      newRoleId,
      config.seniorityYears ?? 8,
      config.overtimeTypeId || 'diurno'
    );
    onUpdatePayrollConfig({
      roleId: newRoleId,
      overtimeHourlyRate: newRate,
    });
  };

  const handleSeniorityChange = (newYears) => {
    const yrs = Math.max(0, Math.min(42, parseInt(newYears, 10) || 0));
    const newRate = getComputedOvertimeRate(
      config.roleId || 'vigile_esperto',
      yrs,
      config.overtimeTypeId || 'diurno'
    );
    onUpdatePayrollConfig({
      seniorityYears: yrs,
      overtimeHourlyRate: newRate,
    });
  };

  const handleOvertimeTypeChange = (newTypeId) => {
    const newRate = getComputedOvertimeRate(
      config.roleId || 'vigile_esperto',
      config.seniorityYears ?? 8,
      newTypeId
    );
    onUpdatePayrollConfig({
      overtimeTypeId: newTypeId,
      overtimeHourlyRate: newRate,
    });
  };

  const formatEuro = (val) =>
    Number(val || 0).toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      {/* Pannello Configurazione Inquadramento Giuridico-Economico VVF / PA */}
      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#8f141b] via-[#9e1b22] to-[#6b0d12] px-6 py-4 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#590a0e]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-black/30 border border-amber-400/70 flex items-center justify-center text-amber-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 block">
                Ministero dell&apos;Interno • Gestione Economica & NoiPA
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Inquadramento Qualifica, Anzianità di Servizio e Simulazione Buste Paga {year}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {config.optimizationGoal !== OPTIMIZATION_GOALS.MAX_OVERTIME && (
              <button
                type="button"
                onClick={() =>
                  onUpdatePayrollConfig({
                    optimizationGoal: OPTIMIZATION_GOALS.MAX_OVERTIME,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8f141b]" />
                Attiva Piano Max Straordinari
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-sm transition-colors cursor-pointer no-print"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              Stampa Cedolino
            </button>
          </div>
        </div>

        {/* Form Inquadramento Professionale */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Figura Professionale / Qualifica */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b] mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              1. Qualifica / Figura Professionale
            </label>
            <select
              value={config.roleId || 'vigile_esperto'}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 bg-white font-extrabold text-slate-900 text-sm focus:border-[#8f141b] outline-none"
            >
              {['Ruolo Operativo VVF', 'Capi Squadra e Capi Reparto', 'Ispettori e Direttivi Antincendi', 'Ruolo Tecnico-Professionale (RTP) / PA'].map(cat => (
                <optgroup key={cat} label={cat}>
                  {PROFESSIONAL_ROLES.filter(r => r.category === cat).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Param. {r.parametro})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="block text-xs font-bold text-slate-600 mt-1">
              Codice Ruolo: <strong className="text-slate-900">{role.code}</strong> • Parametro: <strong className="text-slate-900">{role.parametro}</strong>
            </span>
          </div>

          {/* 2. Anzianità di Servizio */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b] mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              2. Anzianità di Servizio (Anni)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="42"
                value={config.seniorityYears ?? 8}
                onChange={(e) => handleSeniorityChange(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border-2 border-slate-300 bg-white font-black text-slate-950 text-base text-center focus:border-[#8f141b] outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {[2, 6, 11, 18, 25, 30].map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleSeniorityChange(yr)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-extrabold border transition-colors cursor-pointer ${
                      (config.seniorityYears ?? 8) === yr
                        ? 'bg-[#8f141b] text-white border-[#8f141b]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {yr}a
                  </button>
                ))}
              </div>
            </div>
            <span className="block text-xs font-bold text-emerald-800 mt-1">
              Fascia: {seniority.bracketLabel} (+{Math.round(seniority.tabellarePct * 100)}% scatto)
            </span>
          </div>

          {/* 3. Tipologia Maggiorazione Straordinario */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              3. Fascia Straordinario & Tariffa
            </label>
            <select
              value={config.overtimeTypeId || 'diurno'}
              onChange={(e) => handleOvertimeTypeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 bg-white font-extrabold text-slate-900 text-sm focus:border-[#8f141b] outline-none"
            >
              {OVERTIME_TYPES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="block text-xs font-bold text-amber-900 mt-1">
              Tariffa Oraria Calcolata: <strong className="font-mono text-sm">{formatEuro(effectiveOvertimeRate)} €/ora</strong>
            </span>
          </div>

          {/* 4. Monte Ore Straordinario Annuo Target */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#8f141b] mb-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              4. Budget Ore Straordinario Annuo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="400"
                step="10"
                value={config.maxOvertimeHoursYear ?? 180}
                onChange={(e) =>
                  onUpdatePayrollConfig({
                    maxOvertimeHoursYear: Math.max(0, parseFloat(e.target.value) || 0),
                    optimizationGoal: OPTIMIZATION_GOALS.MAX_OVERTIME,
                  })
                }
                className="w-24 px-3 py-2 rounded-lg border-2 border-amber-400 bg-white font-black text-amber-900 text-base text-center outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {[0, 90, 180, 250].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() =>
                      onUpdatePayrollConfig({
                        maxOvertimeHoursYear: h,
                        optimizationGoal: h > 0 ? OPTIMIZATION_GOALS.MAX_OVERTIME : OPTIMIZATION_GOALS.MIN_WORK,
                      })
                    }
                    className={`px-2.5 py-1.5 rounded-md text-xs font-extrabold border transition-colors cursor-pointer ${
                      (config.maxOvertimeHoursYear ?? 180) === h &&
                      (h === 0 || config.optimizationGoal === OPTIMIZATION_GOALS.MAX_OVERTIME)
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
            <span className="block text-xs font-bold text-slate-600 mt-1">
              Pianificate nel calendario: <strong className="text-amber-800">{summary.annualTotalOvertimeHours} ore</strong>
            </span>
          </div>
        </div>

        {/* 4 Grandi Card KPI Economiche Annuali */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
          <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/40">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
              Netto Annuo Totale in Busta (13 Mensilità)
            </span>
            <div className="text-3xl font-black text-emerald-800 mt-1 font-mono">
              € {formatEuro(summary.annualNetPay)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1.5 flex items-center justify-between">
              <span>Lordo Annuo (RAL):</span>
              <strong className="font-mono">€ {formatEuro(summary.annualGrossTotal)}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-[#8f141b] bg-red-50/30">
            <span className="text-xs font-black uppercase tracking-wider text-[#8f141b] block">
              Netto Medio Mensile in Busta
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1 font-mono">
              € {formatEuro(summary.averageMonthlyNet)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1.5 flex items-center justify-between">
              <span>13ª Mensilità Netta:</span>
              <strong className="text-[#8f141b] font-mono">€ {formatEuro(tredicesima.netPay)}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/50">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
              Guadagno Annuo da Straordinari ({summary.annualTotalOvertimeHours}h)
            </span>
            <div className="text-3xl font-black text-amber-800 mt-1 font-mono">
              +€ {formatEuro(summary.annualGrossOvertime)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-amber-950 mt-1.5 flex items-center justify-between">
              <span>Netto in tasca da straord.:</span>
              <strong className="text-emerald-800 font-mono">+€ {formatEuro(summary.annualNetOvertime)}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/40">
            <span className="text-xs font-black uppercase tracking-wider text-[#0059b3] block">
              Buoni Pasto Maturati + Netto Complessivo
            </span>
            <div className="text-3xl font-black text-[#0059b3] mt-1 font-mono">
              +€ {formatEuro(summary.annualMealVouchersAmount)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1.5 flex items-center justify-between">
              <span>{summary.annualMealVouchersCount} buoni esentasse • Totale:</span>
              <strong className="text-slate-950 font-mono">€ {formatEuro(summary.annualTotalTakeHome)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Cedolino Interattivo NoiPA / VVF + Selettore Mese */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonna Sinistra: Selettore Mensilità (Gen..Dic + 13ª) */}
        <div className="lg:col-span-4 bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#1c1f24] text-white font-black text-sm uppercase tracking-wider flex items-center justify-between">
            <span>Seleziona Cedolino Mensile</span>
            <span className="text-amber-400 font-mono text-xs">{year}</span>
          </div>
          <div className="p-3 divide-y divide-slate-200 flex-1 overflow-y-auto">
            {monthlySlips.map((slip, idx) => {
              const isSelected = selectedSlipIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSlipIdx(idx)}
                  className={`w-full py-2.5 px-3 text-left flex items-center justify-between transition-colors cursor-pointer rounded-lg ${
                    isSelected
                      ? 'bg-[#8f141b] text-white font-black shadow-xs'
                      : 'hover:bg-slate-100 text-slate-800 font-bold'
                  }`}
                >
                  <div>
                    <span className="text-sm sm:text-base block leading-tight">{slip.monthName}</span>
                    <span className={`text-xs ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                      {slip.workDays} gg serv. • {slip.ferieDays + slip.permessiDays} ass.
                      {slip.overtimeHours > 0 ? ` • +${slip.overtimeHours}h str.` : ''}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-sm sm:text-base font-black block ${isSelected ? 'text-white' : 'text-emerald-800'}`}>
                      € {formatEuro(slip.netPay)}
                    </span>
                    {slip.grossOvertimeMonth > 0 && (
                      <span className={`text-[11px] block ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>
                        +{formatEuro(slip.grossOvertimeMonth)}€ str.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* 13ª Mensilità */}
            <button
              type="button"
              onClick={() => setSelectedSlipIdx(12)}
              className={`w-full py-3 px-3 mt-2 text-left flex items-center justify-between transition-colors cursor-pointer rounded-lg border-2 ${
                isTredicesima
                  ? 'bg-amber-600 text-white border-amber-700 font-black'
                  : 'bg-amber-50/70 hover:bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
              }`}
            >
              <div>
                <span className="text-sm sm:text-base block">13ª Mensilità (Dicembre)</span>
                <span className={`text-xs ${isTredicesima ? 'text-amber-100' : 'text-amber-800'}`}>
                  Rateo Tredicesima Contrattuale CCNL
                </span>
              </div>
              <span className="text-base font-mono font-black">
                € {formatEuro(tredicesima.netPay)}
              </span>
            </button>
          </div>
        </div>

        {/* Colonna Destra: Dettaglio Cedolino Busta Paga Stile NoiPA / VVF */}
        <div className="lg:col-span-8 bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Intestazione Cedolino Ufficiale */}
            <div className="p-5 bg-slate-900 text-white border-b-4 border-[#8f141b] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-amber-400">
                  MEF - NoiPA • Ministero dell&apos;Interno - Dip. Vigili del Fuoco
                </div>
                <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                  Prospetto Busta Paga: {activeSlip.monthName} {year}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-0.5">
                  Qualifica: <strong className="text-white">{role.name}</strong> ({role.code}) • Anzianità: <strong className="text-white">{config.seniorityYears ?? 8} anni</strong>
                </p>
              </div>
              <div className="bg-emerald-900/80 border-2 border-emerald-400 px-4 py-2.5 rounded-xl text-right shrink-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">
                  Netto in Busta Paga
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  € {formatEuro(activeSlip.netPay)}
                </span>
              </div>
            </div>

            {/* Quadro Presenze del Mese (se non è 13a) */}
            {!isTredicesima && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-slate-100 border-b border-slate-300 text-center text-xs sm:text-sm">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-slate-500 font-bold text-xs">Giorni Lavorati</span>
                  <strong className="text-base sm:text-lg font-black text-slate-900">{activeSlip.workDays} gg</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-slate-500 font-bold text-xs">Ore Ordinarie</span>
                  <strong className="text-base sm:text-lg font-black text-slate-900 font-mono">{activeSlip.workedHours}h</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-slate-500 font-bold text-xs">Ferie + Permessi</span>
                  <strong className="text-base sm:text-lg font-black text-emerald-800">
                    {activeSlip.ferieDays + activeSlip.permessiDays} gg
                  </strong>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300">
                  <span className="block text-amber-900 font-bold text-xs">Ore Straordinario</span>
                  <strong className="text-base sm:text-lg font-black text-amber-800 font-mono">
                    +{activeSlip.overtimeHours}h ({activeSlip.overtimeDays} gg)
                  </strong>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 col-span-2 sm:col-span-1">
                  <span className="block text-[#0059b3] font-bold text-xs">Buoni Pasto</span>
                  <strong className="text-base sm:text-lg font-black text-[#0059b3] font-mono">
                    {activeSlip.mealVouchersCount} (€ {formatEuro(activeSlip.mealVouchersAmount)})
                  </strong>
                </div>
              </div>
            )}

            {/* Corpo Voci del Cedolino */}
            <div className="p-5 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-xs font-black uppercase text-slate-600">
                      <th className="py-2 px-3">Cod. Voce</th>
                      <th className="py-2 px-3">Descrizione Voce Stipendiale (CCNL VVF / PA)</th>
                      <th className="py-2 px-3 text-right">Competenze (€)</th>
                      <th className="py-2 px-3 text-right">Trattenute (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {!isTredicesima ? (
                      <>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500">001/TAB</td>
                          <td className="py-2.5 px-3">Stipendio Tabellare Base ({role.name} - Param. {role.parametro})</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatEuro(activeSlip.tabellareBase)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500">002/ANZ</td>
                          <td className="py-2.5 px-3">
                            Maggiorazione / Scatto Anzianità di Servizio ({seniority.bracketLabel})
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatEuro(activeSlip.scattoAnzianita)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500">014/RIS</td>
                          <td className="py-2.5 px-3">Indennità di Rischio Operativo VVF / Indennità Amministrazione</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatEuro(activeSlip.indennitaRischio)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500">021/SPE</td>
                          <td className="py-2.5 px-3">Assegno di Specificità / Indennità Vacanza Contrattuale</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatEuro(activeSlip.assegnoSpecificita)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500">045/PRE</td>
                          <td className="py-2.5 px-3">
                            Indennità Giornaliera di Presenza ({activeSlip.workDays} presenze × 4,20 €)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatEuro(activeSlip.indennitaPresenzaMese)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                        <tr className="bg-amber-50/80">
                          <td className="py-2.5 px-3 font-mono text-xs font-bold text-amber-900">088/STR</td>
                          <td className="py-2.5 px-3 font-extrabold text-amber-950">
                            Compenso Lavoro Straordinario ({activeSlip.overtimeHours} ore × {formatEuro(activeSlip.effectiveOvertimeRate)} €/h)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-800">
                            {formatEuro(activeSlip.grossOvertimeMonth)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-500">013/TRE</td>
                        <td className="py-2.5 px-3 font-bold">
                          13ª Mensilità (Tabellare + Anzianità + Indennità Fissa)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                          {formatEuro(activeSlip.grossFixedMonth)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                      </tr>
                    )}

                    {/* Trattenute Previdenziali e Fiscali */}
                    <tr className="bg-rose-50/40">
                      <td className="py-2.5 px-3 font-mono text-xs text-rose-800">801/INP</td>
                      <td className="py-2.5 px-3 text-rose-950">
                        Contributi Previdenziali INPS (Gestione ex-INPDAP 8,80% + Fondo Credito 0,35%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        -{formatEuro(activeSlip.inpsContributions)}
                      </td>
                    </tr>
                    <tr className="bg-rose-50/40">
                      <td className="py-2.5 px-3 font-mono text-xs text-rose-800">810/IRP</td>
                      <td className="py-2.5 px-3 text-rose-950">
                        Ritenuta Fiscale IRPEF Netta (al netto detrazioni lavoro dipendente art. 13 TUIR)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        -{formatEuro(activeSlip.monthlyIrpefNet)}
                      </td>
                    </tr>
                    <tr className="bg-rose-50/40">
                      <td className="py-2.5 px-3 font-mono text-xs text-rose-800">820/ADD</td>
                      <td className="py-2.5 px-3 text-rose-950">Addizionale Regionale e Comunale IRPEF</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        -{formatEuro(activeSlip.monthlyLocalTaxes)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-400 bg-slate-100 font-black text-slate-950 text-sm sm:text-base">
                      <td colSpan={2} className="py-3 px-3 uppercase">
                        Totali Lordo / Trattenute del Mese
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-900">
                        € {formatEuro(activeSlip.totalGross)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-800">
                        -€ {formatEuro(activeSlip.totalDeductions)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Barra Finale Netto + Buoni Pasto */}
          <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-700 font-semibold">
              Imponibile Fiscale IRPEF Mese:{' '}
              <strong className="font-mono text-slate-950">€ {formatEuro(activeSlip.taxableIrpefMonth)}</strong>
              {!isTredicesima && activeSlip.netOvertimePay > 0 && (
                <span className="ml-3 text-amber-900 font-bold">
                  • Netto generato dagli straordinari: <strong>+€ {formatEuro(activeSlip.netOvertimePay)}</strong>
                </span>
              )}
            </div>
            {!isTredicesima && (
              <div className="text-sm font-black text-[#0059b3] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-lg">
                Totale Netto + Buoni Pasto: € {formatEuro(activeSlip.totalTakeHomeWithVouchers)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabella Riepilogativa Annuale di Tutte le Buste Paga */}
      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
              Quadro Economico Annuale Completo
            </span>
            <h3 className="text-lg sm:text-xl font-black">
              Riepilogo 12 Mensilità + 13ª Mensilità ({role.name} • {config.seniorityYears ?? 8} anni anzianità)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-800 uppercase text-xs font-black border-b-2 border-slate-300">
              <tr>
                <th className="py-3 px-4">Mensilità</th>
                <th className="py-3 px-3 text-center">Giorni Serv.</th>
                <th className="py-3 px-3 text-center">Ore Straord.</th>
                <th className="py-3 px-4 text-right">Fisso Lordo</th>
                <th className="py-3 px-4 text-right">Lordo Straord.</th>
                <th className="py-3 px-4 text-right">Trattenute</th>
                <th className="py-3 px-4 text-right">Netto Busta</th>
                <th className="py-3 px-4 text-right">Buoni Pasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              {monthlySlips.map((m, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedSlipIdx(i)}
                  className={`hover:bg-red-50/40 transition-colors cursor-pointer ${
                    selectedSlipIdx === i ? 'bg-red-50/80 font-extrabold' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-slate-950">{m.monthName}</td>
                  <td className="py-2.5 px-3 text-center">{m.workDays} gg</td>
                  <td className="py-2.5 px-3 text-center font-mono text-amber-800 font-bold">
                    {m.overtimeHours > 0 ? `+${m.overtimeHours}h` : '0h'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">€ {formatEuro(m.grossFixedMonth)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-800 font-bold">
                    {m.grossOvertimeMonth > 0 ? `+€ ${formatEuro(m.grossOvertimeMonth)}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                    -€ {formatEuro(m.totalDeductions)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-800">
                    € {formatEuro(m.netPay)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#0059b3]">
                    € {formatEuro(m.mealVouchersAmount)} ({m.mealVouchersCount})
                  </td>
                </tr>
              ))}
              {/* Riga 13a */}
              <tr
                onClick={() => setSelectedSlipIdx(12)}
                className="bg-amber-50/60 hover:bg-amber-100/70 font-bold cursor-pointer"
              >
                <td className="py-2.5 px-4 text-amber-950 font-black">13ª Mensilità (Dicembre)</td>
                <td className="py-2.5 px-3 text-center">—</td>
                <td className="py-2.5 px-3 text-center">—</td>
                <td className="py-2.5 px-4 text-right font-mono">€ {formatEuro(tredicesima.grossFixedMonth)}</td>
                <td className="py-2.5 px-4 text-right font-mono">—</td>
                <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                  -€ {formatEuro(tredicesima.totalDeductions)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-800">
                  € {formatEuro(tredicesima.netPay)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">—</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-sm sm:text-base">
              <tr>
                <td className="py-3.5 px-4 uppercase text-amber-400">Totale Annuo Complessivo</td>
                <td className="py-3.5 px-3 text-center">
                  {monthlySlips.reduce((a, b) => a + b.workDays, 0)} gg
                </td>
                <td className="py-3.5 px-3 text-center font-mono text-amber-300">
                  +{summary.annualTotalOvertimeHours}h
                </td>
                <td className="py-3.5 px-4 text-right font-mono">€ {formatEuro(summary.annualGrossFixed)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-300">
                  +€ {formatEuro(summary.annualGrossOvertime)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-300">
                  -€ {formatEuro(summary.annualTotalDeductions)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-300">
                  € {formatEuro(summary.annualNetPay)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sky-300">
                  € {formatEuro(summary.annualMealVouchersAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

