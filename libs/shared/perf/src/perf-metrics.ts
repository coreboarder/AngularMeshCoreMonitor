export interface PerfMetrics {
  fps: number;
  eventRate: number;
  renderLatencyMs: number;
  endToEndLatencyMs: number;
}

export const defaultPerfMetrics: PerfMetrics = {
  fps: 60,
  eventRate: 0,
  renderLatencyMs: 0,
  endToEndLatencyMs: 0,
};
