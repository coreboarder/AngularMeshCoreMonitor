export type BootstrapColorMode = 'light' | 'dark' | 'diagnostic';

export interface BootstrapThemeTokens {
  mode: BootstrapColorMode;
  surface: string;
  surfaceAlt: string;
  text: string;
  accent: string;
  warning: string;
  critical: string;
  success: string;
}

export function createBootstrapThemeTokens(mode: BootstrapColorMode): BootstrapThemeTokens {
  if (mode === 'dark') {
    return {
      mode,
      surface: '#10141b',
      surfaceAlt: '#171d27',
      text: '#edf2ff',
      accent: '#66e3ff',
      warning: '#ffcc66',
      critical: '#ff6b7a',
      success: '#75f29d',
    };
  }

  if (mode === 'diagnostic') {
    return {
      mode,
      surface: '#08111a',
      surfaceAlt: '#102235',
      text: '#d8f6ff',
      accent: '#72ff9e',
      warning: '#ffd36e',
      critical: '#ff7f8d',
      success: '#72ff9e',
    };
  }

  return {
    mode: 'light',
    surface: '#f7f9fc',
    surfaceAlt: '#ffffff',
    text: '#18202d',
    accent: '#0d6efd',
    warning: '#f0ad4e',
    critical: '#dc3545',
    success: '#198754',
  };
}
