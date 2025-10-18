import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface LoginReq { nombreUsuario: string; password: string; }

export interface LoginRes { token: string; tipo: 'Bearer'; }

export interface UsuarioReq { nombreUsuario: string; password: string; roles?: string[] | null; }

import { jwtDecode } from 'jwt-decode';

type JwtPayload = { sub: string; roles?: string[]; exp: number; };

const TOKEN_KEY = 'invpro_token';

@Injectable({ providedIn: 'root' })

export class AuthService {

private base = '/api/auth';

constructor(private http: HttpClient) {}

login(body: LoginReq) { return this.http.post<LoginRes>(`${this.base}/login`, body); }

registro(body: UsuarioReq) { return this.http.post(`${this.base}/registro`, body); }

saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }

logout() { localStorage.removeItem(TOKEN_KEY); }

get token() { return localStorage.getItem(TOKEN_KEY); }

get isLoggedIn(): boolean {

const t = this.token; if (!t) return false;

try { return (jwtDecode<JwtPayload>(t).exp * 1000) > Date.now(); } catch { return false; }

}

get roles(): string[] {

const t = this.token; if (!t) return [];

try { return jwtDecode<JwtPayload>(t).roles ?? []; } catch { return []; }

}

}