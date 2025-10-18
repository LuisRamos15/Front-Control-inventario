import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

import { LoginReq } from '../../../../core/services/auth.service';

import { humanizeAuthMessage } from '../../../../shared/utils/http-errors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

hide = true;

loading = false;

form: any;

constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private sb: MatSnackBar) {

this.form = this.fb.group({

nombreUsuario: ['', Validators.required],

password: ['', [Validators.required, Validators.minLength(8)]],

});

}



  submit() {
    if (this.form.invalid) return;
    this.loading = true;
     this.auth.login(this.form.value as LoginReq).subscribe({
       next: (res) => {
         this.auth.saveToken(res.token);
         this.router.navigateByUrl('/ok');
       },
       error: (err) => {
         const msg = humanizeAuthMessage(err);
         this.sb.open(msg, 'Cerrar', { duration: 2500 });
         this.loading = false;
       },
      complete: () => this.loading = false
    });
  }
}