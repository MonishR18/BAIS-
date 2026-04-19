import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, ScatterChart, Scatter, Cell,
} from "recharts";
import { Info, CheckCircle2, AlertTriangle, XCircle, TrendingDown } from "lucide-react";

type MetricTab = "dp" | "eo" | "eodds" | "di";

const demographicParityData = [
  { group: "Male", rate: 30.4 },
  { group: "Female", rate: 11.3 },
  { group: "White", rate: 26.0 },
  { group: "Black", rate: 12.9 },
  { group: "Asian/PI", rate: 27.2 },
  { group: "Hispanic", rate: 14.2 },
];

const equalOpportunityData = [
  { group: "Male", tpr: 0.81 },
  { group: "Female", tpr: 0.63 },
  { group: "White", tpr: 0.79 },
  { group: "Black", tpr: 0.58 },
  { group: "Asian/PI", tpr: 0.82 },
  { group: "Hispanic", tpr: 0.61 },
];

const equalizedOddsData = [
  { group: "Male", tpr: 0.81, fpr: 0.12 },
  { group: "Female", tpr: 0.63, fpr: 0.08 },
  { group: "White", tpr: 0.79, fpr: 0.11 },
  { group: "Black", tpr: 0.58, fpr: 0.07 },
  { group: "Asian/PI", tpr: 0.82, fpr: 0.09 },
  { group: "Hispanic", tpr: 0.61, fpr: 0.10 },
];

const disparateImpactData = [
  { pair: "F/M", ratio: 0.37, threshold: 0.80 },
  { pair: "Black/White", ratio: 0.50, threshold: 0.80 },
  { pair: "Hisp./White", ratio: 0.55, threshold: 0.80 },
  { pair: "Asian/White", ratio: 1.05, threshold: 0.80 },
];

const tabs: { id: MetricTab; label: string; status: "fail" | "warn" | "pass" }[] = [
  { id: "dp", label: "Demographic Parity", status: "fail" },
  { id: "eo", label: "Equal Opportunity", status: "fail" },
  { id: "eodds", label: "Equalized Odds", status: "fail" },
  { id: "di", label: "Disparate Impact", status: "fail" },
];

const statusIcon = {
  fail: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  pass: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
};

interface MetricCardProps {
  title: string;
  value: string;
  threshold: string;
  status: "fail" | "warn" | "pass";
  description: string;
}

function MetricCard({ title, value, threshold, status, description }: MetricCardProps) {
  const colors = {
    fail: "border-red-500/30 bg-red-500/5",
    warn: "border-amber-500/30 bg-amber-500/5",
    pass: "border-emerald-500/30 bg-emerald-500/5",
  };
  const valColors = { fail: "text-red-400", warn: "text-amber-400", pass: "text-emerald-400" };
  const labels = { fail: "FAIL", warn: "WARNING", pass: "PASS" };
  return (
    <div className={`rounded-xl border p-4 ${colors[status]}`}>
      <p className="text-gray-300 text-xs mb-2">{title}</p>
      <p className={`text-2xl mb-1 ${valColors[status]}`}>{value}</p>
      <p className="text-gray-500 text-xs">Threshold: {threshold}</p>
      <div className={`flex items-center gap-1.5 mt-2 text-xs ${valColors[status]}`}>
        {statusIcon[status]}
        <span>{labels[status]}</span>
      </div>
    </div>
  );
}

