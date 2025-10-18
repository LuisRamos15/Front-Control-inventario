export function humanizeAuthMessage(err: any): string {
  const raw = err?.error?.message || err?.error?.error || err?.message || '';
  if (/bad credentials/i.test(raw)) return 'Contraseña incorrecta';
  if (/usuario.*no.*encontrado/i.test(raw) || /user.*not.*found/i.test(raw)) return 'Usuario no encontrado';
  return raw || 'Error de autenticación';
}