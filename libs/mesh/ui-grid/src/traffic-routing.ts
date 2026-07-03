export interface GridPoint {
  x: number;
  y: number;
}

export interface RoutedQuadraticCurve {
  control: GridPoint;
  laneOffset: number;
}

function stableHash(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function routeQuadraticCurve(
  source: GridPoint,
  destination: GridPoint,
  routeKey: string,
  laneStep = 1.6,
  laneCount = 7,
): RoutedQuadraticCurve {
  const dx = destination.x - source.x;
  const dy = destination.y - source.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));

  const normalX = -dy / length;
  const normalY = dx / length;
  const laneIndex = (stableHash(routeKey) % laneCount) - Math.floor(laneCount / 2);
  const baseBend = clamp(length * 0.14, 2.4, 11.5);
  const laneOffset = laneIndex * laneStep;
  const bend = baseBend + laneOffset;

  return {
    control: {
      x: (source.x + destination.x) / 2 + normalX * bend,
      y: (source.y + destination.y) / 2 + normalY * bend,
    },
    laneOffset,
  };
}

export function buildQuadraticPath(source: GridPoint, control: GridPoint, destination: GridPoint): string {
  return `M ${source.x.toFixed(2)} ${source.y.toFixed(2)} Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${destination.x.toFixed(2)} ${destination.y.toFixed(2)}`;
}
