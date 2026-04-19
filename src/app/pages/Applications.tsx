import { useState } from "react";
import type { ReactNode } from "react";
import {
  Briefcase, Heart, GraduationCap, CreditCard, AlertTriangle, CheckCircle2,
  TrendingDown, Users, Scale, ChevronRight, Globe2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

type AppId = "hiring" | "banking" | "healthcare" | "education";

const applications: Record<AppId, {
  label: string;
  icon: React.ElementType;
  color: string;
  tagline: string;
  problem: string;
  dataset: string;
  model: string;
  protected: string[];
  metrics: { name: string; value: string; status: "fail" | "warn" | "pass" }[];
  biasExample: string;
  realCase: string;
  mitigation: string;
  outcome: string;
  chartData: { group: string; rate: number }[];
  radarData: { metric: string; score: number }[];
  legalRef: string;
  challenges: string[];
}> = {
  hiring: {
    label: "Hiring & Recruitment",
    icon: Briefcase,
    color: "violet",
    tagline: "Bias in automated resume screening and candidate ranking",
    problem: "AI hiring tools often replicate historical discrimination patterns embedded in training data. Models trained on historical hire decisions may systematically score women, minorities, and older candidates lower than equally qualified majority candidates.",
    dataset: "Historical hiring records (50,000+ applications) with demographic info",
    model: "Resume Screening LightGBM Classifier",
    protected: ["gender", "race/ethnicity", "age", "zip code (proxy)"],
    metrics: [
      { name: "Demographic Parity", value: "DPD = 0.22", status: "fail" },
      { name: "Equal Opportunity", value: "EOD = 0.19", status: "fail" },
      { name: "Disparate Impact", value: "DI = 0.41", status: "fail" },
      { name: "Model Accuracy", value: "83.4%", status: "pass" },
    ],
    biasExample: "Female candidates with identical qualifications to male counterparts received callbacks 22% less often. The model learned that 'gaps in employment' correlated with lower hiring rates, disproportionately penalizing women who took maternity leave.",
    realCase: "Amazon's AI recruiting tool (2014–2018) trained on 10 years of resumes — mostly from men — systematically downgraded resumes that included 'women's' (e.g., 'women's chess club captain'). Amazon scrapped it in 2018.",
    mitigation: "Applied Reweighing (pre-processing) + Fairlearn constrained learning. Removed proxy features (zip codes, graduation year). Added adversarial debiasing layer. Fairness score improved from 38 → 82.",
    outcome: "Callback rate gap reduced from 22% → 3.1%. Model retrained and approved with quarterly bias audits mandated.",
    chartData: [
      { group: "Male", rate: 34 },
      { group: "Female", rate: 12 },
      { group: "White", rate: 31 },
      { group: "Black", rate: 14 },
      { group: "Asian", rate: 29 },
      { group: "Hispanic", rate: 13 },
    ],
    radarData: [
      { metric: "Dem. Parity", score: 38 },
      { metric: "Equal Opp.", score: 45 },
      { metric: "Eq. Odds", score: 41 },
      { metric: "Disp. Impact", score: 35 },
      { metric: "Calibration", score: 62 },
      { metric: "Ind. Fairness", score: 44 },
    ],
    legalRef: "US EEOC Title VII, EU Equal Treatment Directive 2000/78/EC, 4/5ths Rule",
    challenges: ["Proxy discrimination via zip code", "Historical underrepresentation in training data", "Intersectional bias (race × gender)", "Legal constraints on using protected features in mitigation"],
  },
  banking: {
    label: "Banking & Credit",
    icon: CreditCard,
    color: "blue",
    tagline: "Discriminatory patterns in loan approval and credit scoring",
    problem: "Credit scoring algorithms may encode racial and socioeconomic biases through proxy features like neighborhood, zip code, education history, and employment type — creating redlining-like effects in the digital age.",
    dataset: "Loan application data (120,000 applications, 5 years, US national bank)",
    model: "Loan Approval XGBoost Classifier v3.2",
    protected: ["race", "gender", "age", "national origin"],
    metrics: [
      { name: "Demographic Parity", value: "DPD = 0.191", status: "fail" },
      { name: "Equal Opportunity", value: "EOD = 0.18", status: "fail" },
      { name: "Disparate Impact", value: "DI = 0.37 (F/M)", status: "fail" },
      { name: "Predictive Parity", value: "PPD = 0.04", status: "pass" },
    ],
    biasExample: "Black applicants in majority-Black zip codes were denied loans at 1.7× the rate of White applicants with identical credit scores, income, and debt-to-income ratios. The model used 'neighborhood median income' as a feature — a known redlining proxy.",
    realCase: "CFPB 2022 enforcement action against a major US bank's algorithmic lending tool that denied Black and Hispanic applicants at rates violating the Equal Credit Opportunity Act (ECOA), resulting in a $225M settlement.",
    mitigation: "Removed 'neighborhood median income' and zip code features. Applied Calibrated Equalized Odds post-processing. Disparate Impact ratio improved from 0.37 → 0.86.",
    outcome: "Model cleared regulatory review after mitigation. Bank implemented quarterly bias monitoring with CFPB oversight requirement.",
    chartData: [
      { group: "White", rate: 68 },
      { group: "Black", rate: 41 },
      { group: "Hispanic", rate: 44 },
      { group: "Asian", rate: 71 },
      { group: "Male", rate: 65 },
      { group: "Female", rate: 38 },
    ],
    radarData: [
      { metric: "Dem. Parity", score: 22 },
      { metric: "Equal Opp.", score: 35 },
      { metric: "Eq. Odds", score: 28 },
      { metric: "Disp. Impact", score: 31 },
      { metric: "Calibration", score: 58 },
      { metric: "Ind. Fairness", score: 44 },
    ],
    legalRef: "Equal Credit Opportunity Act (ECOA), Fair Housing Act, CFPB Regulations, EU AI Act (High Risk)",
    challenges: ["Redlining via proxy features (zip code, neighborhood)", "Intersectional bias across race × income", "Regulatory compliance requirements (ECOA, FHA)", "Explaining denials to applicants (adverse action notices)"],
  },
  healthcare: {
    label: "Healthcare & Triage",
    icon: Heart,
    color: "rose",
    tagline: "Life-critical bias in medical AI and patient triage systems",
    problem: "Healthcare AI systems that predict patient risk or allocate medical resources can encode racial and socioeconomic biases. Because health spending often serves as a proxy for health need, models can systematically underestimate care needs for Black patients.",
    dataset: "Electronic Health Records (2.3M patients, 7 hospitals, 2019–2023)",
    model: "Patient Risk Stratification Model (Random Forest + Neural Net Ensemble)",
    protected: ["race", "ethnicity", "socioeconomic status", "insurance type"],
    metrics: [
      { name: "Demographic Parity", value: "DPD = 0.14", status: "warn" },
      { name: "Equal Opportunity", value: "EOD = 0.23", status: "fail" },
      { name: "Calibration Gap", value: "Δcal = 0.09", status: "warn" },
      { name: "Disparate Impact", value: "DI = 0.71", status: "warn" },
    ],
    biasExample: "A risk scoring algorithm used by US hospitals assigned Black patients a risk score 3.8% lower than White patients with identical chronic conditions — because it used 'health spending' as a proxy for health need. Black patients historically spent less due to systemic access barriers, not lower need.",
    realCase: "Obermeyer et al. (Science, 2019): Widely used commercial health risk algorithm serving 200M+ US patients systematically discriminated against Black patients. The algorithm used healthcare spending as a proxy for health need, even though equal need resulted in less spending for Black patients due to access barriers.",
    mitigation: "Replaced 'health spending' feature with direct health indicators (lab values, diagnoses, vitals). Added race-stratified calibration. Fairness score improved from 54 → 79.",
    outcome: "Algorithm corrected and recalibrated. Rate of Black patients qualifying for care management programs increased by 26%. Published in Science as landmark AI fairness case study.",
    chartData: [
      { group: "White", rate: 58 },
      { group: "Black", rate: 41 },
      { group: "Hispanic", rate: 44 },
      { group: "Asian", rate: 56 },
      { group: "High-SES", rate: 63 },
      { group: "Low-SES", rate: 38 },
    ],
    radarData: [
      { metric: "Dem. Parity", score: 62 },
      { metric: "Equal Opp.", score: 44 },
      { metric: "Eq. Odds", score: 51 },
      { metric: "Disp. Impact", score: 71 },
      { metric: "Calibration", score: 68 },
      { metric: "Ind. Fairness", score: 58 },
    ],
    legalRef: "HIPAA, Affordable Care Act Section 1557, EU Medical Device Regulation (MDR), FDA AI/ML Guidance",
    challenges: ["Using spending as proxy for health need", "Intersectional disparities across race × SES", "Life-critical stakes — errors have severe consequences", "Regulatory complexity (FDA, HIPAA, ACA)"],
  },
  education: {
    label: "Education & Admissions",
    icon: GraduationCap,
    color: "amber",
    tagline: "Algorithmic bias in student assessment and university admissions",
    problem: "AI systems used in student grading, admissions ranking, and dropout prediction can perpetuate educational inequity by encoding systemic disadvantages as individual deficits, creating self-fulfilling prophecies of failure.",
    dataset: "Student records (180,000 students, 12 universities, 5 academic years)",
    model: "Dropout Prediction Gradient Boosting Model + Admissions Ranking System",
    protected: ["race/ethnicity", "socioeconomic status", "first-generation status", "disability"],
    metrics: [
      { name: "Demographic Parity", value: "DPD = 0.11", status: "warn" },
      { name: "Equal Opportunity", value: "EOD = 0.08", status: "warn" },
      { name: "Disparate Impact", value: "DI = 0.79", status: "warn" },
      { name: "Model Accuracy", value: "81.2%", status: "pass" },
    ],
    biasExample: "Exam grading algorithms used during COVID-19 predicted student grades based on school historical performance — systematically downgrading students from schools in deprived areas. Students from top 5% schools received inflated grades; those from bottom 20% received deflated grades regardless of actual ability.",
    realCase: "UK A-level algorithm scandal (2020): An algorithm used by Ofqual to predict exam grades during COVID lockdowns downgraded 39% of teacher-assessed grades, disproportionately affecting students from disadvantaged schools. After widespread protests, the government abandoned the algorithm and reverted to teacher grades.",
    mitigation: "Applied Learning Fair Representations (LFR) pre-processing. Added socioeconomic fairness constraints in admissions ranking. Disparate Impact improved from 0.73 → 0.89.",
    outcome: "Admissions system redesigned with fairness constraints. First-generation student admission rates increased 8.3%. Annual bias audit now mandatory for all UK exam algorithms under Equalities Act.",
    chartData: [
      { group: "High-SES", rate: 72 },
      { group: "Low-SES", rate: 48 },
      { group: "White", rate: 65 },
      { group: "Black", rate: 51 },
      { group: "First-Gen", rate: 44 },
      { group: "Non-First", rate: 68 },
    ],
    radarData: [
      { metric: "Dem. Parity", score: 71 },
      { metric: "Equal Opp.", score: 64 },
      { metric: "Eq. Odds", score: 67 },
      { metric: "Disp. Impact", score: 79 },
      { metric: "Calibration", score: 75 },
      { metric: "Ind. Fairness", score: 69 },
    ],
    legalRef: "UK Equality Act 2010, FERPA (US), EU AI Act (High Risk Systems), UNESCO AI Ethics Recommendations",
    challenges: ["School-level vs student-level fairness", "SES as confounder for academic potential", "Feedback loops (biased grades → biased training data)", "Balancing diversity goals with merit criteria"],
  },
};

const colorStyles: Record<string, { bg: string; text: string; border: string; light: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", light: "bg-violet-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", light: "bg-blue-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", light: "bg-rose-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", light: "bg-amber-500/20" },
};

const statusIcon: Record<string, ReactNode> = {
  fail: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  pass: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
};

export function Applications() {
  const [activeApp, setActiveApp] = useState<AppId>("hiring");
  const app = applications[activeApp];
  const cs = colorStyles[app.color];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl text-white">Real-World Applications</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI fairness case studies across industry domains — with documented bias patterns, metrics, and mitigation outcomes
        </p>
      </div>

      {/* Domain Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(applications) as [AppId, typeof applications[AppId]][]).map(([id, a]) => (
          <button
            key={id}
            onClick={() => setActiveApp(id)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              activeApp === id
                ? `${colorStyles[a.color].bg} ${colorStyles[a.color].border} ring-1 ring-${a.color}-500/20`
                : "bg-gray-900 border-gray-800 hover:border-gray-600"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeApp === id ? colorStyles[a.color].light : "bg-gray-800"}`}>
              <a.icon className={`w-5 h-5 ${activeApp === id ? colorStyles[a.color].text : "text-gray-400"}`} />
            </div>
            <span className={`text-sm ${activeApp === id ? "text-white" : "text-gray-400"}`}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* App Header */}
      <div className={`${cs.bg} border ${cs.border} rounded-xl p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${cs.light} flex items-center justify-center shrink-0`}>
            <app.icon className={`w-6 h-6 ${cs.text}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-white">{app.label}</h2>
            <p className={`text-sm ${cs.text} mt-0.5`}>{app.tagline}</p>
            <p className="text-gray-300 text-sm mt-3">{app.problem}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
          <div>
            <p className="text-xs text-gray-400">Dataset</p>
            <p className="text-sm text-gray-200 mt-0.5">{app.dataset}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Model</p>
            <p className="text-sm text-gray-200 mt-0.5">{app.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Protected Attributes</p>
            <p className="text-sm text-gray-200 mt-0.5">{app.protected.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Metrics + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          <h3 className="text-white">Fairness Metric Results</h3>
          {app.metrics.map((m) => (
            <div key={m.name} className={`flex items-center justify-between p-3.5 rounded-xl border ${
              m.status === "fail" ? "bg-red-500/10 border-red-500/30" :
              m.status === "warn" ? "bg-amber-500/10 border-amber-500/30" :
              "bg-emerald-500/10 border-emerald-500/30"
            }`}>
              <div className="flex items-center gap-2">
                {statusIcon[m.status]}
                <p className="text-sm text-gray-200">{m.name}</p>
              </div>
              <p className={`text-xs font-mono ${m.status === "fail" ? "text-red-400" : m.status === "warn" ? "text-amber-400" : "text-emerald-400"}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 text-sm">Positive Outcome Rate by Group</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={app.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="group" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 10 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${v}%`]} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {app.chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.rate < 50 ? "#ef4444" : "#8b5cf6"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 text-sm">Fairness Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={app.radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 8 }} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Case Study */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Bias Pattern Found</h3>
          <p className="text-gray-300 text-sm">{app.biasExample}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4 text-blue-400" /> Real-World Case</h3>
          <p className="text-gray-300 text-sm">{app.realCase}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-violet-400" /> Mitigation Applied</h3>
          <p className="text-gray-300 text-sm">{app.mitigation}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Outcome & Impact</h3>
          <p className="text-gray-300 text-sm">{app.outcome}</p>
        </div>
      </div>

      {/* Legal + Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><Scale className="w-4 h-4 text-amber-400" /> Legal & Regulatory Framework</h3>
          <p className="text-amber-300 text-sm">{app.legalRef}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Key Challenges</h3>
          <ul className="space-y-1.5">
            {app.challenges.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-300">
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}