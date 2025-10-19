import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

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
}