import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ReferenceLine,
} from "recharts";
import { Brain, Info, Eye, TrendingUp, AlertTriangle } from "lucide-react";

const shapGlobalData = [
  { feature: "capital-gain", shap: 0.342, direction: "positive" },
  { feature: "age", shap: 0.287, direction: "positive" },
  { feature: "education-num", shap: 0.241, direction: "positive" },
  { feature: "hours-per-week", shap: 0.198, direction: "positive" },
  { feature: "occupation", shap: 0.176, direction: "positive" },
  { feature: "sex", shap: 0.154, direction: "negative" },
  { feature: "marital-status", shap: 0.143, direction: "positive" },
  { feature: "race", shap: 0.089, direction: "negative" },
  { feature: "native-country", shap: 0.063, direction: "negative" },
  { feature: "relationship", shap: 0.047, direction: "positive" },
];

const shapLocalMale = [
  { feature: "age=38", value: 0.18 },
  { feature: "edu=Bachelors", value: 0.14 },
  { feature: "capital-gain=5000", value: 0.31 },
  { feature: "hours=50", value: 0.12 },
  { feature: "sex=Male", value: 0.09 },
  { feature: "race=White", value: 0.06 },
  { feature: "occupation=Prof", value: 0.11 },
];

const shapLocalFemale = [
  { feature: "age=38", value: 0.17 },
  { feature: "edu=Bachelors", value: 0.13 },
  { feature: "capital-gain=5000", value: 0.30 },
  { feature: "hours=50", value: 0.11 },
  { feature: "sex=Female", value: -0.14 },
  { feature: "race=White", value: 0.05 },
  { feature: "occupation=Prof", value: 0.10 },
];

const limeData = [
  { feature: "capital-gain > 3000", weight: 0.38, label: "Supports (+50K)" },
  { feature: "education = Bachelors", weight: 0.22, label: "Supports (+50K)" },
  { feature: "age between 35-50", weight: 0.17, label: "Supports (+50K)" },
  { feature: "sex = Female", weight: -0.19, label: "Against (+50K)" },
  { feature: "hours-per-week < 45", weight: -0.12, label: "Against (+50K)" },
  { feature: "occupation = Service", weight: -0.09, label: "Against (+50K)" },
];

const counterfactualData = [
  { change: "sex: Male → Female", impact: -0.19, type: "protected" },
  { change: "race: White → Black", impact: -0.12, type: "protected" },
  { change: "edu-num: 13 → 16", impact: +0.18, type: "neutral" },
  { change: "hours: 40 → 50", impact: +0.09, type: "neutral" },
  { change: "capital-gain: 0 → 5000", impact: +0.34, type: "neutral" },
];

const pdpAge = [
  { age: 20, male: 0.08, female: 0.04 },
  { age: 25, male: 0.13, female: 0.06 },
  { age: 30, male: 0.21, female: 0.09 },
  { age: 35, male: 0.28, female: 0.12 },
  { age: 40, male: 0.33, female: 0.14 },
  { age: 45, male: 0.36, female: 0.15 },
  { age: 50, male: 0.34, female: 0.14 },
  { age: 55, male: 0.30, female: 0.12 },
  { age: 60, male: 0.22, female: 0.09 },
  { age: 65, male: 0.15, female: 0.06 },
];

type AnalysisTab = "shap-global" | "shap-local" | "lime" | "pdp" | "counterfactual";

