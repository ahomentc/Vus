import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionContainerComponent } from './suggestion-container.component';

describe('SuggestionContainerComponent', () => {
  let component: SuggestionContainerComponent;
  let fixture: ComponentFixture<SuggestionContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
