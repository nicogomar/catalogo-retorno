import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError, of } from "rxjs";
import { catchError, map, tap, finalize, delay } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { ApiService } from "./api.service";

export interface User {
  id: string;
  email: string;
  role?: string;
  nombre?: string;
  // Backend specific fields
  correo_electronico?: string;
  usuario?: string;
  rol?: string;
  clave?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    expires_at: number;
    refresh_token: string;
  };
}

export interface AuthApiResponse {
  success: boolean;
  data: AuthResponse;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl: string = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenExpiryTimer: any;

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService,
  ) {
    this.loadUserFromStorage();

    // Exponer funciones de diagnóstico globalmente
    if (window) {
      (window as any).testLogin = this.testLogin.bind(this);
      (window as any).createTestUser = this.createTestUser.bind(this);
      (window as any).diagnoseAuth = this.diagnoseAuth.bind(this);
    }
  }

  /**
   * Carga el usuario desde el localStorage al iniciar el servicio
   */
  private loadUserFromStorage() {
    const userStr = localStorage.getItem("currentUser");
    const token = localStorage.getItem("accessToken");
    const expiresAtStr = localStorage.getItem("tokenExpiry");
    const refreshToken = localStorage.getItem("refreshToken");
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    if (userStr && token && expiresAtStr) {
      try {
        const userData = JSON.parse(userStr);
        // Normalize user data structure
        const user: User = {
          id: userData.id || "",
          email:
            userData.correo_electronico ||
            userData.usuario ||
            userData.email ||
            "",
          role: userData.rol || userData.role || "user",
          nombre: userData.nombre,
          // Keep original fields for reference if needed
          correo_electronico: userData.correo_electronico,
          usuario: userData.usuario,
          rol: userData.rol,
        };

        this.currentUserSubject.next(user);

        // Configurar temporizador para cerrar sesión cuando expire el token
        const expiryTimestamp = parseInt(expiresAtStr);
        const now = Date.now();
        const expiryTime = expiryTimestamp - now;

        if (expiryTime > 0) {
          this.setTokenExpiryTimer(expiryTime);
          // La sesión se verificará cuando sea necesario hacer una petición autenticada
          // No verificamos automáticamente aquí para evitar logout por problemas de red temporales
        } else {
          // Token ya ha expirado
          if (rememberMe && refreshToken) {
            // Si tiene "recordarme" activado, intentar refrescar el token
            console.log("Token expirado, intentando refrescar sesión...");
            // Por ahora solo limpiamos, pero se podría implementar refresh token
            this.clearAuthData();
          } else {
            // Limpiar datos pero no redirigir automáticamente
            this.clearAuthData();
          }
        }
      } catch (error) {
        console.error("Error al cargar usuario desde storage:", error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  login(email: string, password: string): Observable<User> {
    // Clear any previous auth data before attempting login
    this.clearAuthData();
    const requestPayload = {
      email: email,
      password: password,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http
      .post<AuthApiResponse>(`${this.baseUrl}/auth/login`, requestPayload, {
        headers,
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response) {
            throw new Error("No se recibió respuesta del servidor");
          }

          if (!response.success) {
            const errorMsg = response.error || "Autenticación fallida";
            throw new Error(errorMsg);
          }

          if (!response.data) {
            throw new Error(
              "La respuesta no tiene el formato esperado (falta data)",
            );
          }

          if (!response.data.user) {
            throw new Error(
              "La respuesta no tiene el formato esperado (falta user)",
            );
          }

          if (!response.data.session) {
            throw new Error(
              "La respuesta no tiene el formato esperado (falta session)",
            );
          }

          const userData = response.data.user;
          const tokenData = response.data.session.access_token;
          const expiryData = response.data.session.expires_at;
          const refreshTokenData = response.data.session.refresh_token || null;

          // Normalize user data structure to handle field name differences
          const normalizedUser: User = {
            id: userData.id || "",
            email:
              userData.correo_electronico ||
              userData.usuario ||
              userData.email ||
              "",
            role: userData.rol || userData.role || "user",
            nombre: userData.nombre,
            // Keep original fields for reference if needed
            correo_electronico: userData.correo_electronico,
            usuario: userData.usuario,
            rol: userData.rol,
          };

          // Almacenar datos de autenticación
          this.storeAuthData(
            normalizedUser,
            tokenData,
            expiryData,
            refreshTokenData || undefined,
          );

          return normalizedUser;
        }),
        catchError((error) => {
          let errorMessage = "Credenciales incorrectas. Intente de nuevo.";

          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Evitar múltiples llamadas simultáneas a logout
    if (this.currentUserSubject.value === null) {
      // Ya se hizo logout, solo navegar
      this.router.navigate(["/login"]);
      return;
    }

    // Llamada al endpoint de logout
    const token = localStorage.getItem("accessToken");
    if (token) {
      this.http
        .post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
        .pipe(
          catchError((error) => {
            // Ignorar errores del servidor durante logout
            console.warn(
              "Error al cerrar sesión en el servidor (ignorado):",
              error,
            );
            return of(null);
          }),
          finalize(() => {
            // Limpiar datos locales independientemente del resultado
            this.clearAuthData();
            // Solo navegar si no estamos ya en login
            if (!this.router.url.includes("/login")) {
              this.router.navigate(["/login"]);
            }
          }),
        )
        .subscribe();
    } else {
      // Si no hay token, simplemente limpiamos los datos locales
      this.clearAuthData();
      if (!this.router.url.includes("/login")) {
        this.router.navigate(["/login"]);
      }
    }
  }

  /**
   * Obtiene la sesión actual desde el backend
   */
  getSession(): Observable<User | null> {
    return this.http
      .get<AuthApiResponse>(`${this.baseUrl}/auth/session`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data || !response.data.user) {
            return null;
          }

          const userData = response.data.user;
          const tokenData = response.data.session.access_token;
          const expiryData = response.data.session.expires_at;
          const refreshTokenData = response.data.session.refresh_token;

          // Normalize user data structure
          const normalizedUser: User = {
            id: userData.id || "",
            email:
              userData.correo_electronico ||
              userData.usuario ||
              userData.email ||
              "",
            role: userData.rol || userData.role || "user",
            nombre: userData.nombre,
            correo_electronico: userData.correo_electronico,
            usuario: userData.usuario,
            rol: userData.rol,
          };

          this.storeAuthData(
            normalizedUser,
            tokenData,
            expiryData,
            refreshTokenData,
          );
          return normalizedUser;
        }),
        catchError((error) => {
          console.error("Error al obtener la sesión:", error);
          // No limpiar la autenticación aquí, solo propagar el error
          // La limpieza se hará en loadUserFromStorage si el error es 401
          return throwError(() => error);
        }),
      );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    const expiresAtStr = localStorage.getItem("tokenExpiry");

    if (!token || !expiresAtStr) {
      return false;
    }

    const expiry = parseInt(expiresAtStr);
    if (isNaN(expiry)) {
      return false;
    }

    const now = Date.now();
    return expiry > now;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === role;
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  /**
   * Almacena los datos de autenticación
   */
  private storeAuthData(
    user: User,
    token: string,
    tokenExpiry: number | string,
    refreshToken?: string,
  ): void {
    // Convertir tokenExpiry a número si es string
    let expiryTimestamp: number;
    if (typeof tokenExpiry === "string") {
      expiryTimestamp = parseInt(tokenExpiry, 10);
      if (isNaN(expiryTimestamp)) {
        // Si no es válido, usar 1 hora por defecto

        expiryTimestamp = Date.now() + 3600000;
      }
    } else {
      // Check if this is seconds since epoch (Supabase format) or milliseconds
      if (tokenExpiry < 2000000000) {
        // Convert seconds to milliseconds if needed

        expiryTimestamp = tokenExpiry * 1000;
      } else {
        expiryTimestamp = tokenExpiry;
      }
    }

    // Guardar en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("tokenExpiry", expiryTimestamp.toString());

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Notificar a los suscriptores del cambio de usuario
    this.currentUserSubject.next(user);

    // Configurar temporizador para cerrar sesión cuando expire el token
    const expiryTime = expiryTimestamp - Date.now();
    if (expiryTime > 0) {
      this.setTokenExpiryTimer(expiryTime);
    } else {
      console.warn(
        "El token ya ha expirado o la fecha de expiración no es válida",
      );
    }
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData() {
    // No limpiar rememberMe, eso lo decide el usuario
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");

    this.currentUserSubject.next(null);

    // Clear token expiry timer
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  /**
   * Configura el temporizador para cerrar sesión cuando expire el token
   */
  private setTokenExpiryTimer(expiryTime: number): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }

    // Ensure expiryTime is positive and reasonable
    const safeExpiryTime = Math.max(
      0,
      Math.min(expiryTime, 7 * 24 * 60 * 60 * 1000),
    ); // Max 7 days

    if (safeExpiryTime <= 0) {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      if (!rememberMe) {
        this.logout();
      } else {
        // Si tiene "recordarme", solo limpiar datos sin redirigir
        this.clearAuthData();
      }
      return;
    }

    this.tokenExpiryTimer = setTimeout(() => {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      if (!rememberMe) {
        this.logout();
      } else {
        // Si tiene "recordarme", solo limpiar datos sin redirigir
        console.log("Sesión expirada pero recordarme está activo");
        this.clearAuthData();
      }
    }, safeExpiryTime);
  }

  /**
   * Función de prueba de login que puede ser ejecutada desde la consola del navegador
   * Ejemplo: window.testLogin('correo@ejemplo.com', 'contraseña123')
   */
  testLogin(email: string, password: string): void {
    const requestPayload: { email: string; password: string } = {
      email: email,
      password: password,
    };

    console.log("Payload:", JSON.stringify(requestPayload, null, 2));

    // Realizar petición directa usando fetch para evitar interceptores
    fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    })
      .then((response) => {
        return response.json().then((data) => {
          return { response, data };
        });
      })
      .then(({ response, data }) => {
        if (!response.ok) {
          console.error("Error en login:", data.error || "Error desconocido");
          return;
        }

        console.log("Login exitoso:", data);
        console.log("=== TEST COMPLETADO ===");
      })
      .catch((error) => {
        // Error silencioso
      });
  }

  /**
   * Función para crear un usuario de prueba desde la consola del navegador
   * Ejemplo: window.createTestUser('correo@ejemplo.com', 'contraseña123')
   */
  createTestUser(
    email: string,
    password: string,
    nombre: string = "",
    rol: string = "usuario",
  ): void {
    console.log("=== CREANDO USUARIO DE PRUEBA ===");
    console.log(`Email: ${email}`);
    console.log(`Nombre: ${nombre}`);
    console.log(`Rol: ${rol}`);
    console.log(`URL: ${this.baseUrl}/auth/register`);

    const requestPayload = {
      email: email,
      password: password,
      nombre: nombre || email.split("@")[0],
      rol: rol,
    };

    // Realizar petición para crear el usuario
    fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    })
      .then((response) => {
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);

        return response.json().then((data) => {
          console.log("Respuesta completa:", data);
          return { response, data };
        });
      })
      .then(({ response, data }) => {
        if (!response.ok) {
          console.error(
            "Error al crear usuario:",
            data.error || "Error desconocido",
          );
          // Si el error es que el usuario ya existe, intentamos hacer login
          if (data.error && data.error.includes("already exists")) {
            this.testLogin(email, password);
          }
          return;
        }

        // Esperar un segundo antes de intentar login para dar tiempo a la BD
        setTimeout(() => {
          this.testLogin(email, password);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
      });
  }

  /**
   * Función de diagnóstico que puede ser llamada desde la consola del navegador
   */
  diagnoseAuth(): void {
    try {
      // Verificar localStorage
      const userItem = localStorage.getItem("currentUser");
      const tokenItem = localStorage.getItem("accessToken");
      const expiresItem = localStorage.getItem("tokenExpiry");
      const refreshItem = localStorage.getItem("refreshToken");

      // Devuelve silenciosamente el estado
      return;
    } catch (error) {
      // Ignora los errores
    }
  }
}
