import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

// Inicializar el componente principal de la aplicación
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
