import nodemailer from "nodemailer";
import { Pedido } from "../types";
import dotenv from "dotenv";

dotenv.config();

/**
 * Service for handling email operations
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize the email transporter with Gmail
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail address from env
        pass: process.env.EMAIL_PASSWORD, // App password from env (not your regular Gmail password)
      },
    });
  }

  /**
   * Verify the email connection is working
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service is ready to send messages");
      return true;
    } catch (error) {
      console.error("Error verifying email connection:", error);
      return false;
    }
  }

  /**
   * Send a notification email when a new order is created
   * @param pedido The order details
   * @param recipients Array of email addresses to send the notification to
   */
  async sendNewOrderNotification(
    pedido: Pedido,
    recipients: string[],
  ): Promise<boolean> {
    try {
      // Format the order products into a readable format for email
      const productosFormateados =
        pedido.productos && Array.isArray(pedido.productos)
          ? pedido.productos
              .map(
                (p) =>
                  `- ${p.nombre} x ${p.quantity} - $${p.precio * p.quantity}`,
              )
              .join("\n")
          : "No hay productos";

      // Calculate total amount
      const total =
        pedido.productos && Array.isArray(pedido.productos)
          ? pedido.productos.reduce((sum, p) => sum + p.precio * p.quantity, 0)
          : 0;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(", "),
        subject: `¡Nuevo pedido recibido! - ${pedido.nombre_comercio}`,
        html: `
          <h1>Nuevo pedido recibido</h1>
          <p><strong>Comercio:</strong> ${pedido.nombre_comercio}</p>
          <p><strong>Fecha:</strong> ${pedido.created_at ? new Date(pedido.created_at).toLocaleString() : new Date().toLocaleString()}</p>
          <p><strong>Teléfono:</strong> ${pedido.telefóno}</p>
          <p><strong>Email:</strong> ${pedido.email || "No especificado"}</p>
          <p><strong>Localidad:</strong> ${pedido.localidad}</p>
          <p><strong>Estado:</strong> ${pedido.estado}</p>

          <h2>Productos:</h2>
          <pre>${productosFormateados}</pre>

          <h3>Total: $${total}</h3>

          <p>Detalles: ${pedido.detalles || "Sin detalles"}</p>

          <p>Este es un mensaje automático, por favor no responda a este correo.</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return true;
    } catch (error) {
      console.error("Error sending order notification email:", error);
      return false;
    }
  }

  /**
   * Send an order status update notification
   * @param pedido The updated order
   * @param previousStatus The previous status before update
   * @param customerEmail The customer's email to send notification to
   */
  async sendOrderStatusNotification(
    pedido: Pedido,
    previousStatus: string,
    customerEmail: string | null | undefined,
  ): Promise<boolean> {
    try {
      if (!customerEmail || typeof customerEmail !== "string") {
        console.log("No valid customer email provided, skipping notification");
        return false;
      }

      const statusMessages: Record<string, string> = {
        COBRAR: "está pendiente de pago",
        PAGO: "ha sido pagado y está siendo procesado",
        "En curso": "está en preparación",
        Finalizado: "ha sido completado y está listo para entrega/recogida",
      };

      const statusMessage =
        pedido.estado && statusMessages[pedido.estado as string]
          ? statusMessages[pedido.estado as string]
          : "ha sido actualizado";

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Actualización de su pedido - ${pedido.nombre_comercio}`,
        html: `
          <h1>Actualización de Estado de su Pedido</h1>
          <p>Estimado/a cliente,</p>
          <p>Le informamos que su pedido #${pedido.id} ${statusMessage}.</p>

          <h2>Detalles del pedido:</h2>
          <p><strong>Comercio:</strong> ${pedido.nombre_comercio}</p>
          <p><strong>Estado anterior:</strong> ${previousStatus}</p>
          <p><strong>Nuevo estado:</strong> ${pedido.estado}</p>
          <p><strong>Fecha de actualización:</strong> ${new Date().toLocaleString()}</p>

          <p>Si tiene alguna consulta, por favor contáctenos.</p>

          <p>Saludos,<br>El equipo de ${pedido.nombre_comercio}</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Status update email sent:", info.response);
      return true;
    } catch (error) {
      console.error("Error sending order status notification email:", error);
      return false;
    }
  }
}

export default new EmailService();
