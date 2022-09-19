import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceAjaxService {
  deleteStatus: String;
  url: String = 'http://localhost:8080/';
  emitter: any;

  constructor(private http: HttpClient) {}

  public setEmitter(param: any) {
    this.emitter = param;
  }

  public showNotification(message: any) {
    this.emitter.emit(JSON.stringify(message));
  }

  getExperiences(): Observable<any> {
    return this.http.get(`${this.url}experiences`);
  }

  getEducations(): Observable<any> {
    return this.http.get(`${this.url}educations`);
  }

  getSkills(): Observable<any> {
    //console.log(this.http.get(`${this.url}skills`));
    return this.http.get(`${this.url}skills`);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.url}projects`);
  }

  getPhoto(): Observable<any> {
    return this.http.get(`${this.url}info/1`);
  }

  getDescription(): Observable<any> {
    return this.http.get(`${this.url}info/2`);
  }

  deleteResource(category: String, id: Number | null): Observable<any> {
    return this.http.delete(
      `${this.url}${category}/${id}/${sessionStorage.getItem(
        'id'
      )}/${sessionStorage.getItem('tk')}`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text',
      }
    );
  }

  editResource(
    category: String,
    id: Number | null,
    data: any
  ): Observable<any> {
    return this.http.put(
      `${this.url}${category}/${id}`,
      {
        data,
        tk: sessionStorage.getItem('tk'),
        id: sessionStorage.getItem('id'),
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text',
      }
    );
  }

  createResource(category: String, data: any): Observable<any> {
    console.log({
      data,
      tk: sessionStorage.getItem('tk'),
      id: sessionStorage.getItem('id'),
    });
    return this.http.post(
      `${this.url}${category}`,
      {
        data,
        tk: sessionStorage.getItem('tk'),
        id: sessionStorage.getItem('id'),
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text',
      }
    );
  }
}
