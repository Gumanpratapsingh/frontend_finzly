import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-generate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-generate.component.html',
  styleUrls: ['./invoice-generate.component.css']
})
export class InvoiceGenerateComponent {
  phoneForm: FormGroup;
  connectionForm: FormGroup;
  dateForm: FormGroup;
  connectionIds: string[] = [];
  showDateForm = false;
  errorMessage: string = '';
  showPhoneForm = true;  // Add this line
  isGeneratingInvoice: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
    this.connectionForm = this.fb.group({
      selectedConnectionId: ['', Validators.required]
    });
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  fetchConnectionIds() {
    if (this.phoneForm.valid) {
      this.http.get<string[]>(`http://localhost:8080/api/customers/connection-ids/${this.phoneForm.value.phoneNumber}`)
        .subscribe(
          (ids) => {
            this.connectionIds = ids;
            this.errorMessage = '';
            if (ids.length === 0) {
              this.errorMessage = 'No connection IDs found for this phone number.';
            } else {
              this.showDateForm = true;
              this.showPhoneForm = false;  // Hide the phone form
            }
          },
          (error: HttpErrorResponse) => {
            console.error('Error fetching connection IDs:', error);
            if (error.status === 404) {
              this.errorMessage = 'Customer not found with this phone number.';
            } else {
              this.errorMessage = 'Failed to fetch connection IDs. Please try again.';
            }
          }
        );
    }
  }

  generateInvoice() {
    if (this.dateForm.valid && this.connectionForm.valid) {
      this.isGeneratingInvoice = true;
      const { startDate, endDate } = this.dateForm.value;
      const phoneNumber = this.phoneForm.value.phoneNumber;
      const connectionId = this.connectionForm.value.selectedConnectionId;
      const url = `http://localhost:8080/api/invoices/generate?phoneNumber=${phoneNumber}&connectionId=${connectionId}&startDate=${startDate}&endDate=${endDate}`;
      
      this.http.post(url, {}, { responseType: 'blob' })
        .subscribe(
          (response: Blob) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            this.errorMessage = '';
            this.isGeneratingInvoice = false;
          },
          (error: HttpErrorResponse) => {
            console.error('Error generating invoice:', error);
            if (error.error instanceof Blob) {
              error.error.text().then((errorMessage: string) => {
                this.errorMessage = errorMessage || 'Failed to generate invoice. Please try again.';
              });
            } else {
              this.errorMessage = error.error || 'Failed to generate invoice. Please try again.';
            }
            this.isGeneratingInvoice = false;
          }
        );
    }
  }
}