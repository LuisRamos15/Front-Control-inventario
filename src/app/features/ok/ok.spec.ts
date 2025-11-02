import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ok } from './ok';

describe('Ok', () => {
  let component: Ok;
  let fixture: ComponentFixture<Ok>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ok]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ok);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

