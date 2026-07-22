/**
 * Signal-aware notability.
 *
 * A feature is considered notable for a given selection if:
 *  - feature.notable === true, AND
 *  - at least two of the selected insurers have different `signal` values.
 *
 * If a selected insurer has no signal (missing), that counts as "differs from
 * everything else" so the row still surfaces (better safe than hidden).
 */

export function signalDiffers(feature, selectedInsurers, lookup) {
  if (!feature?.notable) return false;
  const signals = selectedInsurers.map((ins) => {
    const entry = lookup[ins.id]?.[feature.feature];
    return entry?.signal ?? `__missing_${ins.id}`;
  });
  const first = signals[0];
  return signals.some((s) => s !== first);
}

export function isNotableForSelection(feature, selectedInsurers, lookup) {
  return !!feature?.notable && signalDiffers(feature, selectedInsurers, lookup);
}

export function countNotableForSelection(features, selectedInsurers, lookup) {
  return features.filter((f) =>
    isNotableForSelection(f, selectedInsurers, lookup),
  ).length;
}
