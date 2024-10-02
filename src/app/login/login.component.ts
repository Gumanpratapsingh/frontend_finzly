import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Removed HttpClientModule; we use provideHttpClient now
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],  // Fixed the 'styleUrl' typo to 'styleUrls'
})
export class LoginComponent {
  email: string = '';
  otp: string = '';
  message: string = '';
  isNewUser: boolean = false;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.isNewUser) {
      this.verifyOtp();
    } else {
      this.login();
    }
  }

  login() {
    this.isLoading = true;
    this.http.post<any>('https://finzlyapp-production.up.railway.app/api/auth/login', { email: this.email })
      .subscribe(
        response => {
          this.isLoading = false;
          this.message = response.message;
          if (response.existingUser) {
            // Existing user, redirect to dashboard
            localStorage.setItem('token', response.token);
            if (response.name) {
              localStorage.setItem('employeeName', response.name);
            } else {
              console.error('Employee name not received in the response');
            }
            this.router.navigate(['/dashboard']);
          } else {
            // New user, show OTP input field
            this.isNewUser = true;
            this.message = 'Please enter the OTP sent to your email.';
          }
        },
        error => {
          this.isLoading = false;
          this.message = 'An error occurred while logging in.';
          console.error(error);
        }
      );
  }

  verifyOtp() {
    this.isLoading = true;
    this.http.post<any>(`https://finzlyapp-production.up.railway.app/api/auth/verify-otp`, { email: this.email, otp: this.otp })
      .subscribe(
        response => {
          this.isLoading = false;
          this.message = response.message;
          if (response.token) {
            localStorage.setItem('token', response.token);
            // Redirect to the next page or update UI as needed
            this.router.navigate(['/dashboard']);
          }
        },
        error => {
          this.isLoading = false;
          this.message = 'An error occurred during OTP verification.';
          console.error(error);
        }
      );
  }
}