export function ModelAnalysis() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("shap-global");
  const [selectedExample, setSelectedExample] = useState<"male" | "female">("male");

  const tabs: { id: AnalysisTab; label: string }[] = [
    { id: "shap-global", label: "SHAP Global" },
    { id: "shap-local", label: "SHAP Local" },
    { id: "lime", label: "LIME" },
    { id: "pdp", label: "PDP" },
    { id: "counterfactual", label: "Counterfactuals" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl text-white">Model Explainability & Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">
          Interpretable AI tools — SHAP, LIME, and counterfactual analysis — to understand and audit model decisions
        </p>
      </div>

      {/* Model Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white">Loan Approval Classifier v3.2</h2>
            <p className="text-gray-400 text-sm">LightGBM · 87.2% accuracy · Trained on 36,631 samples</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400">Protected attribute influence detected</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === t.id ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── SHAP Global ─── */}
      {activeTab === "shap-global" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h2 className="text-white">Global SHAP Feature Importance</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Mean |SHAP value| across all predictions — measures each feature's average impact on model output.
                  SHAP (SHapley Additive exPlanations) decomposes each prediction into individual feature contributions.
                </p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 font-mono text-xs border border-gray-700/50 mb-4">
              <span className="text-violet-300">φᵢ(x) = </span>
              <span className="text-gray-300">Σ [|S|!(|F|-|S|-1)! / |F|!] · [f(S∪{"{"} i{"}"}) - f(S)]</span>
              <span className="text-gray-500">  where S ⊆ F \ {"{"} i{"}"}</span>
            </div>
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">
                <strong>"sex"</strong> ranks 6th with |SHAP| = 0.154 — a protected attribute should ideally have near-zero importance.
                <strong>"race"</strong> also contributes 0.089, indicating the model uses protected features in its decisions.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shapGlobalData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis type="category" dataKey="feature" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [v.toFixed(3), "Mean |SHAP|"]} />
                <Bar dataKey="shap" radius={[0, 4, 4, 0]} name="Mean |SHAP|">
                  {shapGlobalData.map((entry, i) => (
                    <Cell key={i} fill={entry.feature === "sex" || entry.feature === "race" ? "#ef4444" : "#8b5cf6"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-500" /> Regular features</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> Protected attributes</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SHAP Local ─── */}
      {activeTab === "shap-local" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">Compare SHAP explanations for identical profiles:</p>
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedExample(g)}
                  className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${selectedExample === g ? "bg-violet-600 text-white" : "text-gray-400"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-1">
              SHAP Waterfall — {selectedExample === "male" ? "Male" : "Female"} Applicant
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              Age=38, Bachelor's degree, Capital-gain=$5000, Hours=50/wk, Professional occupation
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={selectedExample === "male" ? shapLocalMale : shapLocalFemale}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[-0.2, 0.4]} />
                <YAxis type="category" dataKey="feature" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 11 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [v.toFixed(3), "SHAP value"]} />
                <ReferenceLine x={0} stroke="#6b7280" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="SHAP value">
                  {(selectedExample === "male" ? shapLocalMale : shapLocalFemale).map((entry, i) => (
                    <Cell key={i} fill={entry.value < 0 ? "#ef4444" : "#10b981"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Base Value (E[f(x)])</p>
                <p className="text-white text-sm">0.243</p>
              </div>
              <div className={`rounded-lg p-3 ${selectedExample === "male" ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                <p className="text-xs text-gray-400">Prediction Output</p>
                <p className={`text-sm ${selectedExample === "male" ? "text-emerald-400" : "text-red-400"}`}>
                  {selectedExample === "male" ? "0.81 → Approved" : "0.48 → Rejected"}
                </p>
              </div>
            </div>
            {selectedExample === "female" && (
              <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">
                  The only difference between profiles is <strong>sex</strong>. The SHAP value for sex=Female is <strong>−0.14</strong>, directly causing rejection of an otherwise equivalent applicant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── LIME ─── */}
      {activeTab === "lime" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-2">LIME — Local Interpretable Model-Agnostic Explanations</h2>
            <p className="text-gray-400 text-sm mb-4">
              LIME fits a locally faithful linear model around a specific prediction by perturbing the input
              and observing output changes. It explains <em>why</em> the model made a specific decision for one instance.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-3 font-mono text-xs border border-gray-700/50 mb-4">
              <span className="text-violet-300">ξ(x) = </span>
              <span className="text-gray-300">argmin_g L(f, g, π_x) + Ω(g)</span>
              <br />
              <span className="text-gray-500">where π_x = proximity measure, Ω = complexity of g</span>
            </div>
            <p className="text-gray-400 text-xs mb-4">Instance: Female, 35yo, Bachelor's, $5k capital-gain, 45 hrs/wk, Professional</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={limeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[-0.25, 0.45]} />
                <YAxis type="category" dataKey="feature" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 10 }} width={160} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [v.toFixed(2), "Weight"]} />
                <ReferenceLine x={0} stroke="#6b7280" />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]} name="LIME Weight">
                  {limeData.map((entry, i) => (
                    <Cell key={i} fill={entry.weight > 0 ? "#10b981" : "#ef4444"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> Supports positive outcome</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> Against positive outcome</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PDP ─── */}
      {activeTab === "pdp" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-2">Partial Dependence Plot (PDP) — Age Feature</h2>
          <p className="text-gray-400 text-sm mb-4">
            PDPs show the marginal effect of a feature on predicted outcome across different values.
            This plot reveals how the model treats age differently for Male vs Female applicants — exposing intersectional bias.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pdpAge}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="age" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} label={{ value: "Age", fill: "#9ca3af", position: "bottom", offset: -5 }} />
              <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 0.45]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} label={{ value: "P(income>50K)", fill: "#9ca3af", angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`]} />
              <Line type="monotone" dataKey="male" stroke="#3b82f6" strokeWidth={2} dot={false} name="Male" />
              <Line type="monotone" dataKey="female" stroke="#ec4899" strokeWidth={2} dot={false} name="Female" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-400 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-blue-500" /> Male</div>
            <div className="flex items-center gap-1.5"><div className="w-6 border-b-2 border-dashed border-pink-500" /> Female</div>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Consistent ~2× gap across all age groups suggests systematic gender bias, not a confounding factor.
              At peak age (45), male probability is 36% vs female 15% — a 21 percentage point disparity.
            </p>
          </div>
        </div>
      )}

      {/* ─── Counterfactuals ─── */}
      {activeTab === "counterfactual" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-2">Counterfactual Analysis</h2>
          <p className="text-gray-400 text-sm mb-4">
            Counterfactual explanations ask: "What minimal feature change would flip the model's decision?"
            For fairness auditing, we isolate the impact of changing <em>only</em> protected attributes.
          </p>
          <div className="space-y-3">
            {counterfactualData.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  item.type === "protected"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-gray-800/50 border-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.type === "protected" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <div>
                    <p className={`text-sm ${item.type === "protected" ? "text-red-300" : "text-white"}`}>{item.change}</p>
                    {item.type === "protected" && (
                      <p className="text-xs text-gray-400 mt-0.5">Protected attribute — should not influence outcome</p>
                    )}
                  </div>
                </div>
                <div className={`text-sm px-3 py-1 rounded-full ${item.impact > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                  {item.impact > 0 ? "+" : ""}{(item.impact * 100).toFixed(0)}% prediction change
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Key Finding:</p>
            <p className="text-gray-300 text-sm">
              Changing <strong>sex from Male → Female</strong> alone causes a <strong>−19% drop</strong> in prediction probability —
              comparable to losing $5,000 in capital gains. Changing <strong>race from White → Black</strong> causes a <strong>−12% drop</strong>.
              These changes violate the requirement that protected attributes should not influence outcomes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
