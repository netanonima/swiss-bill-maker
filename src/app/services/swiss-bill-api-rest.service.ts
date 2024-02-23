import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SwissBillFormData } from './../models/swiss-bill-form-data.model';

@Injectable({
  providedIn: 'root'
})
export class SwissBillApiRestService {
  private apiUrl = 'http://localhost:3000/generate-pdf'; // URL de votre API

  constructor(private http: HttpClient) {}

  generatePdf(formData: SwissBillFormData): Observable<Blob> {
    return this.http.post('http://localhost:3000/generate-pdf', formData, { responseType: 'blob' });
  }

}
