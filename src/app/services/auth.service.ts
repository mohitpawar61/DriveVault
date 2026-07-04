import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

/**
 * ⚠️ PLACEHOLDER SERVICE
 * There is no auth microservice in the DriveVault backend yet
 * (only GoogleDrive / folder-service / Search-service exist).
 * This mocks login/register locally (in memory + localStorage flag)
 * so the rest of the app has something to gate on.
 *
 * When you build a real auth-service, replace the two methods below
 * with real HttpClient calls, e.g.:
 *   POST {authApiUrl}/register -> { name, email, password }
 *   POST {authApiUrl}/login    -> { email, password } -> { token }
 * and store the returned token instead of the boolean flag.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'drivevault_mock_session';
  isLoggedIn = signal<boolean>(this.readSession());

  login(email: string, _password: string): Observable<{ success: boolean; error?: string }> {
    if (!email) {
      return of({ success: false, error: 'Email is required.' }).pipe(delay(300));
    }
    localStorage.setItem(this.STORAGE_KEY, email);
    this.isLoggedIn.set(true);
    return of({ success: true }).pipe(delay(300));
  }

  register(name: string, email: string, _password: string): Observable<{ success: boolean; error?: string }> {
    if (!name || !email) {
      return of({ success: false, error: 'Name and email are required.' }).pipe(delay(300));
    }
    localStorage.setItem(this.STORAGE_KEY, email);
    this.isLoggedIn.set(true);
    return of({ success: true }).pipe(delay(300));
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.isLoggedIn.set(false);
  }

  private readSession(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }
}
