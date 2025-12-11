import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetodoPago } from '../../models/metodopagointerface';
import { MetodoPagoService } from '../../services/metodopagoservice';
import { Cliente } from '../../models/clienteinterface';
import { ClienteService } from '../../services/clienteservices';
import { Usuario } from '../../models/usuariointerface';
import { UsuarioService } from '../../services/usuarioservices';
import { Producto } from '../../models/productointerface';
import { ProductoService } from '../../services/productoservices';
import { VentaService } from '../../services/ventasservices';
import { Venta } from '../../models/ventasinterface';


@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Quita RouterLink
  templateUrl: './venta-form.component.html',
  styleUrl: './venta-form.component.css'
})
export class VentaFormComponent implements OnInit {
  ventaForm!: FormGroup;
  clientes: Cliente[] = [];
  usuarios: Usuario[] = [];
  metodosPago: MetodoPago[] = [];
  productos: Producto[] = [];
  successMessage: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private metodoPagoService: MetodoPagoService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private ventaService: VentaService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarMetodosPago();
    this.cargarClientes();
    this.cargarUsuarios();
    this.cargarProductos();
  }

  cargarMetodosPago(): void {
    this.metodoPagoService.obtenerMetodosPago().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.metodosPago = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar metodos de pago:', error);
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.obtenerClientes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productos = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }
  initForm(): void {
    this.ventaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_usuario: ['', Validators.required],
      id_pago: ['', Validators.required],
      total: [0],
      detalles: this.fb.array([])
    });
  }

  get detalles(): FormArray {
    return this.ventaForm.get('detalles') as FormArray;
  }

  agregarDetalle(): void {
    const detalleGroup = this.fb.group({
      id_producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0]
    });
    this.detalles.push(detalleGroup);
  }

  eliminarDetalle(index: number): void {
    this.detalles.removeAt(index);
    this.calcularTotal();
  }

  onProductoChange(index: number): void {
    // Aquí buscarías el precio del producto seleccionado
    const detalle = this.detalles.at(index);
    const idProducto = detalle.get('id_producto')?.value;
    const producto = this.productos.find(p => p.id_producto == idProducto);

    if (producto) {
      detalle.patchValue({ precio_unitario: producto.precio });
      this.calcularTotal();
    }
  }

  onCantidadChange(index: number): void {
    this.calcularTotal();
  }

  calcularTotal(): void {
    let total = 0;
    this.detalles.controls.forEach(detalle => {
      const cantidad = detalle.get('cantidad')?.value || 0;
      const precio = detalle.get('precio_unitario')?.value || 0;
      total += cantidad * precio;
    });
    this.ventaForm.patchValue({ total });
  }

  onSubmit(): void {
    if (this.ventaForm.valid) {
      const formValue = this.ventaForm.value;

      const nuevaVenta: Venta = {
        id_cliente: formValue.id_cliente,
        id_usuario: formValue.id_usuario,
        id_pago: formValue.id_pago,
        total: formValue.total,
        detalles: formValue.detalles.map((d: any) => ({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.cantidad * d.precio_unitario
        }))
      };

      this.ventaService.crearVenta(nuevaVenta).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Venta creada exitosamente';
            this.ventaForm.reset();
            this.detalles.clear();
            this.initForm();
          } else {
            this.error = response.mensaje || 'Error al crear la venta';
          }
        },
        error: (err) => {
          console.error('Error al crear venta:', err);
          this.error = 'Ocurrió un error en el servidor';
        }
      });
    } else {
      this.error = 'Por favor complete todos los campos requeridos';
    }
  }
  cancelar(): void {
    this.router.navigate(['/productos']); // Navega a la lista de productos
  }
}