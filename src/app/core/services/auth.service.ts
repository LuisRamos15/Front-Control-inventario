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
  sub?: string;           // username
  roles?: string[];       // viene del backend
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {
    this.refreshFromToken();
  }

  private base = '/api/auth';

  login(body: LoginReq) { return this.http.post<LoginRes>(`${this.base}/login`, body); }

  registro(body: UsuarioReq) { return this.http.post(`${this.base}/registro`, body); }

  register(dto: { nombreUsuario: string; password: string; roles?: string[] }) {
    return this.http.post(`${environment.apiUrl}/auth/registro`, dto);
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

  // --- NUEVO: estado observable con username y roles
  private userSubject = new BehaviorSubject<{username?: string; roles: AppRole[]}>({ roles: [] });
  user$ = this.userSubject.asObservable();

  // Llamar a esto cuando guardes/borres token (después de login/logout)
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

  // -----> ADITIVO: rol principal por prioridad (ADMIN > SUPERVISOR > OPERADOR)
  getPrimaryRole(): AppRole | null {
    const roles = this.userSubject.value.roles ?? [];
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('SUPERVISOR')) return 'SUPERVISOR';
    if (roles.includes('OPERADOR')) return 'OPERADOR';
    return null;
  }

  // -----> ADITIVO: etiqueta a mostrar
  getRoleLabel(): 'Admin' | 'Supervisor' | 'Operador' | null {
    const r = this.getPrimaryRole();
    if (r === 'ADMIN') return 'Admin';
    if (r === 'SUPERVISOR') return 'Supervisor';
    if (r === 'OPERADOR') return 'Operador';
    return null;
  }

  // -----> ADITIVO: helper para decodificar JWT sin librerías externas
  private safeDecode(token: string): DecodedToken {
    try {
      const [, payloadB64] = token.split('.');
      const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return {};
    }
  }

  /** Devuelve roles actuales desde el estado ya existente (userSubject). */
  getRoles(): AppRole[] {
    try {
      const v = (this as any).userSubject?.value?.roles;
      return Array.isArray(v) ? (v as AppRole[]) : [];
    } catch { return []; }
  }

  /** ¿Puede gestionar productos? Solo ADMIN o SUPERVISOR. */
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

  /** Operador solo puede SALIDA; Admin/Supervisor: ambos */
  canCreateMovimiento(tipo: 'ENTRADA'|'SALIDA'): boolean {
    if (this.isAdminOrSupervisor()) return true;
    if (this.isOperator()) return tipo === 'SALIDA';
    return false;
  }

  /** Para la UI del botón "Nuevo Movimiento" */
  canOpenMovimientoModal(): boolean {
    return this.isAdminOrSupervisor() || this.isOperator();
  }
}