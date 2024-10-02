import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceGenerateComponent } from './invoice-generate.component';

describe('InvoiceGenerateComponent', () => {
  let component: InvoiceGenerateComponent;
  let fixture: ComponentFixture<InvoiceGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
