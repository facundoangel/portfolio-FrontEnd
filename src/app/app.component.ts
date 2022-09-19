import { Component } from '@angular/core';
import { skill } from './interfaces/skill';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  skillToSend: any[] = [];
  message: any;
  switchSucces: boolean = false;
  switchError: boolean = false;
  switchLoader: boolean = false;
  icon: string;

  skillEmiter(param: any) {
    if (param.type != undefined) {
      this.notification(param);
    } else {
      this.skillToSend = param;
    }
  }

  closeModalSucces(param: boolean) {
    this.switchSucces = param;
  }

  closeModalError(param: boolean) {
    this.switchError = param;
  }

  notification(message: any) {
    this.message = message;

    if (this.message.type === 'success-save') {
      this.switchSucces = true;
      this.switchLoader = false;
      this.icon = '../../../assets/success-save.png';
    } else if (this.message.type === 'success-del') {
      this.switchSucces = true;
      this.switchLoader = false;
      this.icon = '../../../assets/success-del.png';
    } else if (this.message.type === 'success-login') {
      this.switchSucces = true;
      this.switchLoader = false;
      this.icon = '../../../assets/success-login.png';
    } else if (this.message.type === 'loader') {
      this.switchLoader = true;
    } else if (this.message.type === 'error') {
      this.switchError = true;
      this.switchLoader = false;
    }
  }
}
