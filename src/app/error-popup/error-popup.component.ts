import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.css']
})
export class ErrorPopupComponent {
  @Input() errors: string[] = [];
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}