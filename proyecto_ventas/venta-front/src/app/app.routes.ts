import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

// Importar componentes
import { ListarProductoComponent } from './components/listar-producto/listar-producto.component';
import { VentaFormComponent } from './components/venta-form/venta-form.component';
import { ListarVentaComponent } from './components/listar-venta/listar-venta.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { LoginComponent } from './auth/login/login.component';
import { ClienteFormComponent } from './components/cliente-form/cliente-form.component';

export const routes: Routes = [
  // Ruta de Login
  { path: 'auth/login', component: LoginComponent },

  // Ruta raíz - redirige a productos
  { path: '', redirectTo: '/productos', pathMatch: 'full' },

  // Rutas de Productos
  {
    path: 'productos',
    component: ListarProductoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'productos/nuevo',
    component: ProductoFormComponent,
    canActivate: [authGuard]
  },

  // Rutas de Ventas
  {
    path: 'clientes/nuevo',
    component: ClienteFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ventas',
    component: ListarVentaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ventas/nuevo',
    component: VentaFormComponent,
    canActivate: [authGuard]
  },

  // Ruta wildcard - redirige a productos si la ruta no existe
  { path: '**', redirectTo: '/productos' }
];