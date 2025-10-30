import { Usuario } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

export {}; // This export is needed to make this a module
