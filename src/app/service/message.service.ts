import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private http : HttpClient
  ) { }

  async sendMessage(message: string) {
    const response: HttpResponse<any> | undefined = await this.http.post('http://localhost:5000/message', { prompt: message }, { observe: 'response' }).toPromise();
  
    if (response && response.status === 200 && response.body && response.body.bot_response) {
      const botResponse = response.body.bot_response;
      return { message: botResponse };
    } else {
      throw new Error('Error sending message to chatbot.');
    }
  }
  
  sendVessage(message: string) {
    return this.http.post<any>('http://localhost:5000/vmessage', { prompt: message });
  }
  
  
}
