import { Injectable } from '@angular/core';

const KEY = 'invpro_token';

@Injectable({ providedIn: 'root' })

export class TokenStorage {

set(t: string) { localStorage.setItem(KEY, t); }

get(): string | null { return localStorage.getItem(KEY); }

clear() { localStorage.removeItem(KEY); }

}

