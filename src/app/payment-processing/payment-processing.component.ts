import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timer } from 'rxjs';

interface Invoice {
  invoiceId: number;
  consumerId: number;
  connectionId: string;
  amountDue: number;
  status: string;
  billingStartDate: string;
  billingEndDate: string;
  billDueDate: string;
}

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-processing.component.html',
  styleUrls: ['./payment-processing.component.css']
})
export class PaymentProcessingComponent implements OnInit {
  phoneNumber: string = '';
  connectionIds: string[] = [];
  selectedConnectionId: string = '';
  invoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  paymentAmount: number = 0;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'CASH' | 'WALLET' = 'CREDIT_CARD';
  message: string = '';
  isLoading: boolean = false;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  earlyPaymentDiscount: number = 0;
  onlinePaymentDiscount: number = 0;
  finalAmount: number = 0;
  isEarlyPayment: boolean = false;
  isOnlinePayment: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {}

  fetchConnectionIds() {
    if (!this.phoneNumber) {
      this.message = 'Please enter a phone number.';
      return;
    }
    this.isLoading = true;
    this.http.get<string[]>(`https://finzlyapp-production.up.railway.app/api/customers/connection-ids/${this.phoneNumber}`)
      .subscribe(
        (data) => {
          this.connectionIds = data;
          this.message = data.length > 0 ? '' : 'No connection IDs found for this phone number.';
          this.selectedConnectionId = '';
          this.invoices = [];
          this.selectedInvoice = null;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching connection IDs:', error);
          this.message = 'Error fetching connection IDs. Please try again.';
          this.isLoading = false;
        }
      );
  }

  onConnectionIdChange() {
    this.fetchInvoices();
  }

  fetchInvoices() {
    if (!this.selectedConnectionId) {
      this.message = 'Please select a connection ID.';
      return;
    }
    this.isLoading = true;
    this.http.get<Invoice[]>(`https://finzlyapp-production.up.railway.app/api/invoices/unpaid/${this.selectedConnectionId}`)
      .subscribe(
        (data) => {
          this.invoices = data;
          this.selectedInvoice = null;
          this.paymentAmount = 0;
          this.message = data.length === 0 ? 'No unpaid invoices found for this connection ID.' : '';
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching unpaid invoices:', error);
          this.message = 'Error fetching invoices. Please try again.';
          this.isLoading = false;
        }
      );
  }

  selectInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.paymentAmount = invoice.amountDue;
    
    // Check for early payment discount
    const currentDate = new Date();
    const dueDate = new Date(invoice.billDueDate);
    this.isEarlyPayment = currentDate < dueDate;
    
    if (this.isEarlyPayment) {
      // Assuming 5% early payment discount
      this.earlyPaymentDiscount = invoice.amountDue * 0.05;
    } else {
      this.earlyPaymentDiscount = 0;
    }
    
    this.calculateFinalAmount();
  }

  calculateFinalAmount() {
    if (!this.selectedInvoice) return;

    let discountedAmount = this.selectedInvoice.amountDue ;
    
    this.isOnlinePayment = this.paymentMethod !== 'CASH';
    
    if (this.isOnlinePayment) {
      // Assuming 5s% online payment discount
      this.onlinePaymentDiscount = discountedAmount * 0.05;
    } else {
      this.onlinePaymentDiscount = 0;
    }
    
    this.finalAmount = discountedAmount - this.onlinePaymentDiscount- this.earlyPaymentDiscount;
    this.paymentAmount = this.finalAmount;
  }

  processPayment() {
    if (!this.selectedInvoice) {
      this.message = 'Please select an invoice to pay.';
      return;
    }

    if (this.paymentAmount <= 0 || this.paymentAmount > this.selectedInvoice.amountDue) {
      this.message = 'Invalid payment amount.';
      return;
    }

    const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'CASH', 'WALLET'];
    if (!validPaymentMethods.includes(this.paymentMethod)) {
      this.message = 'Invalid payment method.';
      return;
    }

    const paymentData = {
      invoiceId: this.selectedInvoice.invoiceId,
      amount: this.finalAmount,
      paymentMethod: this.paymentMethod,
      connectionId: this.selectedConnectionId
    };

    this.isLoading = true;
    this.http.post<{ message: string, updatedInvoice: Invoice }>('https://finzlyapp-production.up.railway.app/api/payments/process', paymentData)
      .subscribe(
        (response) => {
          this.showSuccessMessage = true;
          this.successMessage = `Payment of ${this.paymentAmount} processed successfully!`;
          this.isLoading = false;
          
          // Set a timer to hide the success message and refresh invoices after 10 seconds
          timer(5000).subscribe(() => {
            this.showSuccessMessage = false;
            this.fetchInvoices();
          });
        },
        (error) => {
          console.error('Error processing payment:', error);
          if (error.error && error.error.message) {
            this.message = error.error.message;
          } else {
            this.message = 'Error processing payment. Please try again.';
          }
          this.isLoading = false;
        }
      );
  }

  fetchUnpaidInvoices() {
    if (!this.selectedConnectionId) {
      this.message = 'Please select a connection ID.';
      return;
    }
    this.isLoading = true;
    this.http.get<Invoice[]>(`https://finzlyapp-production.up.railway.app/api/invoices/unpaid/${this.selectedConnectionId}`)
      .subscribe(
        (data) => {
          this.invoices = data;
          this.selectedInvoice = null;
          this.paymentAmount = 0;
          this.message = data.length === 0 ? 'No unpaid invoices found for this connection ID.' : '';
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching unpaid invoices:', error);
          this.message = 'Error fetching invoices. Please try again.';
          this.isLoading = false;
        }
      );
  }

  navigateToPaymentProcessing() {
    this.router.navigate(['/payment-processing']);
  }
}