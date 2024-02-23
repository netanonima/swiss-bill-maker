import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwissBillFormComponent } from './swiss-bill-form.component';

describe('SwissBillFormComponent', () => {
  let component: SwissBillFormComponent;
  let fixture: ComponentFixture<SwissBillFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwissBillFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwissBillFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
