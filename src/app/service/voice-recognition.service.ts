
import { Injectable } from '@angular/core';
 
declare var webkitSpeechRecognition:any
 
@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
 
  recognition =  new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  public text = '';
  tempWords!: string;
 
  constructor() { }
 
  init() {
 
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
 
    this.recognition.addEventListener('result', (e: { results: SpeechRecognitionResultList }) => {
      const transcript: string = Array.from(e.results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((result: SpeechRecognitionAlternative) => result.transcript)
        .join('');
      this.tempWords = transcript;
      console.log(transcript);
    });
    
  }
  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    console.log("Speech recognition started")
    this.recognition.addEventListener('end', () => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
        console.log("")
      } else {
        this.wordConcat()
        this.recognition.start();
      }
    });
  }
  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat()
    this.recognition.stop();
    console.log("")
  }
 
  wordConcat() {
    this.text = this.text + ' ' + this.tempWords + '.';
    this.tempWords = '';
  }
}