import type { PresetState } from '@/lib/prompt-data';

export function encodePreset(data: PresetState): string {
  if (typeof window === 'undefined') return '';
  const raw = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodePreset(value: string): PresetState | null {
  if (typeof window === 'undefined') return null;
  try {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json) as PresetState;
  } catch {
    return null;
  }
}
