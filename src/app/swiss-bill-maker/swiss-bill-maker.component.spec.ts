import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwissBillMakerComponent } from './swiss-bill-maker.component';

describe('SwissBillMakerComponent', () => {
  let component: SwissBillMakerComponent;
  let fixture: ComponentFixture<SwissBillMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwissBillMakerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwissBillMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
