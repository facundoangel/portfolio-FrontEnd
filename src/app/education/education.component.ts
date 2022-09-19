import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ResourceAjaxService } from '../services/resources-ajax.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { education } from '../interfaces/education';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
})
export class EducationComponent implements OnInit {
  switchFormEdit: Boolean;
  switchFormCreate: Boolean;
  switchFormDelete: Boolean;
  resourceToDelete: [String, number | null];
  resourceToEdit: education;
  resourceToCreate: any = {
    id: null,
    name: '',
    institution: '',
    title: '',
    dateStart: '',
    dateEnd: '',
  };
  educations: education[];
  formEdit: FormGroup;
  formCreate: FormGroup;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private Auth: AuthService,
    private formBuilder: FormBuilder,
    private ajax: ResourceAjaxService
  ) {
    this.formCreate = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      institution: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      dateStart: ['', [Validators.required]],
      dateEnd: ['', []],
      now: [false, []],
    });
    this.formEdit = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      institution: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      dateStart: ['', [Validators.required]],
      dateEnd: ['', []],
      now: [false, []],
    });
    this.getEducations();
  }

  public getEducations(): void {
    this.ajax.getEducations().subscribe((data) => {
      this.educations = data.reverse();
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }
  ngOnInit(): void {}

  emit(message: any) {
    this.emitter.emit(message);
  }

  public showCreateModal() {
    this.switchFormCreate = true;
  }

  public showDeleteModal(categoryResource: String, idResource: number | null) {
    this.switchFormDelete = true;
    this.resourceToDelete = [categoryResource, idResource];
  }

  public showEditModal(education: education) {
    this.resourceToEdit = education;
    this.switchFormEdit = true;
    if (education.dateEnd == 'Presente') {
      this.formEdit.get('dateEnd')?.disable();
    }
  }

  public closeModal() {
    this.switchFormCreate = false;
    this.switchFormEdit = false;
    this.switchFormDelete = false;
  }

  public convertDate(date: string): string {
    if (date == 'Presente') {
      return date;
    }
    return new Date(date).toLocaleDateString();
  }

  public isPresent(date: string): any {
    return date == 'Presente' ? true : false;
  }

  public handleDelete() {
    this.emit({ msg: '', type: 'loader' });
    this.ajax
      .deleteResource(this.resourceToDelete[0], this.resourceToDelete[1])
      .subscribe({
        next: () => {
          this.emit({
            msg: 'Recurso eliminado con exito',
            type: 'success-del',
          });
          this.educations = this.educations.filter(
            (educations) => educations.id !== this.resourceToDelete[1]
          );
        },
        error: (err) => {
          this.emit({ msg: err.error, type: 'error' });
        },
      });

    this.closeModal();
  }

  public handleEdit($event: any) {
    this.emit({ msg: '', type: 'loader' });

    if (this.formEdit.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    let form = $event.target.parentElement.parentElement;
    this.resourceToEdit.id = form.id;
    this.resourceToEdit.name = form.name.value;
    this.resourceToEdit.institution = form.institution.value;
    this.resourceToEdit.dateStart = form.dateStart.value;
    this.resourceToEdit.dateEnd = form.now.checked
      ? 'Presente'
      : form.dateEnd.value;
    this.resourceToEdit.title = form.title.value;

    this.ajax
      .editResource('educations', this.resourceToEdit.id, this.resourceToEdit)
      .subscribe({
        next: () => {
          this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });
          this.educations.forEach((education) => {
            if (education.id == this.resourceToEdit.id) {
              education.name = this.resourceToEdit.name;
              education.institution = this.resourceToEdit.institution;
              education.dateStart = this.resourceToEdit.dateStart;
              education.dateEnd = this.resourceToEdit.dateEnd;
              education.title = this.resourceToEdit.title;
            }
          });
        },
        error: (err) => {
          this.emit({ msg: err.error, type: 'error' });
        },
      });

    form.reset();

    this.closeModal();
    return null;
  }

  public handleCreate($event: any) {
    this.emit({ msg: '', type: 'loader' });

    if (this.formCreate.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    $event.preventDefault();
    let form = $event.target.parentElement.parentElement;

    this.resourceToCreate.name = form.name.value;
    this.resourceToCreate.institution = form.institution.value;
    this.resourceToCreate.title = form.title.value;
    this.resourceToCreate.dateStart = form.dateStart.value;
    this.resourceToCreate.dateEnd = form.now.checked
      ? 'Presente'
      : form.dateEnd.value;

    form.reset();

    this.ajax.createResource('educations', this.resourceToCreate).subscribe({
      next: (data) => {
        this.resourceToCreate.id = data;
        this.educations.unshift(this.resourceToCreate);

        this.emit({ msg: 'Recurso creado con exito', type: 'success-save' });
      },

      error: (err) => {
        this.emit({ msg: err.error, type: 'error' });
      },
    });

    this.closeModal();
    return null;
  }

  public handleChangeCheckbox($event: any) {
    const element =
      $event.target.parentElement.previousElementSibling.previousElementSibling
        .children[1];
    const value = $event.target.checked;

    if (value) {
      element.disabled = true;
    } else {
      element.disabled = false;
    }
  }

  public handleValidationCreate($event: any) {
    const element = $event.target;

    if (
      this.formCreate
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute('data-validation', 'Campo requerido');
    } else if (
      this.formCreate
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
      !this.formCreate
        .get(element.getAttribute('formControlName'))
        ?.hasError('required') &&
      !this.formCreate
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.parentElement.setAttribute('data-validation', '');
    }
  }

  public handleValidationEdit($event: any) {
    const element = $event.target;

    if (
      this.formEdit
        .get(element.getAttribute('formControlName'))
        ?.hasError('required')
    ) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
      element.parentElement.setAttribute('data-validation', 'Campo requerido');
    } else if (
      this.formEdit
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
      !this.formEdit
        .get(element.getAttribute('formControlName'))
        ?.hasError('required') &&
      !this.formEdit
        .get(element.getAttribute('formControlName'))
        ?.hasError('pattern')
    ) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.parentElement.setAttribute('data-validation', '');
    }
  }
}
