import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Upload, Database, AlertTriangle, CheckCircle2, Eye, Filter, Download, Info, ChevronDown,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { analyzeDataset, uploadDataset, type AnalyzeResponse } from "../../api/client";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const sampleDataset = {
  name: "Adult Income Dataset (UCI)",
  rows: 48842,
  columns: 15,
  target: "income (>50K)",
  protectedAttrs: ["sex", "race", "age"],
  source: "UCI Machine Learning Repository",
};

const columnStats = [
  { name: "age", type: "Numerical", missing: "0%", unique: 73, bias: "medium" },
  { name: "education", type: "Categorical", missing: "0%", unique: 16, bias: "low" },
  { name: "sex", type: "Protected", missing: "0%", unique: 2, bias: "high" },
  { name: "race", type: "Protected", missing: "0%", unique: 5, bias: "high" },
  { name: "hours-per-week", type: "Numerical", missing: "0%", unique: 94, bias: "low" },
  { name: "occupation", type: "Categorical", missing: "1.8%", unique: 15, bias: "medium" },
  { name: "marital-status", type: "Categorical", missing: "0%", unique: 7, bias: "medium" },
  { name: "income", type: "Target", missing: "0%", unique: 2, bias: "n/a" },
];

const genderDist = [
  { group: "Male", count: 32650, pct: 66.8 },
  { group: "Female", count: 16192, pct: 33.2 },
];

const raceDistData = [
  { name: "White", value: 41762, pct: 85.5 },
  { name: "Black", value: 4685, pct: 9.6 },
  { name: "Asian/PI", value: 1519, pct: 3.1 },
  { name: "Other", value: 876, pct: 1.8 },
];

const outcomeByGender = [
  { group: "Male", positive: 30.4, negative: 69.6 },
  { group: "Female", positive: 11.3, negative: 88.7 },
];

const outcomeByRace = [
  { group: "White", positive: 26.0 },
  { group: "Black", positive: 12.9 },
  { group: "Asian/PI", positive: 27.2 },
  { group: "Other", positive: 14.5 },
];

const biasMap: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "High Bias Risk" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Medium Risk" },
  low: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Low Risk" },
  "n/a": { color: "text-gray-400", bg: "bg-gray-700/30 border-gray-600/30", label: "Target" },
};

const typeColors: Record<string, string> = {
  Protected: "text-red-300 bg-red-500/10",
  Numerical: "text-blue-300 bg-blue-500/10",
  Categorical: "text-violet-300 bg-violet-500/10",
  Target: "text-amber-300 bg-amber-500/10",
};

