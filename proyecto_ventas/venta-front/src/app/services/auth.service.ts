import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, of } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.interface';
import { Usuario } from '../models/usuariointerface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly apiUrl = 'http://localhost:3000/api/auth';

    constructor() { }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.success && response.token && isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('usuario', JSON.stringify(response.usuario));
                }
            })
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem('token');
        }
        return false;
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }
        return null;
    }

    getUsuario(): Usuario | null {
        if (isPlatformBrowser(this.platformId)) {
            const usuario = localStorage.getItem('usuario');
            return usuario ? JSON.parse(usuario) : null;
        }
        return null;
    }
}
