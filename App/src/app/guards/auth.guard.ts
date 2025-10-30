import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Opcional: Comprobar roles específicos si es necesario
    const requiredRole = route.data['role'] as string;
    if (requiredRole && !authService.hasRole(requiredRole)) {
      console.warn('Usuario no tiene el rol requerido:', requiredRole);
      return router.createUrlTree(['/']);
    }

    return true;
  }

  // Si no está autenticado, redirigir al login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
