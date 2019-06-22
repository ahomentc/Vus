import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLobbyComponent } from './main-lobby.component';

describe('MainLobbyComponent', () => {
  let component: MainLobbyComponent;
  let fixture: ComponentFixture<MainLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
