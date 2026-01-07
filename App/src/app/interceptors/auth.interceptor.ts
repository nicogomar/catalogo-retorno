import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const token = this.authService.getAccessToken();

    // Only add token to protected routes (not public routes like /productos, /pedidos)
    const isProtectedRoute = this.isProtectedRoute(request.url);

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    if (token && isProtectedRoute) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Send cloned request with header to the next handler.
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && isProtectedRoute) {
          // Solo hacer logout si es un error de autenticación en rutas críticas
          // No hacer logout automático en operaciones de actualización para evitar interrupciones
          const isAuthRoute = request.url.includes("/auth/");
          const isUpdateOperation =
            request.method === "PATCH" || request.method === "PUT";

          if (isAuthRoute || !isUpdateOperation) {
            // Token expired or invalid en rutas de autenticación, redirect to login
            this.authService.logout();
            this.router.navigate(["/login"]);
          } else {
            // Para operaciones de actualización, solo propagar el error sin logout
            console.warn(
              "Error 401 en operación de actualización. Verifique su sesión.",
            );
          }
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Determine if a route requires authentication
   */
  private isProtectedRoute(url: string): boolean {
    // Public routes that don't need authentication
    const publicRoutes = [
      "/productos", 
      "/auth/login", 
      "/auth/register",
      "/storage/url",
      "/storage/info"
    ];

    // Check if the URL contains any public route
    return !publicRoutes.some((route) => url.includes(route));
  }
}
