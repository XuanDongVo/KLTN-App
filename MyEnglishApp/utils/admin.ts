import { BackendMedia } from '@/types/backendCurriculum';

export function isVersionCode(value: string): boolean {
  const code = value.trim();
  return /^[A-Z0-9][A-Z0-9._-]{2,79}$/.test(code) && !code.startsWith('NEW_') && !code.includes('DRAFT');
}

export function versionCodeError(value: string): string | undefined {
  const code = value.trim();
  if (!code) return 'Mã phiên bản là bắt buộc.';
  if (code.includes('DRAFT')) return 'Đây là mã tạm của bản nháp. Hãy đổi thành mã phát hành, ví dụ STARTERS_2026.6.';
  if (code.startsWith('NEW_')) return 'Không được dùng mã bắt đầu bằng NEW_.';
  if (!isVersionCode(code)) return 'Chỉ dùng chữ in hoa, số, dấu chấm, gạch ngang hoặc gạch dưới.';
  return undefined;
}

export function isContentCode(value: string): boolean {
  const code = value.trim();
  return /^[A-Z0-9][A-Z0-9_-]{2,99}$/.test(code) && !code.startsWith('NEW_');
}

export function contentCodeError(value: string): string | undefined {
  const code = value.trim();
  if (!code) return 'Mã là bắt buộc.';
  if (code.startsWith('NEW_')) return 'Mã NEW_* là dữ liệu mẫu cũ. Hãy đổi sang mã thật trước khi lưu.';
  if (!isContentCode(code)) return 'Chỉ dùng chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.';
  return undefined;
}

export function isPositiveNumber(value: string): boolean {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number > 0;
}

export function isNonNegativeNumber(value: string): boolean {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number >= 0;
}

export function isValidMedia(media: BackendMedia): boolean {
  return Boolean(media.path.trim() && media.alt.trim() && media.width > 0 && media.height > 0);
}

export function arrayObjects(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

export function arrayStrings(value: unknown): string[] { 
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; 
}

export function recordOf(value: unknown): Record<string, unknown> { 
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; 
}

export function stringOf(value: unknown): string { 
  return typeof value === 'string' ? value : ''; 
}

export function messageOf(reason: unknown): string { 
  return reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'; 
}

export function defaultMedia(): BackendMedia {
  return { path: '', width: 0, height: 0, alt: '' };
}
