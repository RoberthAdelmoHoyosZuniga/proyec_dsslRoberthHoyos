import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/ventasservices';
import { Venta } from '../../models/ventasinterface';

@Component({
    selector: 'app-listar-venta',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './listar-venta.component.html',
    styleUrl: './listar-venta.component.css'
})
export class ListarVentaComponent implements OnInit {
    ventas: Venta[] = [];
    loading: boolean = true;
    error: string | null = null;
    fechaFiltro: string = '';
    totalVentasDia: number = 0;
    totalProductosDia: number = 0;

    constructor(private readonly ventaService: VentaService) { }

    ngOnInit(): void {
        this.cargarVentas();
    }

    cargarVentas(): void {
        this.loading = true;
        this.error = null;
        this.ventaService.obtenerVentas().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.ventas = response.data;
                    this.totalVentasDia = this.ventas.reduce((acc, v) => acc + Number(v.total), 0);
                    this.totalProductosDia = this.ventas.reduce((acc, v) => acc + (v.total_productos || 0), 0);
                } else {
                    this.error = response.mensaje || 'Error al cargar el historial de ventas';
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Ocurrió un error al conectar con el servidor';
                this.loading = false;
                console.error(err);
            }
        });
    }

    filtrarPorFecha(): void {
        if (!this.fechaFiltro) {
            this.cargarVentas();
            return;
        }

        this.loading = true;
        this.error = null;
        this.ventaService.obtenerVentasPorFecha(this.fechaFiltro, this.fechaFiltro).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.ventas = response.data;
                    this.totalVentasDia = response.totalVentas ? Number(response.totalVentas) : 0;
                    this.totalProductosDia = response.totalCantidad ? Number(response.totalCantidad) : 0;
                } else {
                    this.error = response.mensaje || 'No hay ventas para la fecha seleccionada';
                    this.ventas = [];
                    this.totalVentasDia = 0;
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Ocurrió un error al filtrar por fecha';
                this.loading = false;
                console.error(err);
            }
        });
    }

    limpiarFiltro(): void {
        this.fechaFiltro = '';
        this.cargarVentas();
    }
}
