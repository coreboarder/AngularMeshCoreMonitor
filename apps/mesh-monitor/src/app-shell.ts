import { createDashboardModel } from '../../../libs/mesh/feature-dashboard/src/index.ts';
import { createBootstrapThemeTokens } from '../../../libs/shared/theme/src/index.ts';
import { supportedLocales } from '../../../libs/shared/i18n/src/index.ts';
import { defaultPerfMetrics } from '../../../libs/shared/perf/src/index.ts';
import type { MeshNodeTelemetry, MeshTrafficPath } from '../../../libs/mesh/domain-models/src/index.ts';

export interface MeshMonitorShellViewModel {
  title: string;
  localeCount: number;
  perf: typeof defaultPerfMetrics;
  theme: ReturnType<typeof createBootstrapThemeTokens>;
  dashboard: ReturnType<typeof createDashboardModel>;
  nodes: MeshNodeTelemetry[];
  paths: MeshTrafficPath[];
}

export function createMeshMonitorShell(nodes: MeshNodeTelemetry[], paths: MeshTrafficPath[] = []): MeshMonitorShellViewModel {
  return {
    title: 'Mesh Monitor',
    localeCount: supportedLocales.length,
    perf: defaultPerfMetrics,
    theme: createBootstrapThemeTokens('diagnostic'),
    dashboard: createDashboardModel(nodes),
    nodes,
    paths,
  };
}

export function createMeshMonitorShellFromSnapshot(nodes: MeshNodeTelemetry[], paths: MeshTrafficPath[] = []): MeshMonitorShellViewModel {
  return createMeshMonitorShell(nodes, paths);
}
