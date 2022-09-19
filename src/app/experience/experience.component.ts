import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceAjaxService } from '../services/resources-ajax.service';
import { Experience } from '../interfaces/experience';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
})
export class ExperienceComponent implements OnInit {
  switchFormEdit: Boolean;
  switchFormCreate: Boolean;
  switchFormDelete: Boolean;
  resourceToDelete: [String, number | null];
  resourceToEdit: Experience;
  resourceToCreate: any = {
    id: null,
    position: '',
    company: '',
    dateStart: '',
    dateEnd: '',
    tasks: '',
  };
  experiences: Experience[];
  formEdit: FormGroup;
  formCreate: FormGroup;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private Auth: AuthService,
    private formBuilder: FormBuilder,
    private ajax: ResourceAjaxService
  ) {
    this.formCreate = this.formBuilder.group({
      empresa: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      puesto: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      tareas: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,200}$/),
        ],
      ],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', []],
      presente: ['', []],
    });
    this.formEdit = this.formBuilder.group({
      empresa: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      puesto: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      tareas: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,200}$/),
        ],
      ],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', []],
      presente: ['', []],
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }

  ngOnInit(): void {
    this.getExperiences();
  }

  emit(message: any) {
    this.emitter.emit(message);
  }

  public getExperiences(): void {
    this.ajax.getExperiences().subscribe((data) => {
      this.experiences = data.reverse();
      //console.log(this.experiences);
    });
  }

  public showCreateModal() {
    this.switchFormCreate = true;
  }

  public showDeleteModal(categoryResource: String, idResource: number | null) {
    this.switchFormDelete = true;
    this.resourceToDelete = [categoryResource, idResource];
  }

  public showEditModal(experience: Experience) {
    this.resourceToEdit = experience;
    this.switchFormEdit = true;
    if (experience.dateEnd == 'Presente') {
      this.formEdit.get('fechaFin')?.disable();
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
    return date == 'Presente' ? true : null;
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
          this.experiences = this.experiences.filter(
            (experience) => experience.id !== this.resourceToDelete[1]
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
    this.resourceToEdit.position = form.position.value;
    this.resourceToEdit.company = form.company.value;
    this.resourceToEdit.dateStart = form.dateStart.value;
    this.resourceToEdit.dateEnd = form.presente.checked
      ? 'Presente'
      : form.dateEnd.value;

    this.resourceToEdit.tasks = form.tasks.value;

    this.ajax
      .editResource('experiences', this.resourceToEdit.id, this.resourceToEdit)
      .subscribe({
        next: () => {
          this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });
          this.experiences.forEach((experience) => {
            if (experience.id == this.resourceToEdit.id) {
              experience.position = this.resourceToEdit.position;
              experience.company = this.resourceToEdit.company;
              experience.dateStart = this.resourceToEdit.dateStart;
              experience.dateEnd = this.resourceToEdit.dateEnd;
              experience.tasks = this.resourceToEdit.tasks;
            }
          });
        },
        error: (data) => {
          this.emit({ msg: data.error, type: 'error' });
        },
      });
    this.closeModal();
    form.reset();
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

    this.resourceToCreate.position = form.position.value;
    this.resourceToCreate.company = form.company.value;
    this.resourceToCreate.dateStart = form.dateStart.value;
    this.resourceToCreate.dateEnd = form.now.checked
      ? 'Presente'
      : form.dateEnd.value;
    this.resourceToCreate.tasks = form.tasks.value;

    form.reset();

    this.ajax.createResource('experiences', this.resourceToCreate).subscribe({
      next: (data) => {
        console.log(data);
        this.resourceToCreate.id = data;
        this.experiences.unshift(this.resourceToCreate);
        this.closeModal();
        this.emit({ msg: 'Recurso creado con exito', type: 'success-save' });
      },
      error: (data) => {
        this.emit({ msg: data.error, type: 'error' });
      },
    });
    return null;
  }

  public handleChangeCheckbox($event: any) {
    const element =
      $event.target.parentElement.previousElementSibling.previousElementSibling
        .children[1];
    const value = $event.target.checked;

    if (value) {
      element.disabled = true;
      element.classList.remove('is-valid');
      element.classList.remove('is-invalid');
      element.parentElement.setAttribute('data-validation', '');
      element.value = '';
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
