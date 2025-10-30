import { Routes } from "@angular/router";
import { AdministracionComponent } from "./components/administracion/administracion.component";
import { LoginComponent } from "./components/login/login.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "administracion",
    component: AdministracionComponent,
    canActivate: [authGuard],
  },
  { path: "login", component: LoginComponent },
];
