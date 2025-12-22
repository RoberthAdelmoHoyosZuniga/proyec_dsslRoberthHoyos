import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/clienteservices';
import { Cliente } from '../../models/clienteinterface';

@Component({
    selector: 'app-cliente-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './cliente-form.component.html',
    styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
    clienteForm!: FormGroup;
    successMessage: string = '';
    error: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private clienteService: ClienteService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.clienteForm = this.fb.group({
            nombre: ['', [Validators.required]],
            apellido: ['', [Validators.required]],
            dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
            telefono: [''],
            correo: ['', [Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.clienteForm.valid) {
            const nuevoCliente: Cliente = this.clienteForm.value;

            this.clienteService.crearCliente(nuevoCliente).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.successMessage = 'Cliente registrado exitosamente';
                        setTimeout(() => {
                            this.router.navigate(['/ventas/nuevo']);
                        }, 2000);
                    } else {
                        this.error = response.mensaje || 'Error al registrar el cliente';
                    }
                },
                error: (err) => {
                    console.error('Error al crear cliente:', err);
                    this.error = err.error?.mensaje || 'Ocurrió un error en el servidor';
                }
            });
        } else {
            this.error = 'Por favor complete todos los campos requeridos correctamente';
        }
    }

    cancelar(): void {
        this.router.navigate(['/ventas/nuevo']);
    }
}
