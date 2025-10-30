import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  returnUrl: string = "/";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";

    // Redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      console.log("Usuario ya autenticado, redirigiendo a la página principal");
      this.router.navigate(["/"]);
    } else {
      console.log("Usuario no autenticado, mostrando formulario de login");
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const email = this.loginForm.get("email")?.value;
    const password = this.loginForm.get("password")?.value;
    const rememberMe = this.loginForm.get("rememberMe")?.value || false;

    // Verificar que los campos tengan valores
    if (!email || !password) {
      this.errorMessage = "Debe proporcionar correo electrónico y contraseña";
      this.isSubmitting = false;
      return;
    }

    // Guardar preferencia de "recordarme" antes de hacer login
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log("✅ Login exitoso:", user);
        // Verificar que realmente se haya autenticado
        if (this.authService.isAuthenticated()) {
          console.log(
            "Autenticación verificada, redirigiendo a:",
            this.returnUrl,
          );
          this.isSubmitting = false;
          this.router.navigateByUrl(this.returnUrl);
        } else {
          console.error(
            "⚠️ Error: Login aparentemente exitoso pero isAuthenticated() devuelve false",
          );
          this.errorMessage = "Error interno: Autenticación incompleta";
          this.isSubmitting = false;
        }
      },
      error: (error: Error | HttpErrorResponse) => {
        console.error("❌ Error de login:", error);

        let errorMsg = "Credenciales inválidas. Por favor intente nuevamente.";

        // Log detallado del error para diagnóstico
        if (error instanceof HttpErrorResponse) {
          console.error("Error HTTP:", {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error,
          });

          if (error.status === 0) {
            errorMsg =
              "Error de conexión con el servidor. Verifique su conexión a internet.";
          } else if (error.status === 401) {
            errorMsg =
              "Credenciales incorrectas. Verifique su correo y contraseña.";
          } else if (error.status >= 500) {
            errorMsg = "Error en el servidor. Por favor intente más tarde.";
          }

          // Intentar extraer mensaje específico
          if (error.error?.error) {
            errorMsg = error.error.error;
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.errorMessage = errorMsg;
        this.isSubmitting = false;
      },
    });
  }
}
