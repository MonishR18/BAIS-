import { useState } from "react";
import { Network, Server, Database, Code2, Container, Globe, ArrowRight, Layers, Cpu, Shield } from "lucide-react";

interface LayerBoxProps {
  icon: React.ElementType;
  title: string;
  color: string;
  items: { name: string; desc: string; badge?: string }[];
  selected: boolean;
  onClick: () => void;
}

function LayerBox({ icon: Icon, title, color, items, selected, onClick }: LayerBoxProps) {
  const colorMap: Record<string, string> = {
    violet: "border-violet-500 bg-violet-500/10",
    blue: "border-blue-500 bg-blue-500/10",
    emerald: "border-emerald-500 bg-emerald-500/10",
    amber: "border-amber-500 bg-amber-500/10",
    rose: "border-rose-500 bg-rose-500/10",
    cyan: "border-cyan-500 bg-cyan-500/10",
  };
  const iconColor: Record<string, string> = {
    violet: "text-violet-400", blue: "text-blue-400", emerald: "text-emerald-400",
    amber: "text-amber-400", rose: "text-rose-400", cyan: "text-cyan-400",
  };
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all ${
        selected ? `${colorMap[color]} ring-1 ring-${color}-500/30` : "border-gray-800 hover:border-gray-600"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800`}>
          <Icon className={`w-5 h-5 ${iconColor[color]}`} />
        </div>
        <h3 className="text-white text-sm">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-gray-200">{item.name}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            {item.badge && (
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${colorMap[color]} ${iconColor[color]}`}>{item.badge}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const layers = [
  {
    id: "ingestion",
    icon: Database,
    title: "Data Ingestion Layer",
    color: "blue",
    items: [
      { name: "CSV / Parquet / JSON upload", desc: "Multi-format dataset ingestion", badge: "Input" },
      { name: "PostgreSQL / S3", desc: "Persistent storage & data lake", badge: "Storage" },
      { name: "Pandas / PySpark", desc: "DataFrame processing at scale" },
    ],
    detail: {
      title: "Data Ingestion & Storage",
      description: "Handles multi-format dataset uploads with automatic schema inference, data quality checks, and storage in PostgreSQL for structured metadata and S3/local filesystem for raw files. Supports streaming ingestion for large datasets using PySpark.",
      tech: ["PostgreSQL 16", "Apache Parquet", "Pandas 2.x", "PySpark 3.5", "FastAPI File Upload", "AWS S3 (optional)"],
      flow: "User → Upload API → Schema Validation → Feature Type Detection → Protected Attr Identification → Database",
    },
  },
  {
    id: "analysis",
    icon: Cpu,
    title: "Bias Analysis Engine",
    color: "violet",
    items: [
      { name: "Statistical Tests", desc: "Chi-square, t-test, KS test", badge: "Core" },
      { name: "AIF360 Integration", desc: "IBM fairness toolkit", badge: "Library" },
      { name: "Fairlearn", desc: "Microsoft fairness metrics" },
    ],
    detail: {
      title: "Bias Analysis Engine",
      description: "Computes a comprehensive set of fairness metrics including Demographic Parity Difference, Equal Opportunity Difference, Equalized Odds, and Disparate Impact Ratio. Uses AIF360 for pre-processing metrics and Fairlearn for in/post-processing evaluation.",
      tech: ["AIF360 0.5", "Fairlearn 0.10", "Scikit-learn", "SciPy Stats", "NumPy", "Statsmodels"],
      flow: "Dataset → Protected Attr. Detection → Metric Computation → Threshold Check → Alert Generation",
    },
  },
  {
    id: "mitigation",
    icon: Shield,
    title: "Mitigation Engine",
    color: "emerald",
    items: [
      { name: "Pre-processing", desc: "Reweighing, LFR, DIR", badge: "Phase 1" },
      { name: "In-processing", desc: "Adversarial Debiasing, PR", badge: "Phase 2" },
      { name: "Post-processing", desc: "Calibrated EO, ROC", badge: "Phase 3" },
    ],
    detail: {
      title: "Bias Mitigation Engine",
      description: "Applies a three-phase mitigation pipeline with configurable algorithms at each stage. Supports constraint-based optimization, adversarial training, and threshold adjustment methods. Each mitigation run creates a versioned snapshot for comparison.",
      tech: ["AIF360 Algorithms", "Fairlearn Constraints", "TensorFlow (Adversarial)", "Scikit-learn Pipeline", "Optuna (HPO)"],
      flow: "Biased Model → Select Phase → Configure Algorithm → Apply → Validate Metrics → Compare Before/After",
    },
  },
  {
    id: "explainability",
    icon: Layers,
    title: "Explainability Module",
    color: "amber",
    items: [
      { name: "SHAP", desc: "SHapley values — global & local", badge: "XAI" },
      { name: "LIME", desc: "Local linear approximations", badge: "XAI" },
      { name: "Counterfactuals", desc: "What-if analysis", badge: "XAI" },
    ],
    detail: {
      title: "Explainability Module (XAI)",
      description: "Provides model-agnostic explanations using SHAP TreeExplainer (for tree models) and KernelExplainer (model-agnostic). LIME generates perturbation-based local explanations. Counterfactual analysis identifies the minimal feature changes needed to flip a prediction.",
      tech: ["SHAP 0.44", "LIME 0.2", "DiCE-ML (Counterfactuals)", "Matplotlib", "Plotly"],
      flow: "Trained Model → SHAP/LIME Computation → Feature Attribution → Protected Attr. Impact → Bias Visualization",
    },
  },
  {
    id: "api",
    icon: Code2,
    title: "Backend API",
    color: "rose",
    items: [
      { name: "FastAPI / Flask", desc: "RESTful API + async support", badge: "Python" },
      { name: "JWT Authentication", desc: "Secure audit access control" },
      { name: "WebSockets", desc: "Real-time audit progress updates" },
    ],
    detail: {
      title: "Backend API Layer",
      description: "FastAPI provides high-performance async REST endpoints for all platform operations. JWT-based authentication with role-based access control (RBAC). Background task queue (Celery + Redis) handles long-running audit jobs. WebSocket endpoints push real-time progress updates to the frontend.",
      tech: ["FastAPI 0.115", "Celery 5.x", "Redis 7", "SQLAlchemy 2.0", "Alembic", "PyJWT", "Pydantic v2"],
      flow: "React → HTTPS → FastAPI Router → Auth Middleware → Business Logic → AIF360/Fairlearn → DB → Response",
    },
  },
  {
    id: "frontend",
    icon: Globe,
    title: "Frontend Dashboard",
    color: "cyan",
    items: [
      { name: "React 18 + TypeScript", desc: "Component-based UI", badge: "UI" },
      { name: "Recharts / D3.js", desc: "Interactive fairness charts" },
      { name: "Tailwind CSS", desc: "Utility-first responsive design" },
    ],
    detail: {
      title: "React Frontend Dashboard",
      description: "A fully interactive single-page application built with React 18 and TypeScript. Provides dataset upload, real-time metric visualization, mitigation configuration, and PDF report generation. Uses Recharts for all fairness visualizations and react-router for multi-page navigation.",
      tech: ["React 18", "TypeScript 5", "Tailwind CSS v4", "Recharts 2.x", "React Router 7", "Lucide Icons"],
      flow: "User Action → React Component → API Call → Real-time Chart Update → Report Generation",
    },
  },
  {
    id: "infra",
    icon: Container,
    title: "Infrastructure",
    color: "amber",
    items: [
      { name: "Docker / Kubernetes", desc: "Container orchestration", badge: "DevOps" },
      { name: "CI/CD Pipeline", desc: "GitHub Actions auto-testing" },
      { name: "Prometheus + Grafana", desc: "Monitoring & alerting" },
    ],
    detail: {
      title: "Infrastructure & DevOps",
      description: "Fully containerized deployment using Docker Compose for development and Kubernetes for production. GitHub Actions runs automated fairness regression tests on every commit. Prometheus scrapes metrics from FastAPI and exports to Grafana dashboards for operational monitoring.",
      tech: ["Docker 25", "Kubernetes 1.30", "GitHub Actions", "Prometheus", "Grafana", "Nginx", "Helm Charts"],
      flow: "Git Push → CI Test → Docker Build → K8s Deploy → Health Check → Prometheus → Grafana Alert",
    },
  },
];

const workflowSteps = [
  { step: "01", title: "Upload Dataset", desc: "CSV/Parquet with protected attributes" },
  { step: "02", title: "Auto-detect Bias", desc: "Statistical analysis + fairness metrics" },
  { step: "03", title: "Select Mitigation", desc: "Pre/In/Post-processing algorithms" },
  { step: "04", title: "Train Fair Model", desc: "Apply constraints during training" },
  { step: "05", title: "Validate Metrics", desc: "Re-evaluate all fairness metrics" },
  { step: "06", title: "Generate Report", desc: "Export audit PDF for compliance" },
  { step: "07", title: "Deploy + Monitor", desc: "Continuous fairness monitoring" },
];

export function Architecture() {
  const [selectedLayer, setSelectedLayer] = useState(layers[0]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl text-white">System Architecture</h1>
        <p className="text-gray-400 text-sm mt-1">
          End-to-end platform design — from data ingestion to fair model deployment
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white mb-6">Platform Architecture Overview</h2>
        <div className="flex items-center flex-wrap gap-2 mb-6">
          {["Data Layer", "→", "Analysis Engine", "→", "Mitigation Engine", "→", "API Layer", "→", "Frontend"].map((item, i) => (
            item === "→" ? (
              <ArrowRight key={i} className="w-4 h-4 text-gray-600" />
            ) : (
              <div key={item} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300">
                {item}
              </div>
            )
          ))}
        </div>

        <div className="bg-gray-800/40 rounded-xl p-4 font-mono text-xs border border-gray-700/50 leading-relaxed">
          <p className="text-violet-300">{"# FairAudit System Architecture"}</p>
          <p className="text-gray-400 mt-2">{"┌────────────────────────────────────────────────────────────────┐"}</p>
          <p className="text-gray-400">{"│                    React Frontend (Port 3000)                  │"}</p>
          <p className="text-gray-400">{"└─────────────────────────────┬──────────────────────────────────┘"}</p>
          <p className="text-gray-400">{"                              │ HTTPS / WebSocket"}</p>
          <p className="text-gray-400">{"┌─────────────────────────────▼──────────────────────────────────┐"}</p>
          <p className="text-blue-300">{"│                  FastAPI Backend (Port 8000)                   │"}</p>
          <p className="text-gray-400">{"│   /api/datasets   /api/audit   /api/mitigate   /api/reports   │"}</p>
          <p className="text-gray-400">{"└──────┬──────────────────────────────────────────────┬─────────┘"}</p>
          <p className="text-gray-400">{"       │ SQLAlchemy ORM                                │ Celery"}</p>
          <p className="text-gray-400">{"┌──────▼──────────┐                    ┌──────────────▼─────────┐"}</p>
          <p className="text-emerald-300">{"│  PostgreSQL DB   │                    │  AIF360 / Fairlearn    │"}</p>
          <p className="text-gray-400">{"│  Audit metadata  │                    │  SHAP / LIME / DiCE    │"}</p>
          <p className="text-gray-400">{"└──────────────────┘                    └────────────────────────┘"}</p>
          <p className="text-gray-400">{"       │ Dataset files                                           "}</p>
          <p className="text-gray-400">{"┌──────▼──────────┐"}</p>
          <p className="text-amber-300">{"│  File Store/S3   │ ← CSV, Parquet, JSON datasets"}</p>
          <p className="text-gray-400">{"└──────────────────┘"}</p>
        </div>
      </div>

      {/* Layer Cards */}
      <div>
        <h2 className="text-white mb-4">Architecture Layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {layers.map((layer) => (
            <LayerBox
              key={layer.id}
              icon={layer.icon}
              title={layer.title}
              color={layer.color}
              items={layer.items}
              selected={selectedLayer.id === layer.id}
              onClick={() => setSelectedLayer(layer)}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedLayer && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white mb-2">{selectedLayer.detail.title}</h2>
          <p className="text-gray-400 text-sm mb-5">{selectedLayer.detail.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {selectedLayer.detail.tech.map((t) => (
                  <span key={t} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Data Flow</p>
              <div className="bg-gray-800/60 rounded-lg p-3 text-xs text-gray-300 font-mono border border-gray-700/50">
                {selectedLayer.detail.flow}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white mb-5">End-to-End Audit Workflow</h2>
        <div className="flex items-start gap-4 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={step.step} className="flex items-start gap-2 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 text-sm shrink-0">
                  {step.step}
                </div>
                <div className="w-px h-full bg-transparent" />
              </div>
              <div className="pt-1 min-w-32 max-w-36">
                <p className="text-sm text-white">{step.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-600 mt-3 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
