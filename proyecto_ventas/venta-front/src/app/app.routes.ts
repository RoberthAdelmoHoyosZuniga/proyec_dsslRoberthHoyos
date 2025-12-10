import { Routes } from '@angular/router';

// Importar componentes
import { ListarProductoComponent } from './components/listar-producto/listar-producto.component';
import { VentaFormComponent } from './components/venta-form/venta-form.component';

export const routes: Routes = [
  // Ruta raíz - redirige a productos
  { path: '', redirectTo: '/productos', pathMatch: 'full' },

  // Rutas de Productos
  { path: 'productos', component: ListarProductoComponent },

  // Rutas de Ventas
  { path: 'ventas/nuevo', component: VentaFormComponent },

  // Ruta wildcard - redirige a productos si la ruta no existe
  { path: '**', redirectTo: '/productos' }
];