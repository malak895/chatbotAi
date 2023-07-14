import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotAiComponent } from './chatbot-ai.component';

describe('ChatbotAiComponent', () => {
  let component: ChatbotAiComponent;
  let fixture: ComponentFixture<ChatbotAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotAiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
