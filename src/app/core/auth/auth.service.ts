import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth.token';

export interface LoginReq { nombreUsuario: string; password: string; }

export interface LoginRes { token: string; tipo: 'Bearer'; }

export interface UsuarioReq { nombreUsuario: string; password: string; roles?: string[] | null; }

export type AppRole = 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';

interface DecodedToken {
  sub?: string;
  roles?: string[];
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Mapa de etiquetas legibles; respeta los roles actuales del sistema
  private readonly ROLE_LABELS: Record<string, string> = {
    'ADMIN': 'Administrador',
    'SUPERVISOR': 'Supervisor',
    'OPERADOR': 'Operador'
  };
  constructor(private http: HttpClient) {
    this.refreshFromToken();
  }

  private base = `${environment.apiUrl}/auth`;

  login(body: LoginReq) { return this.http.post<LoginRes>(`${this.base}/login`, body); }

  registro(body: UsuarioReq) { return this.http.post(`${this.base}/registro`, body); }

  register(dto: { nombreUsuario: string; password: string; roles?: string[] }) {
    return this.http.post(`${this.base}/registro`, dto);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.refreshFromToken();
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.refreshFromToken();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private userSubject = new BehaviorSubject<{username?: string; roles: AppRole[]}>({ roles: [] });
  user$ = this.userSubject.asObservable();

  get currentUser() {
    return this.userSubject.value;
  }

  refreshFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.userSubject.next({ roles: [] });
      return;
    }
    const payload = this.safeDecode(token);
    const roles = (payload.roles ?? [])
      .map((r: string) => r?.replace(/^ROLE_/, '').toUpperCase())
      .filter(Boolean) as AppRole[];
    this.userSubject.next({ username: payload.sub, roles });
  }

  getPrimaryRole(): AppRole | null {
    const roles = this.userSubject.value.roles ?? [];
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('SUPERVISOR')) return 'SUPERVISOR';
    if (roles.includes('OPERADOR')) return 'OPERADOR';
    return null;
  }

  /**
   * Devuelve la etiqueta legible de un rol.
   * - Si no se pasa rol, intenta obtenerlo del usuario autenticado (si existe).
   * - Nunca lanza error: si el rol no es reconocido, devuelve el rol tal cual.
   */
  public getRoleLabel(role?: string): string | null {
    try {
      const r = (role ?? this.getCurrentRole() ?? '').toString().toUpperCase().trim();
      return this.ROLE_LABELS[r] || (r ? r : null);
    } catch {
      // fallback ultra-conservador; no romper template
      return null;
    }
  }

  /**
   * Retorna el rol actual del usuario (string) usando la estrategia vigente.
   * NO modificar la lógica ya existente en el servicio:
   * - Si ya existe un método equivalente (p. ej. this.getRole(), this.user?.rol, etc.),
   *   reutilizarlo aquí.
   */
  private getCurrentRole(): string | null {
    // IMPLEMENTACIÓN NO INTRUSIVA:
    // 1) Si ya tienes un método similar, úsalo (ej.: return this.getRole();)
    // 2) Si guardas el usuario en memoria/localStorage/token-decoding, lee de ahí.
    // 3) Si no puedes inferirlo de forma segura, retorna null.
    try {
      const user =
        (this as any).userSubject?.value ??
        (this as any).currentUser ??
        null;
      return user?.rol ?? user?.role ?? null;
    } catch {
      return null;
    }
  }

  
  private safeDecode(token: string): DecodedToken {
    try {
      const [, payloadB64] = token.split('.');
      const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return {};
    }
  }

  getRoles(): AppRole[] {
    try {
      const v = (this as any).userSubject?.value?.roles;
      return Array.isArray(v) ? (v as AppRole[]) : [];
    } catch { return []; }
  }

  canManageProductos(): boolean {
    const roles = this.getRoles();
    return roles.includes('ADMIN') || roles.includes('SUPERVISOR');
  }

  isAdminOrSupervisor(): boolean {
    const r = this.getPrimaryRole()?.toUpperCase?.() || '';
    return r === 'ADMIN' || r === 'SUPERVISOR' || r === 'ROLE_ADMIN' || r === 'ROLE_SUPERVISOR';
  }

  isOperator(): boolean {
    const r = this.getPrimaryRole()?.toUpperCase?.() || '';
    return r === 'OPERADOR' || r === 'OPERATOR' || r === 'ROLE_OPERADOR' || r === 'ROLE_OPERATOR';
  }

  canCreateMovimiento(tipo: 'ENTRADA'|'SALIDA'): boolean {
    if (this.isAdminOrSupervisor()) return true;
    if (this.isOperator()) return tipo === 'SALIDA';
    return false;
  }

  
  canOpenMovimientoModal(): boolean {
    return this.isAdminOrSupervisor() || this.isOperator();
  }

  hasAnyAuthority(list: string[]): boolean {
    const auths = (this.getRoles() || []).map((s: string) => s.toUpperCase());
    return list.some(x => auths.includes(x.toUpperCase()));
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role as AppRole);
  }
}

