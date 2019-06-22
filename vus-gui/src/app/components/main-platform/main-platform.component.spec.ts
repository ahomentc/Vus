import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPlatformComponent } from './main-platform.component';

describe('MainPlatformComponent', () => {
  let component: MainPlatformComponent;
  let fixture: ComponentFixture<MainPlatformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPlatformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
