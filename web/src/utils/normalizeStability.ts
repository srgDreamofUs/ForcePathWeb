/**
 * Normalizes the stability score based on height.
 * Formula:
 * raw = current_height
 * inverse = 1 / (raw + 1)
 * scaled = inverse * 2000
 * clamped = min(max(scaled, 0), 1)
 * 
 * Lower height -> Higher stability
 */
export function normalizeStability(rawHeight: number): number {
  const inverse = 1 / (rawHeight + 1);
  const scaled = inverse * 2000;
  const clamped = Math.min(Math.max(scaled, 0), 1);
  return clamped;
}
