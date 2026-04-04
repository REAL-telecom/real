export function sanitizePhone(value: string): string {
  let digits = value.replace(/[^0-9]/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function sanitizePin(value: string): string {
  return value.replace(/[^0-9]/g, '').slice(0, 5);
}
