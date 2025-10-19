import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  hide = true;
  loading = false;
  form: any;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private sb: MatSnackBar) {
    this.form = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['OPERADOR']
    });
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) return;
    if (this.f.password.value !== this.f.confirmPassword.value) {
      this.sb.open('Las contraseñas no coinciden.', 'Cerrar', { duration: 2500 });
      return;
    }
    const payload = {
      nombreUsuario: this.f.nombreUsuario.value!.trim(),
      password: this.f.password.value!,
      roles: this.f.rol.value ? [this.f.rol.value!] : undefined
    };
    this.loading = true;
    this.auth.registro(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: '1' }});
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.status === 409 ? 'El nombre de usuario ya existe.' : err?.error?.message || 'No se pudo completar el registro. Inténtalo de nuevo.';
        this.sb.open(msg, 'Cerrar', { duration: 2500 });
      }
    });
  }
}