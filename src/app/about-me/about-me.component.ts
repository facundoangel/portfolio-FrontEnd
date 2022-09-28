import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceAjaxService } from '../services/resources-ajax.service';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent implements OnInit {
  switchFormPhoto: Boolean;
  switchFormDescrip: Boolean;
  formPhoto: FormGroup;
  formDescrip: FormGroup;
  Photo: any = { id: '', description: '' };
  Description: any = { id: '', description: '' };
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private Auth: AuthService,
    private formBuilder: FormBuilder,
    private ajax: ResourceAjaxService
  ) {
    this.formPhoto = this.formBuilder.group({
      url: ['', [Validators.required]],
    });
    this.formDescrip = this.formBuilder.group({
      descrip: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]+$/)],
      ],
    });

    this.ajax.getDescription().subscribe((data) => {
      this.Description = data;
    });
    this.ajax.getPhoto().subscribe((data) => {
      this.Photo = data;
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }

  ngOnInit(): void {}

  emit(message: any) {
    this.emitter.emit(message);
  }

  public showModalPhoto() {
    this.switchFormPhoto = true;
  }

  public closeModalPhoto() {
    this.switchFormPhoto = false;
  }

  public showModalDescrip() {
    this.switchFormDescrip = true;
  }

  public closeModalDescrip() {
    this.switchFormDescrip = false;
  }

  public handleEdit($event: any) {
    $event.preventDefault();
    console.log();
    this.emit({ msg: '', type: 'loader' });

    if ($event.target.parentElement.parentElement.id == 1) {
      if (this.formPhoto.invalid) {
        this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
        return null;
      }
    } else {
      if (this.formDescrip.invalid) {
        this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
        return null;
      }
    }

    this.closeModalDescrip();
    this.closeModalPhoto();
    let description =
      $event.target.parentElement.parentElement.children[0].children[1].value;

    let id = $event.target.parentElement.parentElement.id;

    this.ajax.editResource('info', id, { id, description }).subscribe({
      next: () => {
        this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });

        if (id == 1) {
          this.Photo.description = description;
        } else if (id == 2) {
          this.Description.description = description;
        }
      },
      error: (err) => {
        this.emit({ msg: err.error, type: 'error' });
      },
    });
    return null;
  }

  public handleValidationPhoto($event: any) {
    const element = $event.target;

    if (
      this.formPhoto
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute('data-validation', 'Campo requerido');
    } else if (
      !this.formPhoto
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.parentElement.setAttribute('data-validation', '');
    }
  }

  public handleValidationDes($event: any) {
    const element = $event.target;

    if (
      this.formDescrip
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute('data-validation', 'Campo requerido');
    } else if (
      this.formDescrip
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute(
        'data-validation',
        'formato incorrecto'
      );
    } else if (
      !this.formDescrip
        .get(element.getAttribute('formControlName'))
        ?.hasError('required') &&
      !this.formDescrip
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.parentElement.setAttribute('data-validation', '');
    }
  }
}
