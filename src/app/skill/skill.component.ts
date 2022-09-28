import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceAjaxService } from '../services/resources-ajax.service';
import { skill } from '../interfaces/skill';

@Component({
  selector: 'app-skill',
  templateUrl: './skill.component.html',
  styleUrls: ['./skill.component.css'],
})
export class SkillComponent implements OnInit {
  switchFormEdit: Boolean;
  switchFormCreate: Boolean;
  switchFormDelete: Boolean;
  resourceToDelete: [String, number | null];
  resourceToEdit: skill;
  skills: skill[];
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
      photo: ['', [Validators.required]],
      level: ['', [Validators.required]],
    });
    this.formEdit = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-, ]{0,40}$/),
        ],
      ],
      photo: ['', [Validators.required]],
      level: ['', [Validators.required]],
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }

  ngOnInit(): void {
    this.getSkill();
  }

  emit(message: any) {
    this.emitter.emit(message);
  }

  public selectLevel(level: string): number {
    switch (level) {
      case 'Inicial':
        return 1;
        break;
      case 'Intermedio':
        return 2;
        break;
      case 'Avanzado':
        return 3;
        break;
      default:
        return -1;
    }
  }

  public getSkill(): void {
    this.ajax.getSkills().subscribe((data) => {
      this.skills = data;
      this.emit(this.skills);
    });
  }

  public showCreateModal() {
    this.switchFormCreate = true;
  }

  public showDeleteModal(categoryResource: String, idResource: number | null) {
    this.switchFormDelete = true;
    this.resourceToDelete = [categoryResource, idResource];
  }

  public showEditModal(skill: skill) {
    this.resourceToEdit = skill;
    this.switchFormEdit = true;
  }

  public closeModal() {
    this.switchFormCreate = false;
    this.switchFormEdit = false;
    this.switchFormDelete = false;
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
          this.skills = this.skills.filter(
            (skill) => skill.id !== this.resourceToDelete[1]
          );
          this.emit(this.skills);
        },
        error: (err) => {
          this.emit({ msg: err.error, type: 'error' });
        },
      });

    this.closeModal();
  }

  public handleEdit($event: any) {
    let resourceToEdit = {} as skill;
    this.emit({ msg: '', type: 'loader' });

    if (!this.formEdit.valid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    let form = $event.target.parentElement.parentElement;
    resourceToEdit.id = form.id;
    resourceToEdit.name = form.name.value;
    resourceToEdit.photo = form.photo.value;
    resourceToEdit.level = form.level.value;

    this.ajax
      .editResource('skills', resourceToEdit.id, resourceToEdit)
      .subscribe({
        next: () => {
          this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });
          this.skills.forEach((skill) => {
            if (skill.id == resourceToEdit.id) {
              skill.name = resourceToEdit.name;
              skill.photo = resourceToEdit.photo;
              skill.level = resourceToEdit.level;
            }
          });
          this.emit(this.skills);
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
      photo: '',
      level: '',
    };
    this.emit({ msg: '', type: 'loader' });

    if (!this.formCreate.valid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    $event.preventDefault();
    let form = $event.target.parentElement.parentElement;

    resourceToCreate.name = form.name.value;
    resourceToCreate.photo = form.photo.value;
    resourceToCreate.level = form.level.value;

    form.reset();

    this.ajax.createResource('skills', resourceToCreate).subscribe({
      next: (data) => {
        resourceToCreate.id = data;
        this.skills.push(resourceToCreate);
        this.emit(this.skills);
        this.closeModal();
        this.emit({ msg: 'Recurso creado con exito', type: 'success-save' });
      },
      error: (data) => {
        this.emit({ msg: data.error, type: 'error' });
      },
    });

    return null;
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
