import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../servicios/usuarios.service';
import { AuthService } from '../../../../core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  usuarios: any[] = [];
  cargando = false;
  filtro = '';
  currentUsername = '';
  editOpen = false;
  saving = false;
  editTarget: any = null;
  editForm: { nombreUsuario: string; rol: string } = { nombreUsuario: '', rol: '' };

  constructor(private usuariosService: UsuariosService, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentUsername = this.auth.currentUser?.username || '';
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.listar().subscribe({
      next: data => { this.usuarios = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  filtrar(): any[] {
    if (!this.filtro.trim()) return this.usuarios;
    return this.usuarios.filter(u =>
      u.nombreUsuario.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  estaEnLinea(u: any): boolean {
    const nombre = (u?.nombreUsuario || '').toString();
    const esSelf = this.currentUsername ? this.currentUsername.toLowerCase() === nombre.toLowerCase() : false;
    const enLinea = u?.enLinea ? true : false;
    return enLinea || esSelf;
  }

  eliminar(usuario: any): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará definitivamente a ${usuario.nombreUsuario}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuariosService.eliminar(usuario.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente.', 'success');
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  openEdit(u: any) {
    this.editTarget = u;
    this.editForm = {
      nombreUsuario: u?.nombreUsuario || '',
      rol: (u?.roles?.[0] || '').toString().toUpperCase()
    };
    this.editOpen = true;
  }

  closeEdit() {
    if (this.saving) return;
    this.editOpen = false;
    this.editTarget = null;
  }

  isEditValid(): boolean {
    if (!this.editForm) return false;
    const nombreOk = !!(this.editForm.nombreUsuario && this.editForm.nombreUsuario.trim().length);
    const rolOk = ['ADMIN','SUPERVISOR','OPERADOR'].includes(this.editForm.rol);
    return nombreOk && rolOk;
  }

  saveEdit() {
    if (!this.editTarget || !this.isEditValid()) return;
    const payload: any = {};
    if (this.editForm.nombreUsuario.trim() !== (this.editTarget.nombreUsuario || '')) {
      payload.nombreUsuario = this.editForm.nombreUsuario.trim();
    }
    const rolActual = (this.editTarget.roles?.[0] || '').toString().toUpperCase();
    if (this.editForm.rol !== rolActual) {
      payload.roles = [this.editForm.rol];
    }
    if (Object.keys(payload).length === 0) {
      this.closeEdit();
      return;
    }
    this.saving = true;
    this.usuariosService.patchUsuario(this.editTarget.id, payload).subscribe({
      next: (updated) => {
        this.saving = false;
        if (payload.nombreUsuario) this.editTarget.nombreUsuario = payload.nombreUsuario;
        if (payload.roles) this.editTarget.roles = payload.roles;
        this.closeEdit();
      },
      error: (err) => {
        this.saving = false;
        alert('No se pudo guardar los cambios');
        console.error(err);
      }
    });
  }
}