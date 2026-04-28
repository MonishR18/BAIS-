import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { DatasetAnalysis } from "./pages/DatasetAnalysis";
import { FairnessMetrics } from "./pages/FairnessMetrics";
import { BiasMitigation } from "./pages/BiasMitigation";
import { ModelAnalysis } from "./pages/ModelAnalysis";
import { AuditReports } from "./pages/AuditReports";
import { Architecture } from "./pages/Architecture";
import { Applications } from "./pages/Applications";
import { Simulation } from "./pages/Simulation";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dataset",
        Component: () => (
          <ProtectedRoute>
            <DatasetAnalysis />
          </ProtectedRoute>
        ),
      },
      {
        path: "metrics",
        Component: () => (
          <ProtectedRoute>
            <FairnessMetrics />
          </ProtectedRoute>
        ),
      },
      {
        path: "mitigation",
        Component: () => (
          <ProtectedRoute>
            <BiasMitigation />
          </ProtectedRoute>
        ),
      },
      {
        path: "explainability",
        Component: () => (
          <ProtectedRoute>
            <ModelAnalysis />
          </ProtectedRoute>
        ),
      },
      {
        path: "simulation",
        Component: () => (
          <ProtectedRoute>
            <Simulation />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        Component: () => (
          <ProtectedRoute>
            <AuditReports />
          </ProtectedRoute>
        ),
      },
      {
        path: "architecture",
        Component: () => (
          <ProtectedRoute>
            <Architecture />
          </ProtectedRoute>
        ),
      },
      {
        path: "applications",
        Component: () => (
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
