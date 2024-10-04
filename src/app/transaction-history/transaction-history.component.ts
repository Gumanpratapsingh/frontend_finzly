import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';

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
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  phoneNumber: string = '';
  transactions: Transaction[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private http: HttpClient, private location: Location) {}

  ngOnInit() {}

  loadTransactions() {
    this.isLoading = true;
    this.error = null;
    this.transactions = [];

    this.http.get<Transaction[]>(`http://localhost:8080/api/transactions/history/${this.phoneNumber}`)
      .subscribe(
        (data) => {
          this.transactions = data;
          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching transactions:', error);
          this.error = 'An error occurred while fetching transactions. Please try again.';
          this.isLoading = false;
        }
      );
  }

  goBack() {
    this.location.back();
  }
}