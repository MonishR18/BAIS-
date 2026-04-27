import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { CheckCircle2, AlertTriangle, ArrowRight, Settings2, Zap, BarChart2, ChevronDown, ChevronUp } from "lucide-react";

type Phase = "pre" | "in" | "post";
type Algorithm = string | null;

const beforeAfterData = [
  { metric: "DPD", before: 0.191, after: 0.032, threshold: 0.05 },
  { metric: "EOD", before: 0.180, after: 0.028, threshold: 0.05 },
  { metric: "ΔTPR", before: 0.180, after: 0.031, threshold: 0.05 },
  { metric: "ΔFPR", before: 0.040, after: 0.012, threshold: 0.05 },
  { metric: "DI", before: 0.37, after: 0.84, threshold: 0.80 },
];

const accuracyTradeoff = [
  { algo: "Baseline", accuracy: 87.2, fairness: 42.0 },
  { algo: "Reweighing", accuracy: 84.5, fairness: 76.0 },
  { algo: "LFR", accuracy: 83.1, fairness: 81.0 },
  { algo: "Adversarial", accuracy: 82.8, fairness: 84.0 },
  { algo: "Reject Option", accuracy: 83.7, fairness: 79.0 },
  { algo: "Calibrated EO", accuracy: 85.2, fairness: 77.0 },
];

interface AlgoCardProps {
  title: string;
  badge: string;
  desc: string;
  howItWorks: string;
  formula?: string;
  pros: string[];
  cons: string[];
  selected: boolean;
  onSelect: () => void;
}

