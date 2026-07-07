/**
 * Dynamic Axis Scaling Utility
 * 
 * Calculates nice Y-axis domain and tick values with automatic step-size
 * that always leaves a buffer gap above the max data value.
 * 
 * Example: if max value is 90 → domain [0, 100] with ticks every 10
 *          if max value is 1500 → domain [0, 1600] with ticks every 200
 */

/**
 * Compute a "nice" step size for gridlines given the data range.
 * Returns a power-of-10 multiple (1, 2, 5, 10, 20, 50, 100, 200, 500, ...).
 */
function niceStep(range: number, targetTicks: number = 6): number {
  if (range <= 0) return 1;
  const roughStep = range / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceResidual: number;
  if (residual <= 1.5) niceResidual = 1;
  else if (residual <= 3) niceResidual = 2;
  else if (residual <= 7) niceResidual = 5;
  else niceResidual = 10;

  return Math.max(1, niceResidual * magnitude);
}

export interface AxisConfig {
  /** Domain [min, max] for the axis */
  domain: [number, number];
  /** Exact tick positions */
  ticks: number[];
}

/**
 * Calculate dynamic axis domain and ticks for a dataset.
 * 
 * @param values - Array of numeric data values
 * @param minFloor - Minimum lower bound (default 0)
 * @param targetTicks - Approximate number of gridlines desired (default 6)
 * @returns AxisConfig with domain and ticks arrays
 */
export function dynamicAxis(
  values: number[],
  minFloor: number = 0,
  targetTicks: number = 6
): AxisConfig {
  if (!values.length || values.every(v => v === 0)) {
    return { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] };
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const range = dataMax - Math.max(dataMin, minFloor);

  let step = niceStep(range || dataMax || 10, targetTicks);

  const axisMin = Math.max(minFloor, Math.floor(dataMin / step) * step);
  // Always leave at least one step of buffer above the max value
  let axisMax = Math.ceil((dataMax + step * 0.1) / step) * step;

  // Enforce a minimum realistic top-end (e.g. 10) so small charts don't look broken
  if (axisMax < 10) {
    axisMax = 10;
    step = 2; // Nice step for 10
  }

  const ticks: number[] = [];
  for (let v = axisMin; v <= axisMax; v += step) {
    ticks.push(Math.round(v * 1000) / 1000); // avoid floating point artifacts
  }

  return { domain: [axisMin, axisMax], ticks };
}

/**
 * Helper to extract numeric values from a data array by key.
 */
export function extractValues<T>(data: T[], key: keyof T): number[] {
  return data.map(d => {
    const v = d[key];
    return typeof v === 'number' ? v : 0;
  });
}
