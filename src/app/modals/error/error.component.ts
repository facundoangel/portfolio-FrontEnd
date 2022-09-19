import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent implements OnInit {
  @Output() emitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() message: any;

  constructor() {}

  ngOnInit(): void {}

  public closeModal() {
    this.emitter.emit(false);
  }
}
