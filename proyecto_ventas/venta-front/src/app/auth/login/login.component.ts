import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.interface';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    credentials: LoginRequest = {
        usuario: '',
        password: ''
    };

    loading = false;
    errorMessage = '';

    onSubmit() {
        if (!this.credentials.usuario || !this.credentials.password) {
            this.errorMessage = 'Por favor, ingrese usuario y contraseña';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.credentials).subscribe({
            next: (res) => {
                if (res.success) {
                    this.router.navigate(['/productos']);
                } else {
                    this.errorMessage = res.mensaje || 'Error en el login';
                }
                this.loading = false;
            },
            error: (err) => {
                this.errorMessage = err.error?.mensaje || 'Error de conexión con el servidor';
                this.loading = false;
            }
        });
    }
}
