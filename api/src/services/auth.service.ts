import { supabase } from "../config/database";
import { Usuario, ApiResponse } from "../types";
import usuarioService from "./usuario.service";

/**
 * Service for handling authentication operations with Supabase
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: Usuario; session: any }>> {
    try {
      // First, check if user exists in our database
      const existingUser = await usuarioService.getUsuarioByEmail(email);

      if (!existingUser) {
        // User not found in database
        return {
          success: false,
          error: "Credenciales incorrectas. Intente de nuevo.",
        };
      }

      // User found in database

      // Sign in with Supabase auth
      const authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResponse.error) {
        return {
          success: false,
          error: "Credenciales incorrectas. Intente de nuevo.",
        };
      }

      const { data } = authResponse;

      if (!data.session) {
        return {
          success: false,
          error: "Error al establecer la sesión. Contacte al administrador.",
        };
      }

      // Validate and sanitize the session data
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token || null,
        expires_at:
          data.session.expires_at || Math.floor(Date.now() / 1000) + 604800, // Default to 7 days if not provided
      };

      return {
        success: true,
        data: {
          user: existingUser,
          session: sessionData,
        },
        message: "Inicio de sesión exitoso",
      };
    } catch (error: any) {
      return {
        success: false,
        error: "Error en el servicio de autenticación. Intente de nuevo.",
      };
    }
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    role: string = "user",
  ): Promise<ApiResponse<Usuario>> {
    try {
      // Check if email already exists in our usuario table
      const existingUser = await usuarioService.getUsuarioByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: "El correo electrónico ya está registrado",
        };
      }

      // Create auth user in Supabase
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          error:
            authError.message ||
            "Error al crear usuario en el sistema de autenticación",
        };
      }

      // Now create user in our usuario table - mapping to the actual DB column names

      const newUser = await usuarioService.createUsuario({
        usuario: email, // Column in DB is 'usuario', not 'correo_electronico'
        clave: password, // Column in DB is 'clave', not 'contraseña'
        rol: role,
        correo_electronico: email, // Also set the typed field for consistency
      });

      return {
        success: true,
        data: newUser,
        message: "Usuario registrado exitosamente",
      };
    } catch (error: any) {
      console.error("Error in register service:", error);
      return {
        success: false,
        error: "Error en el servicio de registro. Intente de nuevo.",
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return {
          success: false,
          error: "Error al cerrar sesión. Intente de nuevo.",
        };
      }

      return {
        success: true,
        message: "Sesión cerrada exitosamente",
      };
    } catch (error: any) {
      console.error("Error in logout service:", error);
      return {
        success: false,
        error: "Error en el servicio de cierre de sesión. Intente de nuevo.",
      };
    }
  }

  /**
   * Get user from token
   */
  async getUserByToken(token: string): Promise<Usuario | null> {
    try {
      if (!token || token.trim() === "") {
        return null;
      }

      // Set the auth token to the client
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        return null;
      }

      if (!user || !user.email) {
        return null;
      }

      // Get user from our usuario table
      const dbUser = await usuarioService.getUsuarioByEmail(user.email);
      return dbUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
      // Check if user exists
      const user = await usuarioService.getUsuarioByEmail(email);
      if (!user) {
        return {
          success: false,
          error: "El correo electrónico no está registrado",
        };
      }

      // Send password reset email without additional options
      // This avoids TypeScript errors related to optional parameters
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          error: "Error al enviar el correo de recuperación. Intente de nuevo.",
        };
      }

      return {
        success: true,
        message: "Correo de recuperación enviado exitosamente",
      };
    } catch (error: any) {
      console.error("Error in resetPassword service:", error);
      return {
        success: false,
        error:
          "Error en el servicio de recuperación de contraseña. Intente de nuevo.",
      };
    }
  }

  /**
   * Get session by token
   */
  async getSessionByToken(
    token: string,
  ): Promise<ApiResponse<{ user: Usuario; session: any }>> {
    try {
      if (!token || token.trim() === "") {
        return {
          success: false,
          error: "No se proporcionó token de acceso",
        };
      }

      // Get user from token
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user || !user.email) {
        return {
          success: false,
          error: "Token inválido o sesión expirada",
        };
      }

      // Get user from our usuario table
      const dbUser = await usuarioService.getUsuarioByEmail(user.email);

      if (!dbUser) {
        return {
          success: false,
          error: "Usuario no encontrado en la base de datos",
        };
      }

      // Return session data in the same format as login
      const sessionData = {
        access_token: token,
        refresh_token: null, // We don't have refresh token from just the access token
        expires_at: Math.floor(Date.now() / 1000) + 604800, // Default to 7 days
      };

      return {
        success: true,
        data: {
          user: dbUser,
          session: sessionData,
        },
        message: "Sesión válida",
      };
    } catch (error: any) {
      console.error("Error in getSessionByToken service:", error);
      return {
        success: false,
        error: "Error al validar la sesión. Intente de nuevo.",
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(
    token: string,
    password: string,
  ): Promise<ApiResponse<null>> {
    try {
      // First set session with token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: "",
      });

      if (sessionError) {
        return {
          success: false,
          error:
            "Token inválido o expirado. Intente solicitar un nuevo correo de recuperación.",
        };
      }

      // Now update password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          success: false,
          error: "Error al actualizar la contraseña. Intente de nuevo.",
        };
      }

      return {
        success: true,
        message: "Contraseña actualizada exitosamente",
      };
    } catch (error: any) {
      console.error("Error in updatePassword service:", error);
      return {
        success: false,
        error:
          "Error en el servicio de actualización de contraseña. Intente de nuevo.",
      };
    }
  }
}

export default new AuthService();