export function FairnessMetrics() {
  const [activeTab, setActiveTab] = useState<MetricTab>("dp");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-white">Fairness Metrics</h1>
        <p className="text-gray-400 text-sm mt-1">
          Quantitative measurement of bias across protected groups using standard fairness definitions
        </p>
      </div>

      {/* Model Selector */}
      <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div>
          <p className="text-xs text-gray-400">Analyzing Model</p>
          <p className="text-white text-sm mt-0.5">Loan Approval Classifier v3.2 — LightGBM</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-xs text-gray-400">Dataset</p>
          <p className="text-white text-sm mt-0.5">Adult Income Dataset (48,842 rows)</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-xs text-gray-400">Protected Attributes</p>
          <p className="text-white text-sm mt-0.5">sex, race</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
          <XCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-red-400">4/4 Metrics Failed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
              activeTab === t.id
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            }`}
          >
            {activeTab !== t.id && statusIcon[t.status]}
            {t.label}
          </button>
        ))}
      </div>

      {/* ────────── Demographic Parity ────────── */}
      {activeTab === "dp" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h2 className="text-white">Demographic Parity (Statistical Parity)</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Requires that the probability of a positive outcome is equal across all demographic groups.
                  Measures whether the model's selection rate differs between groups.
                </p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Demographic Parity Definition"}</p>
              <p className="text-gray-300">P(Ŷ = 1 | A = 0) = P(Ŷ = 1 | A = 1)</p>
              <p className="text-gray-500 mt-2">{"// Difference (DPD):"}</p>
              <p className="text-amber-300">DPD = P(Ŷ=1|A=male) - P(Ŷ=1|A=female)</p>
              <p className="text-red-300">DPD = 0.304 - 0.113 = <strong>0.191</strong> {"(threshold: |DPD| ≤ 0.05)"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="DPD (Gender)" value="0.191" threshold="|DPD| ≤ 0.05" status="fail" description="" />
            <MetricCard title="DPD (Race)" value="0.131" threshold="|DPD| ≤ 0.05" status="fail" description="" />
            <MetricCard title="Male Rate" value="30.4%" threshold="—" status="fail" description="" />
            <MetricCard title="Female Rate" value="11.3%" threshold="—" status="fail" description="" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">Positive Outcome Rate by Protected Group</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={demographicParityData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" domain={[0, 40]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#d1d5db" }}
                  formatter={(v: number) => [`${v}%`, "Positive Rate"]}
                />
                <ReferenceLine y={20} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Fair baseline (20%)", fill: "#6b7280", fontSize: 11 }} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} name="Positive Rate (%)">
                  {demographicParityData.map((entry, i) => (
                    <Cell key={i} fill={entry.rate < 20 ? "#ef4444" : "#8b5cf6"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ────────── Equal Opportunity ────────── */}
      {activeTab === "eo" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-2">Equal Opportunity</h2>
            <p className="text-gray-400 text-sm mb-4">
              Requires equal True Positive Rate (TPR) — also called recall or sensitivity — across groups.
              A classifier satisfies Equal Opportunity if it correctly identifies positives equally well for all groups.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Equal Opportunity: Equal TPR across groups"}</p>
              <p className="text-gray-300">TPR = P(Ŷ=1 | Y=1, A=a) must be equal ∀ a</p>
              <p className="text-gray-500 mt-2">{"// EOD (Equal Opportunity Difference):"}</p>
              <p className="text-amber-300">EOD = TPR(Male) - TPR(Female)</p>
              <p className="text-red-300">EOD = 0.81 - 0.63 = <strong>0.18</strong> {"(threshold: |EOD| ≤ 0.05)"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="EOD (Gender)" value="0.18" threshold="|EOD| ≤ 0.05" status="fail" description="" />
            <MetricCard title="EOD (Race)" value="0.21" threshold="|EOD| ≤ 0.05" status="fail" description="" />
            <MetricCard title="Male TPR" value="81%" threshold="—" status="fail" description="" />
            <MetricCard title="Female TPR" value="63%" threshold="—" status="fail" description="" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">True Positive Rate (Recall) by Group</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={equalOpportunityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "TPR"]} />
                <ReferenceLine y={0.72} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Mean TPR (72%)", fill: "#6b7280", fontSize: 11 }} />
                <Bar dataKey="tpr" radius={[4, 4, 0, 0]} name="TPR">
                  {equalOpportunityData.map((entry, i) => (
                    <Cell key={i} fill={entry.tpr < 0.70 ? "#ef4444" : "#3b82f6"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ────────── Equalized Odds ────────── */}
      {activeTab === "eodds" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-2">Equalized Odds</h2>
            <p className="text-gray-400 text-sm mb-4">
              Requires equal TPR <em>and</em> equal FPR (False Positive Rate) across groups. 
              Stricter than Equal Opportunity — the classifier must behave identically for both positive and negative true labels across all groups.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Equalized Odds: Equal TPR AND Equal FPR"}</p>
              <p className="text-gray-300">P(Ŷ=1 | Y=y, A=a) = P(Ŷ=1 | Y=y, A=b) for y ∈ {"{"} 0, 1 {"}"}</p>
              <p className="text-gray-500 mt-2">{"// Both conditions must hold:"}</p>
              <p className="text-amber-300">ΔTPR = 0.81 - 0.63 = 0.18 (Gender)</p>
              <p className="text-red-300">ΔFPR = 0.12 - 0.08 = 0.04 (Gender) ← borderline</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">TPR vs FPR by Demographic Group</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={equalizedOddsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <ReferenceLine y={0.05} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "FPR threshold", fill: "#f59e0b", fontSize: 10 }} />
                <Bar dataKey="tpr" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="TPR (True Positive Rate)" fillOpacity={0.85} />
                <Bar dataKey="fpr" fill="#ef4444" radius={[4, 4, 0, 0]} name="FPR (False Positive Rate)" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-500" /> TPR</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> FPR</div>
            </div>
          </div>
        </div>
      )}

      {/* ────────── Disparate Impact ────────── */}
      {activeTab === "di" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-2">Disparate Impact (4/5ths Rule)</h2>
            <p className="text-gray-400 text-sm mb-4">
              Measures the ratio of positive outcome rates between unprivileged and privileged groups.
              The 80% rule (4/5ths rule) from US EEOC guidelines requires DI ≥ 0.80 to avoid legal liability.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Disparate Impact Ratio"}</p>
              <p className="text-gray-300">DI = P(Ŷ=1 | A=unprivileged) / P(Ŷ=1 | A=privileged)</p>
              <p className="text-gray-500 mt-2">{"// Example — Gender:"}</p>
              <p className="text-amber-300">DI = P(income&gt;50K | Female) / P(income&gt;50K | Male)</p>
              <p className="text-red-300">DI = 11.3% / 30.4% = <strong>0.37</strong> {"(required: DI ≥ 0.80)"}</p>
              <p className="text-gray-500 mt-2">{"// 4/5ths rule: ratio must be ≥ 0.8 to avoid discrimination"}</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">Disparate Impact Ratios by Group Pair</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={disparateImpactData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" domain={[0, 1.2]} stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis type="category" dataKey="pair" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [v.toFixed(2), "DI Ratio"]} />
                <ReferenceLine x={0.80} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "0.80 threshold", fill: "#f59e0b", fontSize: 11, position: "top" }} />
                <Bar dataKey="ratio" radius={[0, 4, 4, 0]} name="DI Ratio">
                  {disparateImpactData.map((entry, i) => (
                    <Cell key={i} fill={entry.ratio < 0.80 ? "#ef4444" : "#10b981"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {disparateImpactData.map((d) => (
                <div key={d.pair} className={`rounded-lg p-3 border ${d.ratio < 0.80 ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                  <p className="text-xs text-gray-400">{d.pair}</p>
                  <p className={`text-lg mt-1 ${d.ratio < 0.80 ? "text-red-400" : "text-emerald-400"}`}>{d.ratio.toFixed(2)}</p>
                  <p className={`text-xs mt-0.5 ${d.ratio < 0.80 ? "text-red-400" : "text-emerald-400"}`}>{d.ratio < 0.80 ? "FAIL" : "PASS"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
