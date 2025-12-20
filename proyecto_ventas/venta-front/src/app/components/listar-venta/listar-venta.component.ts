import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../services/ventasservices';
import { Venta } from '../../models/ventasinterface';

@Component({
    selector: 'app-listar-venta',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './listar-venta.component.html',
    styleUrl: './listar-venta.component.css'
})
export class ListarVentaComponent implements OnInit {
    ventas: Venta[] = [];
    loading: boolean = true;
    error: string | null = null;

    constructor(private readonly ventaService: VentaService) { }

    ngOnInit(): void {
        this.cargarVentas();
    }

    cargarVentas(): void {
        this.loading = true;
        this.ventaService.obtenerVentas().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.ventas = response.data;
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
}
