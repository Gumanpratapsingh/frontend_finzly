import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTranscationTrackingComponent } from './payment-transcation-tracking.component';

describe('PaymentTranscationTrackingComponent', () => {
  let component: PaymentTranscationTrackingComponent;
  let fixture: ComponentFixture<PaymentTranscationTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentTranscationTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentTranscationTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
