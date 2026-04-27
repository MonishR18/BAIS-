from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class BiasMetricResult:
    by_group: dict[str, float]
    difference: float


@dataclass(frozen=True)
class DisparateImpactResult:
    by_group: dict[str, float]
    reference_group: str
    ratios: dict[str, float]
    min_ratio: float


class BiasEngineError(ValueError):
    pass


class BiasEngine:
    """Compute simple group fairness metrics from tabular data.

    Assumptions:
    - `target_column` is a binary outcome (0/1) OR can be cast to {0,1}.
    - Equal Opportunity ideally requires a prediction column and a ground-truth
      column. Because the API only provides `target_column`, this engine will:
        - use `prediction_column` if present in the dataset (default: "prediction")
        - otherwise fallback to `target_column` as prediction.

    This keeps the endpoint usable for demo datasets while still supporting the
    more correct case when a `prediction` column exists.
    """

    def analyze(
        self,
        *,
        file_path: str,
        target_column: str,
        sensitive_attribute: str,
        prediction_column: str = "prediction",
    ) -> dict[str, Any]:
        try:
            df = pd.read_csv(file_path)
        except FileNotFoundError as exc:
            raise BiasEngineError("Dataset file not found") from exc
        except Exception as exc:
            raise BiasEngineError("Failed to read dataset") from exc

        if df.empty:
            raise BiasEngineError("Dataset is empty")

        for col in (target_column, sensitive_attribute):
            if col not in df.columns:
                raise BiasEngineError(f"Missing required column: {col}")

        has_pred = prediction_column in df.columns
        selected_cols = [sensitive_attribute, target_column]
        if has_pred:
            selected_cols.append(prediction_column)

        # Drop missing sensitive/target values
        df = df[selected_cols].copy()
        df = df.dropna(subset=[sensitive_attribute, target_column])
        if df.empty:
            raise BiasEngineError("No valid rows after dropping missing values")

        # Normalize sensitive attribute to string labels
        df[sensitive_attribute] = df[sensitive_attribute].astype(str)

        # Convert target to 0/1
        y = self._coerce_binary_series(df[target_column], target_column)
        df[target_column] = y

        if has_pred:
            yhat = self._coerce_binary_series(df[prediction_column], prediction_column)
            df[prediction_column] = yhat
        else:
            df[prediction_column] = df[target_column]

        # Ensure at least 2 groups
        groups = sorted(df[sensitive_attribute].unique().tolist())
        if len(groups) < 2:
            raise BiasEngineError("Sensitive attribute must have at least 2 groups")

        demographic_parity = self._demographic_parity(df, sensitive_attribute, prediction_column)
        equal_opportunity = self._equal_opportunity(df, sensitive_attribute, target_column, prediction_column)
        disparate_impact = self._disparate_impact(df, sensitive_attribute, prediction_column)

        bias_detected = (
            disparate_impact.min_ratio < 0.8
            or demographic_parity.difference > 0.1
            or equal_opportunity.difference > 0.1
        )

        return {
            "demographic_parity": {
                "by_group": demographic_parity.by_group,
                "difference": demographic_parity.difference,
            },
            "equal_opportunity": {
                "by_group": equal_opportunity.by_group,
                "difference": equal_opportunity.difference,
                "used_prediction_column": prediction_column,
                "prediction_column_present": has_pred,
            },
            "disparate_impact": {
                "by_group": disparate_impact.by_group,
                "reference_group": disparate_impact.reference_group,
                "ratios": disparate_impact.ratios,
                "min_ratio": disparate_impact.min_ratio,
            },
            "bias_detected": bias_detected,
        }

    def _coerce_binary_series(self, s: pd.Series, column_name: str) -> pd.Series:
        # Map common string labels
        if s.dtype == object:
            lower = s.astype(str).str.strip().str.lower()
            mapped = lower.map(
                {
                    "1": 1,
                    "0": 0,
                    "true": 1,
                    "false": 0,
                    "yes": 1,
                    "no": 0,
                    "y": 1,
                    "n": 0,
                    "positive": 1,
                    "negative": 0,
                }
            )
            if mapped.isna().any():
                # try numeric conversion fallback
                try:
                    numeric = pd.to_numeric(s)
                    mapped = (numeric > 0).astype(int)
                except Exception as exc:
                    raise BiasEngineError(
                        f"Column '{column_name}' must be binary (0/1)"
                    ) from exc
            return mapped.astype(int)

        try:
            numeric = pd.to_numeric(s)
        except Exception as exc:
            raise BiasEngineError(f"Column '{column_name}' must be binary (0/1)") from exc

        unique = set(np.unique(numeric.dropna()))
        if not unique.issubset({0, 1}):
            # Accept any non-zero as 1
            numeric = (numeric > 0).astype(int)

        return numeric.astype(int)

    def _demographic_parity(
        self, df: pd.DataFrame, sensitive_attribute: str, prediction_column: str
    ) -> BiasMetricResult:
        # Selection rate: P(ŷ=1|A=a)
        rates = (
            df.groupby(sensitive_attribute)[prediction_column]
            .mean()
            .to_dict()
        )
        by_group = {str(k): float(v) for k, v in rates.items()}
        values = list(by_group.values())
        difference = float(np.max(values) - np.min(values))
        return BiasMetricResult(by_group=by_group, difference=difference)

    def _equal_opportunity(
        self,
        df: pd.DataFrame,
        sensitive_attribute: str,
        target_column: str,
        prediction_column: str,
    ) -> BiasMetricResult:
        # True Positive Rate: P(ŷ=1|Y=1,A=a)
        df_pos = df[df[target_column] == 1]
        if df_pos.empty:
            raise BiasEngineError("Equal opportunity undefined: no positive samples in target")

        rates = (
            df_pos.groupby(sensitive_attribute)[prediction_column]
            .mean()
            .to_dict()
        )

        # Edge case: some groups may have 0 positives
        by_group: dict[str, float] = {}
        for group, value in rates.items():
            by_group[str(group)] = float(value)

        if len(by_group) < 2:
            raise BiasEngineError(
                "Equal opportunity undefined: need >=2 groups with positive samples"
            )

        values = list(by_group.values())
        difference = float(np.max(values) - np.min(values))
        return BiasMetricResult(by_group=by_group, difference=difference)

    def _disparate_impact(
        self, df: pd.DataFrame, sensitive_attribute: str, prediction_column: str
    ) -> DisparateImpactResult:
        # Disparate Impact Ratio relative to the group with highest selection rate
        rates = (
            df.groupby(sensitive_attribute)[prediction_column]
            .mean()
            .to_dict()
        )
        by_group = {str(k): float(v) for k, v in rates.items()}

        ref_group = max(by_group, key=lambda k: by_group[k])
        ref_rate = by_group[ref_group]

        ratios: dict[str, float] = {}
        for group, rate in by_group.items():
            if ref_rate == 0:
                ratios[group] = float("nan")
            else:
                ratios[group] = float(rate / ref_rate)

        finite_ratios = [v for v in ratios.values() if np.isfinite(v)]
        min_ratio = float(np.min(finite_ratios)) if finite_ratios else float("nan")

        return DisparateImpactResult(
            by_group=by_group,
            reference_group=ref_group,
            ratios=ratios,
            min_ratio=min_ratio,
        )
