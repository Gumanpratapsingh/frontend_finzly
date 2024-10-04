import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BulkUploadComponent } from '../bulk-upload/bulk-upload.component';
import { ViewChild, ElementRef } from '@angular/core';
import { InvoiceGenerateComponent } from '../invoice-generate/invoice-generate.component';
import { PaymentTranscationTrackingComponent } from '../payment-transcation-tracking/payment-transcation-tracking.component';
import { PaymentProcessingComponent } from '../payment-processing/payment-processing.component';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BulkUploadComponent, InvoiceGenerateComponent, PaymentTranscationTrackingComponent, PaymentProcessingComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  customers: any[] = [];
  newCustomer: any = {
  };
  employeeName: string = '';
  showCustomerForm: boolean = false;
  errorPopupMessage: string = '';
  validationErrors: { [key: string]: string } = {};
  isLoading: boolean = false;
  
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadEmployeeName();
  }
  
  scrollToBottom() {
    setTimeout(() => {
      const container = this.contentContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  loadEmployeeName() {
    const storedName = localStorage.getItem('employeeName');
    if (storedName) {
      this.employeeName = storedName;
    } else {
      this.employeeName = 'Employee';
      console.error('Employee name not found in localStorage');
    }
  }

  openCustomerForm() {
    this.showCustomerForm = true;
  }

  closeCustomerForm() {
    this.showCustomerForm = false;
    this.newCustomer = {};
  }
  
  addCustomer() {
    this.validationErrors = {};
    let isValid = true;

    // Validate required fields
    const requiredFields = ['name', 'email', 'phoneNumber', 'billingAddress', 'connectionId', 'unitConsumption', 'billingStartDate', 'billingEndDate', 'billDueDate'];
    for (const field of requiredFields) {
      if (!this.newCustomer[field]) {
        this.validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Sending customer data:', this.newCustomer);

    this.isLoading = true; // Set loading state to true

    this.http.post('https://finzlyapp-production.up.railway.app//api/customers', this.newCustomer, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe(
      (response: any) => {
        console.log('Customer added or updated successfully:', response);
        const existingIndex = this.customers.findIndex(c => c.userId === response.userId);
        if (existingIndex !== -1) {
          this.customers[existingIndex] = response;
        } else {
          this.customers.push(response);
        }
        this.closeCustomerForm();
        this.isLoading = false; // Set loading state to false
      },
      error => {
        console.error('Error adding/updating customer:', error);
        if (error.error && typeof error.error === 'string') {
          if (error.error.includes("Connection ID is already in use")) {
            this.errorPopupMessage = "Connection ID is already in use. Please use another Connection ID.";
          } else {
            this.errorPopupMessage = `There was an issue: ${error.error}. Please try again or contact support.`;
          }
        } else if (error.error instanceof Array) {
          this.errorPopupMessage = `Please correct the following: ${error.error.join(', ')}`;
        } else {
          this.errorPopupMessage = 'Something went wrong while processing the customer. Please double-check your information and try again.';
        }
        this.isLoading = false; // Ensure isLoading is set to false in case of an error
      }
    );
  }

  navigateToPaymentProcessing() {
    this.router.navigate(['/payment-processing']);
  }

  navigateToTransactionHistory() {
    this.router.navigate(['/transaction-history']);
  }

  @ViewChild('contentContainer') contentContainer!: ElementRef;

  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post('https://finzlyapp-production.up.railway.app//api/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe(
        () => {
          console.log('Logout successful');
          this.handleLogoutSuccess();
        },
        (error) => {
          console.error('Logout error:', error);
          this.handleLogoutSuccess(); // Still clear local storage and redirect even if server request fails
        }
      );
    } else {
      this.handleLogoutSuccess();
    }
  }

  private handleLogoutSuccess() {
    localStorage.removeItem('token');
    localStorage.removeItem('employeeName');
    this.router.navigate(['/login']);
  }

  navigateToInvoiceGeneration() {
    this.router.navigate(['/invoice-generate']);
  }
}