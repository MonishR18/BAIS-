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

export type AnalyzeResponse = {
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

export async function analyzeDataset(payload: {
  dataset_id: string;
  target_column: string;
  sensitive_attribute: string;
  prediction_column?: string;
}): Promise<AnalyzeResponse> {
  return apiFetch<AnalyzeResponse>("/api/v1/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
