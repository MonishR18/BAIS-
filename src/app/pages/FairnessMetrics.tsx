import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { analyzeDataset } from "../../lib/api";

type MetricTab = "dp" | "eo" | "eodds" | "di";

const statusIcon = {
  fail: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  pass: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
};

interface MetricCardProps {
  title: string;
  value: string | number;
  threshold: string;
  status: "fail" | "warn" | "pass";
  description: string;
}

function MetricCard({ title, value, threshold, status }: MetricCardProps) {
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
  const { datasetId, fileName, targetColumn, sensitiveAttribute, predictionColumn } = useAppContext();
  const [activeTab, setActiveTab] = useState<MetricTab>("dp");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!datasetId) return;
    setLoading(true);
    analyzeDataset({
      dataset_id: datasetId,
      target_column: targetColumn,
      sensitive_attribute: sensitiveAttribute,
      prediction_column: predictionColumn,
    })
      .then(setAnalysis)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [datasetId, targetColumn, sensitiveAttribute, predictionColumn]);

  if (!datasetId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl text-white mb-4">Fairness Metrics</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Please upload a dataset in the Dataset Analysis tab first.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-white">Loading analysis...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">Error: {error}</div>;
  }

  if (!analysis) {
    return null;
  }

  // Derived metrics for UI
  const dpDifference = analysis.demographic_parity.difference;
  const dpStatus = dpDifference <= 0.05 ? "pass" : dpDifference <= 0.1 ? "warn" : "fail";
  const demographicParityData = Object.entries(analysis.demographic_parity.by_group).map(([group, rate]) => ({
    group,
    rate: (rate as number) * 100,
  }));

  const eoDifference = analysis.equal_opportunity.difference;
  const eoStatus = eoDifference <= 0.05 ? "pass" : eoDifference <= 0.1 ? "warn" : "fail";
  const equalOpportunityData = Object.entries(analysis.equal_opportunity.by_group).map(([group, tpr]) => ({
    group,
    tpr: tpr as number,
  }));

  const diMinRatio = analysis.disparate_impact.min_ratio;
  const diStatus = diMinRatio >= 0.8 ? "pass" : "fail";
  const disparateImpactData = Object.entries(analysis.disparate_impact.ratios).filter(([g, _]) => g !== analysis.disparate_impact.reference_group).map(([group, ratio]) => ({
    pair: `${group}/${analysis.disparate_impact.reference_group}`,
    ratio: ratio as number,
    threshold: 0.80,
  }));

  const tabs: { id: MetricTab; label: string; status: "fail" | "warn" | "pass" }[] = [
    { id: "dp", label: "Demographic Parity", status: dpStatus },
    { id: "eo", label: "Equal Opportunity", status: eoStatus },
    { id: "di", label: "Disparate Impact", status: diStatus },
  ];

  const failedCount = tabs.filter((t) => t.status === "fail").length;

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
          <p className="text-white text-sm mt-0.5">Custom Model</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-xs text-gray-400">Dataset</p>
          <p className="text-white text-sm mt-0.5">{fileName}</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-xs text-gray-400">Protected Attribute</p>
          <p className="text-white text-sm mt-0.5">{sensitiveAttribute}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 ${failedCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} border px-3 py-1.5 rounded-full`}>
          {failedCount > 0 ? <XCircle className="w-3.5 h-3.5 text-red-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className={`text-xs ${failedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{failedCount}/{tabs.length} Metrics Failed</span>
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
            <h2 className="text-white">Demographic Parity (Statistical Parity)</h2>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Requires that the probability of a positive outcome is equal across all demographic groups.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Difference (DPD):"}</p>
              <p className="text-amber-300">DPD = {dpDifference.toFixed(3)}</p>
              <p className="text-gray-500 mt-2">{"(threshold: |DPD| <= 0.05 is passing, <= 0.1 is warning)"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title={`DPD (${sensitiveAttribute})`} value={dpDifference.toFixed(3)} threshold="|DPD| <= 0.05" status={dpStatus} description="" />
            {demographicParityData.map(d => (
              <MetricCard key={d.group} title={`${d.group} Rate`} value={`${d.rate.toFixed(1)}%`} threshold="-" status="pass" description="" />
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">Positive Outcome Rate by Protected Group</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={demographicParityData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#d1d5db" }}
                  formatter={(v: number) => [`${v.toFixed(1)}%`, "Positive Rate"]}
                />
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
              Requires equal True Positive Rate (TPR) across groups.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// EOD (Equal Opportunity Difference):"}</p>
              <p className="text-amber-300">EOD = {eoDifference.toFixed(3)}</p>
              <p className="text-gray-500 mt-2">{"(threshold: |EOD| <= 0.05 is passing)"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title={`EOD (${sensitiveAttribute})`} value={eoDifference.toFixed(3)} threshold="|EOD| <= 0.05" status={eoStatus} description="" />
            {equalOpportunityData.map(d => (
              <MetricCard key={d.group} title={`${d.group} TPR`} value={`${(d.tpr * 100).toFixed(0)}%`} threshold="-" status="pass" description="" />
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">True Positive Rate (Recall) by Group</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={equalOpportunityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "TPR"]} />
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

      {/* ────────── Disparate Impact ────────── */}
      {activeTab === "di" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-2">Disparate Impact (4/5ths Rule)</h2>
            <p className="text-gray-400 text-sm mb-4">
              Measures the ratio of positive outcome rates between unprivileged and privileged groups.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm border border-gray-700/50">
              <p className="text-violet-300">{"// Disparate Impact Ratio"}</p>
              <p className="text-gray-300">Minimum DI Ratio: {diMinRatio.toFixed(3)}</p>
              <p className="text-gray-500 mt-2">{"(required: DI >= 0.80)"}</p>
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
