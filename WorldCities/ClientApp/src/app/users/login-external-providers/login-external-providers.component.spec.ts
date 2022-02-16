import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginExternalProvidersComponent } from './login-external-providers.component';

describe('LoginExternalProvidersComponent', () => {
  let component: LoginExternalProvidersComponent;
  let fixture: ComponentFixture<LoginExternalProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginExternalProvidersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginExternalProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
