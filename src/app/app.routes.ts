import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DriveComponent } from './components/drive/drive.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'drive', component: DriveComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'drive', pathMatch: 'full' },
  { path: '**', redirectTo: 'drive' },
];
