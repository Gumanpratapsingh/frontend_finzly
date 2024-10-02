import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';

interface UploadSummary {
  totalRecords: number;
  successfulUploads: number;
  failedUploads: number;
  errors: string[];
}

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, ErrorPopupComponent],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {
  uploadSummary: UploadSummary | null = null;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  showRetry: boolean = false;
  errors: string[] = [];
  showErrorPopup: boolean = false;
  storedRecords: number = 0;
  totalRecords: number = 0;
  storedPercentage: number = 0;
  message: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (this.selectedFile) {
      this.resetState();
      this.uploadFile();
    }
  }

  resetState() {
    this.uploadProgress = 0;
    this.showRetry = false;
    this.errors = [];
    this.showErrorPopup = false;
    this.storedRecords = 0;
    this.totalRecords = 0;
    this.storedPercentage = 0;
    this.uploadSummary = null;
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!, this.selectedFile!.name);

    const token = localStorage.getItem('token');
    if (!token) {
      this.handleError('No token found. Please log in again.');
      return;
    }

    this.isLoading = true; // Show loading indicator

    this.http.post('https://finzlyapp-production.up.railway.app/api/bulk-upload/customers', formData, {
      headers: { 'Authorization': `Bearer ${token}` },
      reportProgress: true,
      observe: 'events'
    }).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          const response = event.body as UploadSummary;
          this.uploadSummary = response;
          this.storedRecords = response.successfulUploads;
          this.totalRecords = response.totalRecords;
          this.storedPercentage = this.totalRecords > 0 ? (this.storedRecords / this.totalRecords) * 100 : 0;

          if (response.errors && response.errors.length > 0) {
            const duplicateEntries = response.errors.filter(error => error.startsWith("Duplicate entry"));
            const otherErrors = response.errors.filter(error => !error.startsWith("Duplicate entry"));

            let errorMessage = `Upload completed with ${otherErrors.length} errors and ${duplicateEntries.length} duplicate entries. ${response.failedUploads} records failed.`;
            this.handleError(errorMessage);
            this.displayErrors(response.errors);
          } else {
            this.showSuccessMessage();
          }
        }
      },
      (error) => {
        console.error('Full error:', error);
        if (error.status === 413) {
          this.handleError('Error: File size too large. Please upload a smaller file or contact the administrator.');
        } else if (error.error && error.error.message) {
          this.handleError('Error uploading file: ' + error.error.message);
        } else {
          this.handleError('Error uploading file: ' + error.message);
        }
        this.isLoading = false; // Hide loading indicator
      },
      () => {
        this.isLoading = false; // Hide loading indicator when complete
      }
    );
  }

  handleError(errorMessage: string) {
    this.errors = [errorMessage];
    this.showRetry = true;
    this.showErrorPopup = true;
  }

  displayErrors(errors: string[]) {
    this.errors = errors;
    this.showErrorPopup = true;
  }

  showSuccessMessage() {
    this.message = 'File uploaded successfully!';
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  closeErrorPopup() {
    this.showErrorPopup = false;
  }

  retry() {
    this.resetState();
    this.uploadFile();
  }
}