import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface FormData {
  ibanDestinataire: string;
  nomDestinataire: string;
  rueDestinataire: string;
  numeroRueDestinataire: string;
  codePostalDestinataire: number;
  localiteDestinataire: string;
  numeroReference?: number;
  nomEmetteur: string;
  rueEmetteur: string;
  numeroRueEmetteur: string;
  codePostalEmetteur: number;
  localiteEmetteur: string;
  monnaie: string;
  montant: number;
}

@Injectable({
  providedIn: 'root'
})
export class SwissBillDataSharingService {
  private formData = new BehaviorSubject<FormData | null>(null);
  currentFormData = this.formData.asObservable();

  constructor() { }

  updateFormData(data: FormData) {
    this.formData.next(data);
  }
}
