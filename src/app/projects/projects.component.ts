import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { project } from '../interfaces/project';
import { skill } from '../interfaces/skill';
import { ResourceAjaxService } from '../services/resources-ajax.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  switchFormEdit: Boolean;
  switchFormCreate: Boolean;
  switchFormDelete: Boolean;
  switchInputTech: Boolean = false;

  resourceToDelete: [String, number | null];
  resourceToEdit: project;
  projects: project[];
  technologies: skill[];
  formEdit: FormGroup;
  formCreate: FormGroup;
  @Input() skillToReceived: any[];
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
      photo: ['', [Validators.required]],
      description: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,300}$/),
        ],
      ],
      url: ['', [Validators.required]],
      tecnologies: ['', []],
    });
    this.formEdit = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,40}$/),
        ],
      ],
      photo: ['', [Validators.required]],
      description: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Záéíóú\.()\-,ñÑ ]{0,300}$/),
        ],
      ],
      url: ['', [Validators.required]],
      tecnologies: ['', []],
    });
  }

  public get isOnLine(): boolean {
    return this.Auth.logIn;
  }

  ngOnInit(): void {
    this.getProjects();
    this.getTecnologies();
  }

  emit(message: any) {
    this.emitter.emit(message);
  }

  public transformString(string: string) {
    let stringOutput: string = string;
    stringOutput = stringOutput.replace(/"/g, '');

    return stringOutput;
  }

  public getProjects(): void {
    this.ajax.getProjects().subscribe((data) => {
      this.projects = data.reverse();
    });
  }

  public getTecnologies() {
    let arrayOutput: any = [];
    this.ajax.getSkills().subscribe((data) => {
      this.technologies = data;
    });
  }

  public showCreateModal() {
    this.switchFormCreate = true;
  }

  public showDeleteModal(categoryResource: String, idResource: number | null) {
    this.switchFormDelete = true;
    this.resourceToDelete = [categoryResource, idResource];
  }

  public showEditModal(project: project) {
    this.resourceToEdit = project;
    this.switchFormEdit = true;
  }

  public closeModal() {
    this.switchFormCreate = false;
    this.switchFormEdit = false;
    this.switchFormDelete = false;
  }

  public showInputTech() {
    this.switchInputTech = !this.switchInputTech;
  }

  public resetInputTech($event: any) {
    let contentInputs =
      $event.target.parentElement.parentElement.children[2].children;

    for (let i = 0; i < contentInputs.length; i++) {
      if (i > 1) {
        contentInputs[i].children[0].checked = false;
      }
    }
    this.showInputTech();
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
          this.projects = this.projects.filter(
            (project) => project.id !== this.resourceToDelete[1]
          );
        },
        error: (err) => {
          this.emit({ msg: err.error, type: 'error' });
        },
      });

    this.closeModal();
  }

  public handleEdit($event: any) {
    let resourceToEdit = {} as project;
    this.emit({ msg: '', type: 'loader' });

    let imgTecnologies: any[] = [];

    if (this.formEdit.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    let form = $event.target.parentElement.parentElement;
    let techForm =
      form.children[0].children[1].children[0].children[2].children;
    let technologiesToSend: string[] = [];

    resourceToEdit.id = form.id;
    resourceToEdit.name = form.name.value;
    resourceToEdit.photo = form.photo.value;
    resourceToEdit.description = form.description.value;
    resourceToEdit.url = form.url.value;

    for (let i = 0; i < techForm.length; i++) {
      if (i > 1) {
        if (techForm[i].children[0].checked) {
          technologiesToSend.push(techForm[i].children[0].value);
          imgTecnologies.push(techForm[i].children[1].src);
        }
      }
    }

    resourceToEdit.tecnologies = technologiesToSend;

    console.log(resourceToEdit);

    this.ajax
      .editResource('projects', resourceToEdit.id, resourceToEdit)
      .subscribe({
        next: () => {
          this.emit({ msg: 'Recurso editado con exito', type: 'success-save' });
          this.projects.forEach((project) => {
            if (project.id == resourceToEdit.id) {
              project.name = resourceToEdit.name;
              project.photo = resourceToEdit.photo;
              project.description = resourceToEdit.description;
              project.url = resourceToEdit.url;
              project.tecnologies = imgTecnologies;
            }
          });
        },
        error: (err) => {
          this.emit({ msg: err.error, type: 'error' });
        },
      });
    this.closeModal();
    form.reset();
    return null;
  }

  public handleCreate($event: any) {
    let resourceToCreate = {
      id: null,
      name: '',
      photo: '',
      description: '',
      url: '',
      tecnologies: [''],
    };
    this.emit({ msg: '', type: 'loader' });

    let imgTecnologies: any[] = [];

    if (this.formCreate.invalid) {
      this.emit({ msg: 'Revise los datos introducidos', type: 'error' });
      return null;
    }

    $event.preventDefault();
    let form = $event.target.parentElement.parentElement;
    let techForm =
      form.children[0].children[1].children[0].children[2].children;
    let technologiesToSend: string[] = [];

    resourceToCreate.name = form.name.value;
    resourceToCreate.photo = form.photo.value;
    resourceToCreate.description = form.description.value;
    resourceToCreate.url = form.url.value;

    for (let i = 0; i < techForm.length; i++) {
      if (i > 1) {
        if (techForm[i].children[0].checked) {
          technologiesToSend.push(techForm[i].children[0].value);
          imgTecnologies.push(techForm[i].children[1].src);
        }
      }
    }

    resourceToCreate.tecnologies = technologiesToSend;

    form.reset();

    this.ajax.createResource('projects', resourceToCreate).subscribe({
      next: (data) => {
        resourceToCreate.id = data;
        resourceToCreate.tecnologies = imgTecnologies;
        this.projects.unshift(resourceToCreate);
        this.emit({ msg: 'Recurso creado con exito', type: 'success-save' });
      },
      error: (data) => {
        this.emit({ msg: data.error, type: 'error' });
      },
    });

    this.closeModal();
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
