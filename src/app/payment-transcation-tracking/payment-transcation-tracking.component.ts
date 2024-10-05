import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Transaction {
  transactionId: number;
  consumerId: number;
  userName: string;
  amount: number;
  modeOfPayment: string;
  transactionDate: string;
  referenceNumber: string;
  status: string;
}

@Component({
  selector: 'app-payment-transcation-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-transcation-tracking.component.html',
  styleUrl: './payment-transcation-tracking.component.css'
})
export class PaymentTranscationTrackingComponent implements OnInit {
  transactions: Transaction[] = [];
  consumerId: number = 0;
  paymentAmount: number = 0;
  paymentMethod: string = 'CREDIT_CARD';
  phoneNumber: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // We'll leave this empty for now, as we want to load transactions only when the user requests it
  }

  loadTransactions(consumerId: number) {
    this.http.get<Transaction[]>(`http://localhost:8080/api/transactions/${consumerId}`)
      .subscribe(
        (data) => {
          this.transactions = data;
        },
        (error) => {
          console.error('Error fetching transactions:', error);
        }
      );
  }

  loadTransactionsByPhoneNumber() {
    if (!this.phoneNumber) {
      this.errorMessage = 'Please enter a phone number.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.http.get<Transaction[]>(`http://localhost:8080/api/transactions/history/${this.phoneNumber}`)
      .subscribe(
        (data) => {
          this.transactions = data;
          this.isLoading = false;
          if (data.length === 0) {
            this.errorMessage = 'No transactions found for this phone number.';
          }
        },
        (error) => {
          console.error('Error fetching transactions:', error);
          this.errorMessage = 'Failed to load transactions. Please try again.';
          this.isLoading = false;
        }
      );
  }

  processPayment() {
    const payment = {
      consumerId: this.consumerId,
      amount: this.paymentAmount,
      modeOfPayment: this.paymentMethod,
      userName: 'John Doe', // Replace with actual user name
      status: 'PENDING'
    };

    this.http.post<Transaction>('http://localhost:8080/api/transactions', payment)
      .subscribe(
        (response) => {
          console.log('Payment processed successfully');
          this.loadTransactions(this.consumerId);
          this.resetForm();
        },
        (error) => {
          console.error('Error processing payment:', error);
        }
      );
  }

  resetForm() {
    this.paymentAmount = 0;
    this.paymentMethod = 'CREDIT_CARD';
  }

  navigateToTransactionHistory() {
    this.router.navigate(['/transaction-history']);
  }
}
