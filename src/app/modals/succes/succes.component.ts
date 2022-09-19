import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-succes',
  templateUrl: './succes.component.html',
  styleUrls: ['./succes.component.css'],
})
export class SuccesComponent implements OnInit {
  @Output() emitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() message: any;
  @Input() icon: String;

  constructor() {}

  ngOnInit(): void {}

  public closeModal() {
    this.emitter.emit(false);
  }
}
