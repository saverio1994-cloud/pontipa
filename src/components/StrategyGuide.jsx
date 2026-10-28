import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Scale, 
  AlertCircle 
} from 'lucide-react';

export function StrategyGuide({ config }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intestazione Circolare Ministeriale VVF / PA */}
      <div className="bg-white rounded-xl p-6 sm:p-7 border-2 border-slate-300 border-t-8 border-t-[#8f141b] shadow-sm relative">
        <div className="border-b-2 border-[#8f141b]/30 pb-4 mb-4">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-700 mb-2 gap-2">
            <span className="font-black tracking-wider uppercase text-[#8f141b]">
              MINISTERO DELL&apos;INTERNO • DIPARTIMENTO VIGILI DEL FUOCO & FUNZIONE PUBBLICA
            </span>
            <span className="font-mono bg-red-50 text-[#8f141b] border border-red-200 px-2.5 py-0.5 rounded font-bold">
              CIRCOLARE OPERATIVA N. 36/VVF-PA
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Linee Guida per l&apos;Ottimizzazione dell&apos;Orario a 36 Ore, Massimizzazione del Riposo e Straordinari
          </h2>
          <p className="text-sm sm:text-base text-slate-700 mt-2">
            <strong>Oggetto:</strong> Disciplina della fruizione di congedi ordinari (30 gg), permessi orari retribuiti (18h + 18h), arbitraggio turni 6h/9h per straordinari e clausola di riduzione degli accessi in sede.
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          Il presente documento illustra i principi matematici e giuslavoristici applicati dall&apos;algoritmo di <strong>PontiVVF • PA</strong>. L&apos;obiettivo è consentire al personale di assolvere integralmente all&apos;obbligo contrattuale di 36 ore settimanali, scegliendo tra la <strong>minimizzazione assoluta dei giorni lavorati</strong> oppure la <strong>massimizzazione del compenso da lavoro straordinario</strong>.
        </p>
      </div>

      {/* Grid delle 4 Sezioni della Circolare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sezione 1: Il Principio delle 6 Ore */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs border-t-3 border-t-[#0059b3]">
          <div className="flex items-center gap-2 mb-2.5 text-[#0059b3] font-bold text-sm">
            <Clock className="w-4 h-4" />
            1. Massimizzazione Permessi Orari (36 Ore)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Il contratto attribuisce al dipendente <strong>18 ore di permessi per motivi personali/familiari</strong> e <strong>18 ore per visite mediche</strong> (totale 36 ore annue).
          </p>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Nella configurazione 3gg da 6h + 2gg da 9h:</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  L'algoritmo imputa i permessi orari esclusivamente nelle giornate corte da 6 ore (es. Venerdì o raccordi festivi).
                  18h ÷ 6h = <strong>3 giorni interi liberi</strong> di permesso personale + <strong>3 giorni interi liberi</strong> per visite mediche = <strong className="text-emerald-800 font-bold">+6 INTERE GIORNATE A CASA!</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-slate-600 text-[11px]">
                Se i permessi fossero fruiti su giornate lunghe da 9 ore, coprirebbero solo 2 + 2 = 4 giornate. L'algoritmo fa guadagnare al dipendente <strong>2 ulteriori giorni di totale assenza</strong> all'anno.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#0059b3] font-bold">
            Totale giorni di assenza riconosciuti: 30 ferie + 6 da permessi = 36 giornate lavorative piene.
          </p>
        </div>

        {/* Sezione 2: Moltiplicatore ROI Ponti */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs border-t-3 border-t-[#008c45]">
          <div className="flex items-center gap-2 mb-2.5 text-[#008c45] font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            2. Calcolo Combinatorio Ponti Festivi
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Le giornate di congedo ordinario posizionate a ridosso dei giorni festivi producono un effetto moltiplicativo sul riposo continuativo:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 mb-3">
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span><strong>Ponte Secco (Giovedì o Martedì festivo):</strong> 1 giorno speso</span>
              <span className="font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">4 gg riposo (ROI 4.0x)</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span><strong>Ponte Breve (Mercoledì festivo):</strong> 2 giorni spesi</span>
              <span className="font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded text-[11px]">5 gg riposo (ROI 2.5x)</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span><strong>Cluster 25 Aprile & 1 Maggio:</strong> 3 giorni spesi</span>
              <span className="font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">10 gg riposo (ROI 3.3x)</span>
            </li>
          </ul>
          <p className="text-[11px] text-[#008c45] font-bold">
            Priorità automatica alle finestre ad alto rendimento, ordinando i ponti dal moltiplicatore più vantaggioso.
          </p>
        </div>

        {/* Sezione 3: Congedo Estivo */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs border-t-3 border-t-amber-500">
          <div className="flex items-center gap-2 mb-2.5 text-amber-800 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            3. Chiusura Feriale Estiva (Ferragosto)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            In conformità alle disposizioni sull'avvicendamento feriale estivo nella PA, l'algoritmo salvaguarda prioritariamente un blocco continuativo attorno al <strong>15 Agosto (Assunzione)</strong>.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Con l'impostazione predefinita di 2 settimane ad Agosto, si ottengono <strong>16 giorni consecutivi di sospensione del servizio</strong>, impiegando le rimanenti ferie per coprire tutti i ponti primaverili ed autunnali.
          </p>
        </div>

        {/* Sezione 4: Santo Patrono */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs border-t-3 border-t-[#0b2b4d]">
          <div className="flex items-center gap-2 mb-2.5 text-[#0b2b4d] font-bold text-sm">
            <Building2 className="w-4 h-4" />
            4. Integrazione Santo Patrono Locale
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            La festività del Santo Patrono del comune sede di servizio è equiparata a festività nazionale retribuita ai sensi del CCNL.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Città come Milano (Sant&apos;Ambrogio il 7 Dicembre abbinato all&apos;Immacolata dell&apos;8 Dicembre) o Roma (Santi Pietro e Paolo il 29 Giugno) presentano combinazioni speciali che generano fino a 9 giorni liberi con un minimo impegno feriale.
          </p>
        </div>

        {/* Sezione 5: Guadagnare il più possibile con gli Straordinari */}
        <div className="bg-white rounded-lg p-5 border border-amber-300 shadow-xs border-t-3 border-t-amber-600">
          <div className="flex items-center gap-2 mb-2.5 text-amber-800 font-bold text-sm">
            <Scale className="w-4 h-4" />
            5. Arbitraggio Turni 9h/6h per Massimizzare gli Straordinari
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            Quando si seleziona l&apos;obiettivo <strong>&ldquo;Guadagnare il Più Possibile con gli Straordinari&rdquo;</strong>, l&apos;algoritmo sfrutta l&apos;asimmetria tra giornate da 9 ore e giornate da 6 ore:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5">
            <li>• <strong>Ferie sui rientri da 9h:</strong> 1 giorno di ferie speso di Martedì o Giovedì cancella 9 ore di lavoro ordinario (in cui le 3 ore pomeridiane non sono pagate extra).</li>
            <li>• <strong>Presenza sui turni da 6h + Rientro Straordinario:</strong> conservando in servizio i giorni corti da 6h, il dipendente può svolgere fino a <strong>+3h di straordinario retribuito</strong> (lavorando 9h complessive, ma con 3 ore pagate come straordinario e maturazione del Buono Pasto!).</li>
          </ul>
        </div>

        {/* Sezione 6: Clausola Minimi Accessi in Sede */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs border-t-3 border-t-indigo-600">
          <div className="flex items-center gap-2 mb-2.5 text-indigo-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            6. Clausola &ldquo;Venire al Lavoro Meno Volte Possibile&rdquo;
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            Attivando la clausola opzionale <strong>Minimi Accessi in Sede</strong>, il sistema vincola l&apos;uso delle 36 ore di permesso (18h personali + 18h mediche) esclusivamente sui turni brevi da 6 ore, ottenendo <strong>6 intere giornate di assenza</strong> (contro 4 se usate sui 9h).
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            In abbinamento alla modalità Straordinari, riduce al minimo assoluto i viaggi casa-lavoro (~217 presenze annue, <strong>-36 viaggi A/R</strong>) concentrando le ore di straordinario solo nei giorni in cui ci si reca già fisicamente in ufficio.
          </p>
        </div>
      </div>
    </div>
  );
}
