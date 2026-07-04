import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  mode = signal<'login' | 'register'>('login');
  name = '';
  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(null);
  }

  submit(): void {
    this.error.set(null);
    this.loading.set(true);
    const req$ =
      this.mode() === 'login'
        ? this.auth.login(this.email, this.password)
        : this.auth.register(this.name, this.email, this.password);

    req$.subscribe((res) => {
      this.loading.set(false);
      if (res.success) {
        this.router.navigate(['/drive']);
      } else {
        this.error.set(res.error ?? 'Something went wrong.');
      }
    });
  }
}
