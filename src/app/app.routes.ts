import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { PaymentProcessingComponent } from './payment-processing/payment-processing.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'transaction-history', component: TransactionHistoryComponent },
    { path: 'payment-processing', component: PaymentProcessingComponent, canActivate: [AuthGuard] }
];
