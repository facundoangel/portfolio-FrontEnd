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
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      institution: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
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
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      institution: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      dateStart: ['', [Validators.required]],
      dateEnd: ['', []],
      now: [false, []],
    });
  }

  public getEducations(): void {
    this.ajax.getEducations().subscribe((data) => {
      this.educations = data.reverse();
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }
  ngOnInit(): void {
    this.getEducations();
  }

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
    let resourceToEdit = {} as education;

    this.emit({ msg: '', type: 'loader' });

    if (this.formEdit.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    let form = $event.target.parentElement.parentElement;
    resourceToEdit.id = form.id;
    resourceToEdit.name = form.name.value;
    resourceToEdit.institution = form.institution.value;
    resourceToEdit.dateStart = form.dateStart.value;
    resourceToEdit.dateEnd = form.now.checked ? 'Presente' : form.dateEnd.value;
    resourceToEdit.title = form.title.value;

    this.ajax
      .editResource('educations', resourceToEdit.id, resourceToEdit)
      .subscribe({
        next: () => {
          this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });
          this.educations.forEach((education) => {
            if (education.id == resourceToEdit.id) {
              education.name = resourceToEdit.name;
              education.institution = resourceToEdit.institution;
              education.dateStart = resourceToEdit.dateStart;
              education.dateEnd = resourceToEdit.dateEnd;
              education.title = resourceToEdit.title;
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
    let resourceToCreate = {
      id: null,
      name: '',
      institution: '',
      title: '',
      dateStart: '',
      dateEnd: '',
    };

    this.emit({ msg: '', type: 'loader' });

    if (this.formCreate.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    $event.preventDefault();

    let form = $event.target.parentElement.parentElement;

    resourceToCreate.name = form.name.value;
    resourceToCreate.institution = form.institution.value;
    resourceToCreate.title = form.title.value;
    resourceToCreate.dateStart = form.dateStart.value;
    resourceToCreate.dateEnd = form.now.checked
      ? 'Presente'
      : form.dateEnd.value;

    form.reset();

    this.ajax.createResource('educations', resourceToCreate).subscribe({
      next: (data) => {
        resourceToCreate.id = data;
        this.educations.unshift(resourceToCreate);

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