function AlgoCard({ title, badge, desc, howItWorks, formula, pros, cons, selected, onSelect }: AlgoCardProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 transition-all cursor-pointer ${selected ? "border-violet-500 ring-1 ring-violet-500/30" : "border-gray-800 hover:border-gray-600"}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-sm">{title}</h3>
            <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">{badge}</span>
          </div>
          <p className="text-gray-400 text-xs">{desc}</p>
        </div>
        {selected && <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 ml-2" />}
      </div>

      <button
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mt-3"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Less" : "Details"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div>
            <p className="text-xs text-gray-400 mb-1">How it works:</p>
            <p className="text-xs text-gray-300">{howItWorks}</p>
          </div>
          {formula && (
            <div className="bg-gray-800/60 rounded-lg p-3 font-mono text-xs text-amber-300 border border-gray-700/50">
              {formula}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-emerald-400 mb-1">Pros</p>
              {pros.map((p) => <p key={p} className="text-xs text-gray-300 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">+</span>{p}</p>)}
            </div>
            <div>
              <p className="text-xs text-red-400 mb-1">Cons</p>
              {cons.map((c) => <p key={c} className="text-xs text-gray-300 flex items-start gap-1"><span className="text-red-500 mt-0.5">−</span>{c}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const preMethods = [
  {
    id: "reweighing",
    title: "Reweighing",
    badge: "AIF360",
    desc: "Assigns different weights to training samples to reduce bias without modifying data",
    howItWorks: "Computes weights for each (group, outcome) combination so that weighted frequency equals expected frequency under independence. Samples from underrepresented groups get higher weights.",
    formula: "w(x,y) = P(Y=y) × P(A=a) / P(Y=y, A=a)",
    pros: ["No data modification", "Simple to implement", "Preserves original features"],
    cons: ["May not fully remove bias", "Sensitive to weight estimation", "Limited for complex bias"],
  },
  {
    id: "lfr",
    title: "Learning Fair Representations (LFR)",
    badge: "Pre-processing",
    desc: "Encodes data into a new representation that removes protected attribute information",
    howItWorks: "Learns a mapping Z = f(X) that encodes X into latent space Z while satisfying statistical independence from protected attributes A, and preserving class label Y information.",
    formula: "min L(Y|Z) + λ · L(Z⊥A)",
    pros: ["Works across models", "Strong fairness guarantees", "Removes proxy features"],
    cons: ["Information loss", "Computationally expensive", "Hard to interpret Z"],
  },
  {
    id: "disparate",
    title: "Disparate Impact Remover",
    badge: "AIF360",
    desc: "Modifies feature values to reduce disparate impact while preserving rank ordering",
    howItWorks: "Applies a repair function to non-protected features that adjusts their distributions across groups toward a combined reference distribution, controlled by a repair level λ ∈ [0, 1].",
    formula: "x_repaired = λ · F⁻¹(F_combined(x)) + (1−λ) · x",
    pros: ["Tunable repair level", "Preserves rank within groups", "Works on continuous features"],
    cons: ["May distort feature distributions", "Full repair = information loss", "Doesn't handle all bias types"],
  },
];

const inMethods = [
  {
    id: "adversarial",
    title: "Adversarial Debiasing",
    badge: "AIF360 / TF",
    desc: "Uses an adversarial network to jointly optimize prediction accuracy and fairness",
    howItWorks: "A predictor network learns to predict Y from X, while an adversary network tries to predict A from the predictor's output. The predictor is trained to fool the adversary — removing group signal.",
    formula: "min_θP max_θA [L(Y|Ŷ) − λ · L(A|Ŷ)]",
    pros: ["End-to-end fair training", "Flexible fairness constraints", "State-of-the-art results"],
    cons: ["Training instability (GAN-like)", "Hard to tune λ", "Computationally expensive"],
  },
  {
    id: "prejudice",
    title: "Prejudice Remover",
    badge: "In-processing",
    desc: "Adds a fairness regularization term to the learning objective",
    howItWorks: "Modifies the loss function to include a mutual information regularizer between predictions and protected attribute. The model simultaneously minimizes prediction error and dependence on A.",
    formula: "L_total = L_CE(Y, Ŷ) + η · MI(Ŷ, A)",
    pros: ["Direct control via η", "Compatible with many models", "Transparent objective"],
    cons: ["Requires access to training", "Approximate MI estimation", "Fairness-accuracy tradeoff"],
  },
  {
    id: "constraint",
    title: "Fairlearn Constrained Learning",
    badge: "Fairlearn",
    desc: "Optimization with explicit fairness constraints using Lagrangian relaxation",
    howItWorks: "Formulates fairness as constraints (e.g., EOD ≤ ε) and uses exponentiated gradient descent to find a classifier on the Pareto frontier of accuracy and fairness.",
    formula: "min L(θ) s.t. |EOD(θ)| ≤ ε, |DPD(θ)| ≤ ε",
    pros: ["Hard fairness constraints", "Pareto-optimal solutions", "Principled framework"],
    cons: ["May not converge", "Requires constraint tuning", "Limited to convex losses"],
  },
];

const postMethods = [
  {
    id: "reject",
    title: "Reject Option Classification",
    badge: "AIF360",
    desc: "Flips predictions near the decision boundary to favor unprivileged groups",
    howItWorks: "For predictions with confidence near 0.5 (the 'critical region'), the algorithm assigns positive outcomes to unprivileged groups and negative outcomes to privileged groups, reducing disparity.",
    formula: "ŷ = 1 if A=unprivileged ∧ P(Y=1|x) ∈ [θ_l, 0.5]",
    pros: ["Model-agnostic", "No retraining needed", "Tunable fairness level"],
    cons: ["Treats individuals differently", "May seem arbitrary", "Requires threshold tuning"],
  },
  {
    id: "calibrated",
    title: "Calibrated Equalized Odds",
    badge: "Post-processing",
    desc: "Adjusts group-specific decision thresholds to equalize TPR and FPR",
    howItWorks: "Finds the optimal probability of positive prediction for each group (mixing between two thresholds) that minimizes prediction error subject to equalized odds constraints.",
    formula: "ŷ_a = Bernoulli(p·1{s≥t_a} + q·1{s<t_a})",
    pros: ["Provably optimal solution", "Satisfies equalized odds", "Interpretable thresholds"],
    cons: ["Requires held-out calibration set", "Group-specific treatment", "Binary groups only"],
  },
  {
    id: "threshold",
    title: "Group-Specific Thresholds",
    badge: "Custom",
    desc: "Applies different decision thresholds per group to achieve fairness target",
    howItWorks: "Sweeps threshold values for each protected group independently on a validation set, selecting the combination that minimizes fairness violation (e.g., DPD) subject to accuracy constraints.",
    formula: "θ*_a = argmin |P(Ŷ=1|A=a, s≥θ_a) − P(Ŷ=1)|",
    pros: ["Simple to implement", "No retraining", "Works with any model"],
    cons: ["Legal concerns (disparate treatment)", "Suboptimal accuracy", "Ignores joint distributions"],
  },
];

export function BiasMitigation() {
  const [activePhase, setActivePhase] = useState<Phase>("pre");
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>("reweighing");
  const [applied, setApplied] = useState(false);

  const currentMethods = activePhase === "pre" ? preMethods : activePhase === "in" ? inMethods : postMethods;

  const phases: { id: Phase; label: string; icon: typeof Settings2; desc: string }[] = [
    { id: "pre", label: "Pre-processing", icon: Settings2, desc: "Modify training data before model training" },
    { id: "in", label: "In-processing", icon: Zap, desc: "Incorporate fairness into model training" },
    { id: "post", label: "Post-processing", icon: BarChart2, desc: "Adjust predictions after model training" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl text-white">Bias Mitigation</h1>
        <p className="text-gray-400 text-sm mt-1">
          Apply algorithmic fairness interventions across the ML pipeline — before, during, or after training
        </p>
      </div>

      {/* Phase Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => { setActivePhase(phase.id); setSelectedAlgo(null); setApplied(false); }}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              activePhase === phase.id
                ? "bg-violet-600/15 border-violet-500 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activePhase === phase.id ? "bg-violet-500/20" : "bg-gray-800"}`}>
              <phase.icon className={`w-5 h-5 ${activePhase === phase.id ? "text-violet-400" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm">{phase.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{phase.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Algorithms */}
      <div>
        <h2 className="text-white mb-3">Available Algorithms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentMethods.map((method) => (
            <AlgoCard
              key={method.id}
              {...method}
              selected={selectedAlgo === method.id}
              onSelect={() => { setSelectedAlgo(method.id); setApplied(false); }}
            />
          ))}
        </div>
      </div>

      {/* Config & Apply */}
      {selectedAlgo && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Protected Attribute</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none">
                <option>sex</option>
                <option>race</option>
                <option>sex + race</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Fairness Constraint</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none">
                <option>Demographic Parity</option>
                <option>Equal Opportunity</option>
                <option>Equalized Odds</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Fairness-Accuracy Tradeoff (λ)</label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.7" className="w-full accent-violet-500" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Accuracy</span>
                <span>λ = 0.70</span>
                <span>Fairness</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setApplied(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            Apply Mitigation
          </button>
        </div>
      )}

      {/* Results */}
      {applied && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-300 text-sm font-medium">Mitigation Applied Successfully</p>
              <p className="text-gray-400 text-xs mt-0.5">All fairness metrics now within acceptable thresholds. Accuracy dropped from 87.2% → 84.5%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white mb-4">Before vs After Mitigation</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={beforeAfterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="metric" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                  <Bar dataKey="before" fill="#ef4444" name="Before" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  <Bar dataKey="after" fill="#10b981" name="After" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> Before</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> After</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white mb-4">Accuracy–Fairness Tradeoff</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={accuracyTradeoff}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="algo" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[70, 95]} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  <Bar dataKey="fairness" fill="#8b5cf6" name="Fairness Score" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /> Accuracy</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-500" /> Fairness</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
