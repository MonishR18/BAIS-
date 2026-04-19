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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "dataset", Component: DatasetAnalysis },
      { path: "metrics", Component: FairnessMetrics },
      { path: "mitigation", Component: BiasMitigation },
      { path: "model-analysis", Component: ModelAnalysis },
      { path: "reports", Component: AuditReports },
      { path: "architecture", Component: Architecture },
      { path: "applications", Component: Applications },
    ],
  },
]);
