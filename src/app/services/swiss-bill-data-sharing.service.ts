import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwissBillDataSharingService {
  private pdfData = new BehaviorSubject<Blob | null>(null);
  currentPdfData = this.pdfData.asObservable();

  constructor() { }

  updatePdfData(data: Blob) {
    this.pdfData.next(data);
  }
}
