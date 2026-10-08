import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { TOKEN_KEY } from './auth.interceptor';
import type { User } from './models';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = '/api/auth';

  /** Signals: reactividad sin RxJS boilerplate */
  readonly user = signal<User | null>(null);
  readonly ready = signal(false);

  readonly loggedIn = () => !!localStorage.getItem(TOKEN_KEY);

  constructor(private http: HttpClient, private router: Router) {
    if (this.loggedIn()) {
      this.me().subscribe({
        next: () => this.ready.set(true),
        error: () => {
          this.logout(false);
          this.ready.set(true);
        },
      });
    } else {
      this.ready.set(true);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap((r) => this.persist(r)));
  }

  register(email: string, password: string, displayName?: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, { email, password, displayName })
      .pipe(tap((r) => this.persist(r)));
  }

  me() {
    return this.http
      .get<{ user: User }>(`${this.base}/me`)
      .pipe(tap((r) => this.user.set(r.user)));
  }

  logout(redirect = true) {
    localStorage.removeItem(TOKEN_KEY);
    this.user.set(null);
    if (redirect) this.router.navigate(['/auth']);
  }

  private persist(r: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, r.token);
    this.user.set(r.user);
  }
}
