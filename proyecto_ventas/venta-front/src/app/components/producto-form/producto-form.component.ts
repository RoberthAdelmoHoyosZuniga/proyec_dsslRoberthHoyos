import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/productoservices';
import { CategoriaService } from '../../services/categoriaservice';
import { Categoria } from '../../models/categoriainterface';
import { Producto } from '../../models/productointerface';

@Component({
    selector: 'app-producto-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './producto-form.component.html',
    styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent implements OnInit {
    productoForm!: FormGroup;
    categorias: Categoria[] = [];
    successMessage: string = '';
    error: string = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly productoService: ProductoService,
        private readonly categoriaService: CategoriaService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.cargarCategorias();
    }

    initForm(): void {
        this.productoForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3)]],
            precio: [0, [Validators.required, Validators.min(0.01)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            id_categoria: ['', Validators.required]
        });
    }

    cargarCategorias(): void {
        this.categoriaService.obtenerCategorias().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.categorias = response.data;
                }
            },
            error: (err) => {
                console.error('Error al cargar categorías:', err);
                this.error = 'No se pudieron cargar las categorías';
            }
        });
    }

    onSubmit(): void {
        if (this.productoForm.valid) {
            const nuevoProducto: Producto = this.productoForm.value;

            this.productoService.crearProducto(nuevoProducto).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.successMessage = 'Producto registrado exitosamente';
                        setTimeout(() => {
                            this.router.navigate(['/productos']);
                        }, 2000);
                    } else {
                        this.error = response.mensaje || 'Error al registrar el producto';
                    }
                },
                error: (err) => {
                    console.error('Error al crear producto:', err);
                    this.error = 'Ocurrió un error en el servidor';
                }
            });
        } else {
            this.error = 'Por favor complete el formulario correctamente';
            this.marcarCamposComoTocados();
        }
    }

    marcarCamposComoTocados(): void {
        Object.values(this.productoForm.controls).forEach(control => {
            control.markAsTouched();
        });
    }

    cancelar(): void {
        this.router.navigate(['/productos']);
    }
}
