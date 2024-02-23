import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwissBillPdfViewerComponent } from './swiss-bill-pdf-viewer.component';

describe('SwissBillPdfViewerComponent', () => {
  let component: SwissBillPdfViewerComponent;
  let fixture: ComponentFixture<SwissBillPdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwissBillPdfViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwissBillPdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
