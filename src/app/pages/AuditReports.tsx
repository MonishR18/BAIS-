import { useState } from "react";
import {
  FileText, Download, CheckCircle2, XCircle, AlertTriangle, Clock,
  Shield, BarChart3, TrendingUp, Eye, Filter,
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { ReactNode } from "react";

const reports = [
  {
    id: "AUD-2847", model: "Loan Approval Classifier v3.2", domain: "Banking",
    date: "Apr 19, 2026", status: "critical", score: 54,
    metrics: { dp: "FAIL", eo: "FAIL", eodds: "FAIL", di: "FAIL" },
    bias_detected: true, mitigated: false,
  },
  {
    id: "AUD-2846", model: "Resume Screener v1.8", domain: "Hiring",
    date: "Apr 19, 2026", status: "warning", score: 71,
    metrics: { dp: "WARN", eo: "FAIL", eodds: "WARN", di: "PASS" },
    bias_detected: true, mitigated: false,
  },
  {
    id: "AUD-2845", model: "Insurance Risk Predictor v2.1", domain: "Insurance",
    date: "Apr 18, 2026", status: "passed", score: 88,
    metrics: { dp: "PASS", eo: "PASS", eodds: "PASS", di: "PASS" },
    bias_detected: false, mitigated: true,
  },
  {
    id: "AUD-2844", model: "Credit Score Engine v4.0", domain: "Banking",
    date: "Apr 18, 2026", status: "passed", score: 91,
    metrics: { dp: "PASS", eo: "PASS", eodds: "PASS", di: "PASS" },
    bias_detected: false, mitigated: true,
  },
  {
    id: "AUD-2843", model: "Patient Triage AI v1.3", domain: "Healthcare",
    date: "Apr 17, 2026", status: "warning", score: 67,
    metrics: { dp: "PASS", eo: "FAIL", eodds: "WARN", di: "WARN" },
    bias_detected: true, mitigated: false,
  },
];

const radarDataCritical = [
  { metric: "Dem. Parity", score: 22 },
  { metric: "Equal Opp.", score: 35 },
  { metric: "Eq. Odds", score: 28 },
  { metric: "Disp. Impact", score: 31 },
  { metric: "Calibration", score: 58 },
  { metric: "Ind. Fairness", score: 44 },
];

const statusConfig: Record<string, { color: string; bg: string; icon: ReactNode; label: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: <XCircle className="w-4 h-4 text-red-400" />, label: "Critical" },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: "Warning" },
  passed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: "Passed" },
};

const metricStatusStyle: Record<string, string> = {
  PASS: "text-emerald-400 bg-emerald-500/10",
  FAIL: "text-red-400 bg-red-500/10",
  WARN: "text-amber-400 bg-amber-500/10",
};

