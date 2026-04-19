import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Shield,
  Brain,
  FileText,
  Network,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/dataset", label: "Dataset Analysis", icon: Database },
  { path: "/metrics", label: "Fairness Metrics", icon: BarChart3 },
  { path: "/mitigation", label: "Bias Mitigation", icon: Shield },
  { path: "/model-analysis", label: "Model Analysis", icon: Brain },
  { path: "/reports", label: "Audit Reports", icon: FileText },
  { path: "/architecture", label: "Architecture", icon: Network },
  { path: "/applications", label: "Applications", icon: Globe2 },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-white leading-tight">FairAudit</p>
              <p className="text-xs text-gray-400">AI Fairness Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-violet-400" : ""}`} />
                  {!collapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* System Status */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">System Status</p>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-gray-300">Audit Engine Online</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-gray-300">3 Active Alerts</span>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-3 border-t border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datasets, models, reports..."
              className="bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white">Dr. Sarah Chen</p>
              <p className="text-xs text-gray-400">ML Fairness Engineer</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
