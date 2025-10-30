import { supabase } from "../config/database";
import { User } from "../types";

/**
 * Service for handling authentication operations with Supabase
 */
export class AuthService {
  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns User and session data on success, null on failure
   */
  async signIn(email: string, password: string) {
    try {
      // Using Supabase Auth API to sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      // Verify user data is returned
      if (!data || !data.session) {
        throw new Error("No se pudo establecer la sesión");
      }

      // Get user details to confirm authentication worked
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData) {
        throw new Error("Error al validar la sesión");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut() {
    try {
      // Using Supabase Auth API to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Gets the current user's session
   * @returns Session data if authenticated, null if not
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Get session error:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
