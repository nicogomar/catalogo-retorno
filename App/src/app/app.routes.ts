import { Routes } from "@angular/router";
import { AdministracionComponent } from "./components/administracion/administracion.component";
import { LoginComponent } from "./components/login/login.component";
import { PaymentSuccessComponent } from "./components/payment-success/payment-success.component";
import { PaymentFailureComponent } from "./components/payment-failure/payment-failure.component";
import { PaymentPendingComponent } from "./components/payment-pending/payment-pending.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "administracion",
    component: AdministracionComponent,
    canActivate: [authGuard],
  },
  { path: "login", component: LoginComponent },
  { path: "payment/success", component: PaymentSuccessComponent },
  { path: "payment/failure", component: PaymentFailureComponent },
  { path: "payment/pending", component: PaymentPendingComponent },
];
