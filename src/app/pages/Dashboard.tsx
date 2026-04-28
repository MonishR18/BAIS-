import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PolarRadiusAxis,
} from "recharts";
import {
  Shield, AlertTriangle, CheckCircle2, TrendingDown,
  Database, FileText, Zap, Activity, ArrowRight, Clock,
} from "lucide-react";
import { Link } from "react-router";
import { fetchDashboardStats } from "../../lib/api";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  warning: { label: "Warning", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  passed: { label: "Passed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
};

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6 text-white">Loading dashboard...</div>;
  }

  const { auditTrendData, metricsRadarData, biasDistributionData, recentAudits, statCards } = data;

  const iconMap: Record<string, any> = {
    "Total Audits": Shield,
    "Bias Detected": AlertTriangle,
    "Passed Audits": CheckCircle2,
    "Avg. Fairness Score": TrendingDown,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white">AI Fairness Auditing Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time bias detection & mitigation monitoring across all deployed models
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">System Active</span>
          </div>
          <Link
            to="/dataset"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            New Audit
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card: any) => {
          const IconComponent = iconMap[card.label] || Shield;
          return (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm">{card.label}</p>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  card.color === "violet" ? "bg-violet-500/10" :
                  card.color === "amber" ? "bg-amber-500/10" :
                  card.color === "emerald" ? "bg-emerald-500/10" :
                  "bg-blue-500/10"
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    card.color === "violet" ? "text-violet-400" :
                    card.color === "amber" ? "text-amber-400" :
                    card.color === "emerald" ? "text-emerald-400" :
                    "text-blue-400"
                  }`} />
                </div>
              </div>
              <p className="text-2xl text-white mb-1">{card.value}</p>
              <p className={`text-xs ${card.change.startsWith("+") && card.label !== "Bias Detected" ? "text-emerald-400" : card.change.startsWith("-") && card.label === "Bias Detected" ? "text-emerald-400" : "text-amber-400"}`}>
                {card.change} vs last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Audit Trend */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-base">Audit Results Trend</h2>
              <p className="text-gray-400 text-xs mt-0.5">Monthly audit pass/fail distribution</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500 opacity-80" /><span className="text-gray-400">Passed</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500 opacity-80" /><span className="text-gray-400">Failed</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={auditTrendData}>
              <defs>
                <linearGradient id="passedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#f9fafb" }}
                itemStyle={{ color: "#d1d5db" }}
              />
              <Area type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} fill="url(#passedGrad)" name="Passed" />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#failedGrad)" name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-white text-base">Fairness Coverage</h2>
            <p className="text-gray-400 text-xs mt-0.5">Current model fairness scores</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={metricsRadarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                itemStyle={{ color: "#d1d5db" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bias by Domain */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-white text-base">Bias Severity by Domain</h2>
            <p className="text-gray-400 text-xs mt-0.5">Risk distribution across industries</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={biasDistributionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis type="category" dataKey="domain" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 11 }} width={70} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                itemStyle={{ color: "#d1d5db" }}
              />
              <Bar dataKey="high" stackId="a" fill="#ef4444" name="High" radius={[0,0,0,0]} />
              <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" />
              <Bar dataKey="low" stackId="a" fill="#10b981" name="Low" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Audits */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-base">Recent Audits</h2>
              <p className="text-gray-400 text-xs mt-0.5">Latest model fairness assessments</p>
            </div>
            <Link to="/reports" className="flex items-center gap-1 text-violet-400 text-xs hover:text-violet-300 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAudits.map((audit: any) => {
              const sc = statusConfig[audit.status];
              return (
                <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-white">{audit.model}</p>
                      <p className="text-xs text-gray-400">{audit.id} · {audit.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-white">{audit.score}</p>
                      <p className="text-xs text-gray-400">score</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {audit.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Database, label: "Analyze Dataset", desc: "Upload and scan for bias", to: "/dataset", color: "blue" },
          { icon: Shield, label: "Run Mitigation", desc: "Apply fairness corrections", to: "/mitigation", color: "violet" },
          { icon: FileText, label: "Generate Report", desc: "Export audit PDF report", to: "/reports", color: "emerald" },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              action.color === "blue" ? "bg-blue-500/10" :
              action.color === "violet" ? "bg-violet-500/10" :
              "bg-emerald-500/10"
            }`}>
              <action.icon className={`w-5 h-5 ${
                action.color === "blue" ? "text-blue-400" :
                action.color === "violet" ? "text-violet-400" :
                "text-emerald-400"
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{action.label}</p>
              <p className="text-xs text-gray-400">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
