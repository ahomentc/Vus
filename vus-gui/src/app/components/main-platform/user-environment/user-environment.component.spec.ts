import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEnvironmentComponent } from './user-environment.component';

describe('UserEnvironmentComponent', () => {
  let component: UserEnvironmentComponent;
  let fixture: ComponentFixture<UserEnvironmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEnvironmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
