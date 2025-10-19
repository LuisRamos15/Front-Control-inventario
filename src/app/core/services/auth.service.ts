import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'auth.token';

export interface LoginReq { nombreUsuario: string; password: string; }

export interface LoginRes { token: string; tipo: 'Bearer'; }

export interface UsuarioReq { nombreUsuario: string; password: string; roles?: string[] | null; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  private base = '/api/auth';

  login(body: LoginReq) { return this.http.post<LoginRes>(`${this.base}/login`, body); }

  registro(body: UsuarioReq) { return this.http.post(`${this.base}/registro`, body); }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}