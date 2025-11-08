import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private api = `${environment.apiBase}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  editar(id: string, body: any): Observable<any> {
    return this.http.patch(`${this.api}/${id}`, body);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  patchUsuario(id: string, body: any): Observable<any> {
    return this.http.patch(`${this.api}/${id}`, body);
  }
}