export function AuditReports() {
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">Audit Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Complete fairness audit history and detailed report generation</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2.5 rounded-lg transition-colors">
          <FileText className="w-4 h-4" />
          New Audit Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: reports.length, icon: FileText, color: "violet" },
          { label: "Critical Issues", value: reports.filter(r => r.status === "critical").length, icon: XCircle, color: "red" },
          { label: "Warnings", value: reports.filter(r => r.status === "warning").length, icon: AlertTriangle, color: "amber" },
          { label: "Passed", value: reports.filter(r => r.status === "passed").length, icon: CheckCircle2, color: "emerald" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color === "violet" ? "text-violet-400" : s.color === "red" ? "text-red-400" : s.color === "amber" ? "text-amber-400" : "text-emerald-400"}`} />
            </div>
            <p className="text-2xl text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Report List */}
        <div className="lg:w-80 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="passed">Passed</option>
            </select>
          </div>
          {filtered.map((report) => {
            const sc = statusConfig[report.status];
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left p-4 bg-gray-900 border rounded-xl transition-all ${
                  selectedReport.id === report.id ? "border-violet-500 ring-1 ring-violet-500/30" : "border-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-mono">{report.id}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${sc.bg} ${sc.color}`}>
                    {sc.icon} {sc.label}
                  </div>
                </div>
                <p className="text-sm text-white truncate">{report.model}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{report.domain}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm ${report.score >= 80 ? "text-emerald-400" : report.score >= 65 ? "text-amber-400" : "text-red-400"}`}>
                      {report.score}
                    </span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Report Detail */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-white">{selectedReport.model}</h2>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${statusConfig[selectedReport.status].bg} ${statusConfig[selectedReport.status].color}`}>
                    {statusConfig[selectedReport.status].icon}
                    {statusConfig[selectedReport.status].label}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{selectedReport.id} · {selectedReport.domain} · {selectedReport.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button className="flex items-center gap-2 text-sm text-white bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-400 mb-1">Fairness Score</p>
                <p className={`text-2xl ${selectedReport.score >= 80 ? "text-emerald-400" : selectedReport.score >= 65 ? "text-amber-400" : "text-red-400"}`}>
                  {selectedReport.score}<span className="text-sm text-gray-400">/100</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Bias Detected</p>
                <p className={`text-sm ${selectedReport.bias_detected ? "text-red-400" : "text-emerald-400"}`}>
                  {selectedReport.bias_detected ? "Yes — Action Required" : "No — Clean"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Mitigation Applied</p>
                <p className={`text-sm ${selectedReport.mitigated ? "text-emerald-400" : "text-gray-400"}`}>
                  {selectedReport.mitigated ? "Yes — Reweighing" : "Not yet"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Deployment Status</p>
                <p className={`text-sm ${selectedReport.status === "passed" ? "text-emerald-400" : "text-red-400"}`}>
                  {selectedReport.status === "passed" ? "Approved" : "Blocked"}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white mb-4">Fairness Metric Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Demographic Parity", key: "dp" },
                { label: "Equal Opportunity", key: "eo" },
                { label: "Equalized Odds", key: "eodds" },
                { label: "Disparate Impact", key: "di" },
              ].map(({ label, key }) => {
                const val = selectedReport.metrics[key as keyof typeof selectedReport.metrics];
                return (
                  <div key={key} className={`rounded-xl p-4 border ${metricStatusStyle[val]} border-current/20`}>
                    <p className="text-xs text-gray-400 mb-2">{label}</p>
                    <div className="flex items-center gap-2">
                      {val === "PASS" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                       val === "FAIL" ? <XCircle className="w-4 h-4 text-red-400" /> :
                       <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      <span className={`text-sm font-mono ${val === "PASS" ? "text-emerald-400" : val === "FAIL" ? "text-red-400" : "text-amber-400"}`}>{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar + Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white mb-3">Fairness Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarDataCritical}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke={selectedReport.score >= 80 ? "#10b981" : selectedReport.score >= 65 ? "#f59e0b" : "#ef4444"} fill={selectedReport.score >= 80 ? "#10b981" : selectedReport.score >= 65 ? "#f59e0b" : "#ef4444"} fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white mb-3">Recommendations</h3>
              <div className="space-y-3">
                {selectedReport.status !== "passed" ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-red-300 font-medium">Block Deployment</p>
                        <p className="text-xs text-gray-400 mt-0.5">Model fails fairness thresholds. Cannot deploy without mitigation.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-300 font-medium">Apply Reweighing</p>
                        <p className="text-xs text-gray-400 mt-0.5">Pre-processing mitigation estimated to raise score to ~78.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                      <Shield className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-violet-300 font-medium">Adversarial Debiasing</p>
                        <p className="text-xs text-gray-400 mt-0.5">In-processing approach for stronger fairness guarantees.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-emerald-300 font-medium">Approved for Deployment</p>
                        <p className="text-xs text-gray-400 mt-0.5">All fairness metrics within acceptable thresholds.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-blue-300 font-medium">Schedule Monitoring</p>
                        <p className="text-xs text-gray-400 mt-0.5">Set up continuous fairness monitoring post-deployment.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}