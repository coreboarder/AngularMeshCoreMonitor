import { createDashboardModel } from '@mesh/feature-dashboard';
import { createBootstrapThemeTokens } from '@shared/theme';
import { supportedLocales } from '@shared/i18n';
import { defaultPerfMetrics } from '@shared/perf';
import type { MeshNodeTelemetry } from '@mesh/domain-models';

export interface MeshMonitorShellViewModel {
  title: string;
  localeCount: number;
  perf: typeof defaultPerfMetrics;
  theme: ReturnType<typeof createBootstrapThemeTokens>;
  dashboard: ReturnType<typeof createDashboardModel>;
}

export function createMeshMonitorShell(nodes: MeshNodeTelemetry[]): MeshMonitorShellViewModel {
  return {
    title: 'Mesh Monitor',
    localeCount: supportedLocales.length,
    perf: defaultPerfMetrics,
    theme: createBootstrapThemeTokens('diagnostic'),
    dashboard: createDashboardModel(nodes),
  };
}
