import { Component, OnInit } from '@angular/core';
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

import { UsuarioReq } from '../../../../shared/models/auth.models';

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

nombreUsuario: ['', Validators.required],

password: ['', [Validators.required, Validators.minLength(8)]],

rol: ['OPERADOR'] // default visible, opcional

});

}



  submit() {
    if (this.form.invalid) return;
    this.loading = true;
     const rol = this.form.value.rol as string | null;
     const body: UsuarioReq = {
       nombreUsuario: this.form.value.nombreUsuario!,
       password: this.form.value.password!,
       roles: rol ? [rol] : null // el backend recibe Set<Rol>, aquí va array de strings
     };
     this.auth.registro(body).subscribe({
       next: () => this.router.navigateByUrl('/login'),
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo registrar';
        this.sb.open(msg, 'Cerrar', { duration: 2500 });
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}