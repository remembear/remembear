import { Component } from '@angular/core';
import { ApiService } from './api.service';

interface Word {
  japanese: string,
  kana: string,
  translation: string,
  info: string,
  audio: string
}

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./app.component.css']
})
export class MainComponent {
  private word: Word;
  private answer: string;
  private bgColor: string;
  private wordView: boolean;

  constructor(private apiService: ApiService) {
    this.next();
  }

  private check() {
    if (this.answer && this.answer.length > 0) {
      if (this.answer === this.word.japanese) {
        this.bgColor = 'PaleGreen';
        setTimeout(this.next.bind(this), 2500);
      } else {
        this.bgColor = 'LightCoral';
        setTimeout(() => this.wordView = true, 2500);
      }
      this.playAudio();
    }
  }

  private next() {
    this.wordView = false;
    this.answer = null;
    this.bgColor = 'White';
    this.apiService.getRandomWord()
      .then(this.setWord.bind(this));
  }

  private setWord(word: {}) {
    let audio = word["Vocab-audio"];
    audio = 'http://localhost:8060/'+audio.slice(7, audio.length-1);
    let info = [];
    if (word["Part of speech"]) info.push(word["Part of speech"]);
    if (word["Word-type"]) info.push(word["Word-type"]);
    //if (word["Vocab-structure"]) info.push("("+word["Vocab-structure"]+")");
    if (word["Vocab-RTK"]) info.push(word["Vocab-RTK"]);
    this.word = {
      japanese: word["Vocab-japan"],
      kana: word["Vocab-kana"],
      translation: word["Vocab-translation"],
      info: info.join(', '),
      audio: audio
    }
  }

  private playAudio() {
    if (this.word) {
      let audio = new Audio();
      audio.src = this.word.audio;
      audio.load();
      audio.play();
    }
  }
}
