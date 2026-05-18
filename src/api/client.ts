export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function uploadDataset(file: File): Promise<{ dataset_id: string }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/v1/upload/dataset", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return (await res.json()) as { dataset_id: string };
}

export async function analyzeDatasetIntelligence(file: File): Promise<any> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/v1/intelligence/analyze-intelligence", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Intelligence analysis failed: ${res.status}`);
  }

  return await res.json();
}

export type AnalyzeResponse = {
  report_id: string;
  dataset_id: string;
  metrics: {
    demographic_parity: { by_group: Record<string, number>; difference: number };
    equal_opportunity: {
      by_group: Record<string, number>;
      difference: number;
      used_prediction_column: string;
      prediction_column_present: boolean;
    };
    disparate_impact: {
      by_group: Record<string, number>;
      reference_group: string;
      ratios: Record<string, number>;
      min_ratio: number;
    };
    bias_detected: boolean;
  };
  risk_score: number;
  risk_level: string;
};

export async function analyzeDataset(payload: {
  dataset_id: string;
  target_column: string;
  sensitive_attribute: string;
  prediction_column?: string;
}): Promise<AnalyzeResponse> {
  const requestBody = {
    dataset_id: payload.dataset_id,
    target_column: payload.target_column,
    sensitive_attributes: [payload.sensitive_attribute],
    prediction_column: payload.prediction_column
  };
  return apiFetch<AnalyzeResponse>("/api/v1/analyze", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export async function mitigateBias(payload: any): Promise<any> {
  return apiFetch<any>("/api/v1/mitigate/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchModelExplanation(payload?: any): Promise<any> {
  return apiFetch<any>("/api/v1/model/explain");
}

export async function fetchReports(): Promise<any> {
  return apiFetch<any>("/api/v1/reports/");
}

export async function fetchDashboardStats(): Promise<any> {
  return apiFetch<any>("/api/v1/dashboard/stats");
}
