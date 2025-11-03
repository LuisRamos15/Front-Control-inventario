import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosRoutingModule } from './usuarios-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, UsuariosRoutingModule]
})
export class UsuariosModule {}