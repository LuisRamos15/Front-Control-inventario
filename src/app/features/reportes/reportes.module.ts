import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReportesPageComponent } from './reportes-page/reportes-page.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: ReportesPageComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReportesPageComponent
  ]
})
export class ReportesModule {}