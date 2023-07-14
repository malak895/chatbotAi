import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../service/message.service';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';


import { VoiceRecognitionService } from '../service/voice-recognition.service';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    
  }
}

export interface Message {
  id?: string;
  type: string;
  text?: string;
  message: string;
  liked?: boolean;
  disliked?: boolean;
  game?:boolean;
}

@Component({
  selector: 'app-chatbot-ai',
  templateUrl: './chatbot-ai.component.html',
  styleUrls: ['./chatbot-ai.component.scss']
})
export class ChatbotAiComponent implements OnInit {
  answers: string = '';
  conversation: string = '';
  questions: string = '';
  recognition: any;
  isOpen = false;
  loading = false;
  messages: Message[] = [];
  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });
  @ViewChild('scrollMe', { static: true }) private myScrollContainer: any;
  toggle = true;
  status = 'Enable';
  iconColor = 'black';
  isListening = false;
  recommendations: any;
  mostCommonMessage: string = '';
  mostCommonBot: string = '';
  message: any;

  constructor(
    public service: VoiceRecognitionService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  getMostCommonMessage() {
    this.http.get<{ most_common_message: string }>('http://localhost:5000/most_common_message')
      .subscribe(data => {
        this.mostCommonMessage = data.most_common_message;
      });
  }

  getMostCommonBot() {
    this.http.get<{ most_common_bot: string }>('http://localhost:5000/most_common_bot')
      .subscribe(data => {
        this.mostCommonBot = data.most_common_bot;
      });
  }

  ngOnInit(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          let transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript.trim() !== '') {
          this.chatForm.get('message')?.setValue(finalTranscript);
          this.sendMessage();
        }
      };
    }

    this.getMostCommonMessage();
    this.getMostCommonBot();

    setTimeout(() => {
      this.messages.push({
        type: 'client',
        message: "Hi there! What can I do for you?",
      });
      this.scrollToBottom();
    }, 500);
  }

  openSupportPopup(): void {
    this.isOpen = !this.isOpen;
  }

  async sendMessage() {
    const sendMessage = this.chatForm.value.message || '';
    this.loading = true;
    const message: Message = {
      type: 'user',
      message: sendMessage,
      liked: false,
      disliked: false,
      game:false
    };

    this.messages.push(message);

    this.chatForm.reset();
    this.scrollToBottom();
    
    try {
      const response = await this.messageService.sendMessage(sendMessage);
      this.loading = false;
      const message: Message = {
        type: 'client',
        message: response.message,
        liked: false,
        disliked: false,
        game:false
      };
      this.messages.push(message);
      
      this.saveConversation(this.conversation);
      this.scrollToBottom();
    } catch (error: any) {
      this.messages.push({
        type: 'error',
        message: error?.message,
      });
    }
  }
  
  async saveConversation(conversation: string) {
    try {
      
      const response = await this.http.post('http://localhost:5000/save-conversation', { conversation }, { observe: 'response' }).toPromise();
      const data = JSON.parse(response?.body?.toString() || '');


      console.log(data.message);
    } catch (error: any) {
      console.log(error.message);
    }
  }


  onHttpResponse(event: any) {
    const response = event.content as any;
    const message = response.message;
    this.messages.push({
      type: 'chatbot',
      message: message,
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop =
          this.myScrollContainer.nativeElement.scrollHeight + 500;
      } catch (err) {}
    }, 150);
  }

  
  enableDisableRule() {
    this.toggle = !this.toggle;
    this.status = this.toggle ? 'Enable' : 'Disable';
  }


  listen() {
    if ('webkitSpeechRecognition' in window) {
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      } else {
        this.recognition.start();
        this.isListening = true;
      }
    }
  }

  afficherReponse(): void {
    const bouton = document.getElementById("mon-bouton") as HTMLButtonElement;
    const reponse = document.getElementById("ma-reponse") as HTMLElement;
    if (reponse.style.display === "none") {
      reponse.style.display = "block";
      bouton.style.display = "none";
    } else {
      reponse.style.display = "none";
      bouton.style.display = "block";
    }
    
  }
 
  toggleListening() {
    this.isListening = !this.isListening;
  }

 
  onButtonClick() {
    this.buttonClicked = true;
    const message = {
      type: 'client',
      message: this.mostCommonBot,
    };
    this.messages.push(message);
  }
  
  // In the component class
  buttonClicked = false;
  async likeMessage(message: Message) {
    try {
      await this.http.put(`http://localhost:5000/like-message/${message.id}`, {}).toPromise();
      message.liked = true;
    } catch (error: any) {
      console.log(error.message);
    }
  }
  
  async dislikeMessage(message: Message) {
    try {
      await this.http.put(`http://localhost:5000/dislike-message/${message.id}`, {}).toPromise();
      message.disliked = true;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async playGame() {
    try {
      await this.http.post('http://localhost:5000/play_game', {}).toPromise();
      this.message.game = true;
    } catch (error: any) {
      console.log(error.message);
    }
  }
  
   // voice chatbot 
   startListening() {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'language="en-US';
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.sendVmessage(transcript);
    };
  
    recognition.start();
  }
  
  
  async sendVmessage(message: string) {
    const response: HttpResponse<any> | undefined = await this.http
    .post('http://localhost:5000/vmessage', { prompt: message }, { observe: 'response' })
    .toPromise();
  
    if (response?.status === 200) {
      const botResponse = response?.body?.bot_response;
      if (botResponse) {
        return { message: botResponse };
      } else {
        throw new Error('Invalid response from chatbot.');
      }
    } else {
      throw new Error('Error sending message to chatbot.');
    }
    
  }
  
  
  
  
  
  

  
 
  
}