export function DatasetAnalysis() {
  const { datasetId, setDatasetId, fileName, setFileName } = useAppContext();
  const [activeTab, setActiveTab] = useState<"overview" | "distribution" | "bias">("overview");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState<"idle" | "upload" | "analyze">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!selectedFile) return;
    setError(null);
    setLoading("upload");
    setAnalysis(null);
    try {
      const res = await uploadDataset(selectedFile);
      setDatasetId(res.dataset_id);
      setFileName(res.filename || selectedFile.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading("idle");
    }
  }

  async function handleAnalyze() {
    if (!datasetId) return;
    setError(null);
    setLoading("analyze");
    try {
      const res = await analyzeDataset({
        dataset_id: datasetId,
        target_column: "label",
        sensitive_attribute: "gender",
        prediction_column: "prediction",
      });
      setAnalysis(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setLoading("idle");
    }
  }

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadDataset(file);
      setDatasetId(res.dataset_id);
      setFileName(res.filename || file.name);
    } catch (err) {
      console.error(err);
      alert("Failed to upload dataset.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-white">Dataset Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Upload, inspect, and detect bias in training datasets before model training</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white">Backend Analysis (Upload → Analyze)</p>
            <p className="text-gray-400 text-sm mt-1">Uploads CSV to FastAPI and runs fairness metrics.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setSelectedFile(f);
                setDatasetId(null);
                setAnalysis(null);
                setError(null);
              }}
              className="text-sm text-gray-300"
            />

            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading !== "idle"}
              className="text-sm text-white bg-blue-600 disabled:opacity-50 px-3 py-1.5 rounded-lg"
            >
              {loading === "upload" ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={handleAnalyze}
              disabled={!datasetId || loading !== "idle"}
              className="text-sm text-white bg-violet-600 disabled:opacity-50 px-3 py-1.5 rounded-lg"
            >
              {loading === "analyze" ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {datasetId && (
          <p className="text-xs text-gray-400 mt-3">
            dataset_id: <span className="text-gray-200 font-mono">{datasetId}</span>
          </p>
        )}

        {error && (
          <p className="text-xs text-red-300 mt-3 break-words">{error}</p>
        )}

        {analysis && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Bias Detected</p>
              <p className={analysis.bias_detected ? "text-red-400 text-lg" : "text-emerald-400 text-lg"}>
                {analysis.bias_detected ? "Yes" : "No"}
              </p>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Demographic Parity (diff)</p>
              <p className="text-white text-lg">{analysis.demographic_parity.difference.toFixed(3)}</p>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Equal Opportunity (diff)</p>
              <p className="text-white text-lg">{analysis.equal_opportunity.difference.toFixed(3)}</p>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Disparate Impact (min ratio)</p>
              <p className="text-white text-lg">{analysis.disparate_impact.min_ratio.toFixed(3)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      {!datasetId ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? "border-violet-500 bg-violet-500/5" : "border-gray-700 hover:border-gray-600"}`}
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-white mb-1">{isUploading ? "Uploading..." : "Drag & drop your dataset here"}</p>
          <p className="text-gray-400 text-sm mb-4">Supports CSV (max 500MB)</p>
          <label className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer inline-block">
            {isUploading ? "Please wait..." : "Browse Files"}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
      ) : (
        <>
          {/* Dataset Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white">{fileName || sampleDataset.name}</h2>
                  <p className="text-gray-400 text-sm">Source: Uploaded File</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDatasetId(null)}
                  className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Change
                </button>
                <button className="flex items-center gap-2 text-sm text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Export Analysis
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-800">
              {[
                { label: "Total Rows", value: sampleDataset.rows.toLocaleString() },
                { label: "Features", value: sampleDataset.columns },
                { label: "Target Variable", value: sampleDataset.target },
                { label: "Protected Attrs", value: sampleDataset.protectedAttrs.join(", ") },
                { label: "Missing Values", value: "1.8%" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bias Alert */}
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium">Significant Bias Detected</p>
              <p className="text-gray-300 text-xs mt-1">
                Protected attributes <span className="text-red-300">"sex"</span> and <span className="text-red-300">"race"</span> show
                statistically significant disparities in outcome distribution. Females receive 62.5% fewer positive outcomes than males.
                Recommend applying pre-processing bias mitigation before model training.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            {(["overview", "distribution", "bias"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  activeTab === tab ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "bias" ? "Bias Analysis" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h2 className="text-white">Column Statistics</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filter</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {["Column", "Type", "Missing", "Unique Values", "Bias Risk"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {columnStats.map((col, i) => {
                      const b = biasMap[col.bias];
                      const t = typeColors[col.type] || "text-gray-300 bg-gray-700/30";
                      return (
                        <tr key={col.name} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${i % 2 === 0 ? "" : "bg-gray-800/10"}`}>
                          <td className="px-5 py-3 text-white font-mono">{col.name}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${t}`}>{col.type}</span>
                          </td>
                          <td className="px-5 py-3 text-gray-300">{col.missing}</td>
                          <td className="px-5 py-3 text-gray-300">{col.unique}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs border ${b.bg} ${b.color}`}>{b.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Distribution */}
          {activeTab === "distribution" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gender Distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white mb-1">Gender Distribution</h2>
                <p className="text-gray-400 text-xs mb-4">Protected attribute: sex</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={genderDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {genderDist.map((g) => (
                    <div key={g.group} className="bg-gray-800/50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">{g.group}</p>
                      <p className="text-sm text-white">{g.count.toLocaleString()} <span className="text-gray-400 text-xs">({g.pct}%)</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Race Distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white mb-1">Race Distribution</h2>
                <p className="text-gray-400 text-xs mb-4">Protected attribute: race</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={raceDistData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, pct }) => `${name} (${pct}%)`} labelLine={false}>
                      {raceDistData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab: Bias Analysis */}
          {activeTab === "bias" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white mb-1">Positive Outcome Rate by Gender</h2>
                <p className="text-gray-400 text-xs mb-4">Income &gt;50K by sex — Demographic Parity violation detected</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={outcomeByGender}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                    <Bar dataKey="positive" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Positive Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">Gap of <strong>19.1%</strong> — Disparate Impact ratio: <strong>0.37</strong> (threshold: 0.80)</p>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white mb-1">Positive Outcome Rate by Race</h2>
                <p className="text-gray-400 text-xs mb-4">Income &gt;50K by race — Disparate Impact analysis</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={outcomeByRace}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                    <Bar dataKey="positive" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Positive Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">Black/White gap: <strong>13.1%</strong> — Disparate Impact ratio: <strong>0.50</strong></p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
