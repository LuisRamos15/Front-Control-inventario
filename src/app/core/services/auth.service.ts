import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LoginReq { nombreUsuario: string; password: string; }

export interface LoginRes { token: string; tipo: 'Bearer'; }

export interface UsuarioReq { nombreUsuario: string; password: string; roles?: string[] | null; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'token';

  constructor(private http: HttpClient) {}

  private base = '/api/auth';

  login(body: LoginReq) { return this.http.post<LoginRes>(`${this.base}/login`, body); }

  registro(body: UsuarioReq) { return this.http.post(`${this.base}/registro`, body); }

  getToken(): string | null {
    const t = localStorage.getItem(this.KEY);
    // Rechaza falsos positivos (ej: "true", "1", "ok")
    if (!t || t.length < 20 || !t.includes('.')) return null; // los JWT tienen puntos
    return t;
  }

  setToken(token: string) {
    localStorage.setItem(this.KEY, token);
  }

  clearToken() {
    localStorage.removeItem(this.KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Mantén compatibilidad con código existente
  get token() { return this.getToken(); }
  saveToken(t: string) { this.setToken(t); }
  logout() { this.clearToken(); }

  // Mantén isLoggedIn y roles si se usan
  get isLoggedIn(): boolean {
    const t = this.getToken();
    if (!t) return false;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return (payload.exp * 1000) > Date.now();
    } catch { return false; }
  }

  get roles(): string[] {
    const t = this.getToken();
    if (!t) return [];
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.roles ?? [];
    } catch { return []; }
  }
}