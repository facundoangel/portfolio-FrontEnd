import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  switchForm: Boolean;
  form: FormGroup;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('videoBanner') video: ElementRef;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2
  ) {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(/^\w*$/)]],
      user: ['', [Validators.required, Validators.pattern(/^\w*$/)]],
    });
  }

  ngOnInit(): void {
    this.switchForm = false;
  }

  emit(message: any) {
    this.emitter.emit(message);
  }

  public closeSession() {
    this.auth.closeseSession();
  }

  public get isOnLine(): boolean {
    return this.auth.logIn;
  }

  public showModal() {
    this.switchForm = true;
  }

  public closeModal() {
    this.switchForm = false;
  }

  public createSession(event: any) {
    this.emit({ msg: '', type: 'loader' });

    if (this.form.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return;
    }

    let form = event.target.parentElement.parentElement;
    let user = form.usuario.value;
    let pass = form.contrasenia.value;

    this.auth.createSession(user, pass).subscribe({
      next: (data) => {
        let dataJSON = JSON.parse(data);
        sessionStorage.setItem('tk', dataJSON.identified);
        sessionStorage.setItem('id', dataJSON.id);
        this.emit({ msg: 'Sesión iniciada con exito', type: 'success-login' });
      },
      error: (err) => {
        this.emit({ msg: err.error, type: 'error' });
      },
    });
    this.switchForm = false;
    return;
  }

  public handleValidation($event: any) {
    const element = $event.target;

    if (
      this.form
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute('data-validation', 'Campo requerido');
    } else if (
      this.form
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute(
        'data-validation',
        'Solo se permiten caracteres alfanumericos'
      );
    } else if (
      !this.form
        .get(element.getAttribute('formControlName'))
        ?.hasError('required') &&
      !this.form
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.parentElement.setAttribute('data-validation', '');
    }
  }
}
