import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SwissBillApiRestService } from "../services/swiss-bill-api-rest.service";
import { SwissBillDataSharingService } from "../services/swiss-bill-data-sharing.service";
import { CountrySimplified} from "../models/country-simplified.model";

function ibanValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // laissez le validateur required gérer l'absence de valeur
    }
    const isValidIban = value.startsWith('CH') || value.startsWith('LI');
    const hasCorrectLength = value.length === 21;
    const noSpaces = !/\s/.test(value);
    return isValidIban && hasCorrectLength && noSpaces ? null : { invalidIban: true };
  };
}

function numericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && !/^\d+$/.test(value)) {
      return { nonNumeric: true };
    }
    return null;
  };
}

function montantValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }

    if (!/^\d+(\.\d+)?$/.test(value)) {
      return { invalidFormat: true };
    }

    const parts = value.toString().split('.');
    if (parts.length === 2 && parts[1].length !== 2) {
      return { incorrectDecimals: true };
    }

    if (/^0\d/.test(value)) {
      return { leadingZero: true };
    }

    return null; // Valide
  };
}

@Component({
  selector: 'app-swiss-bill-form',
  templateUrl: './swiss-bill-form.component.html',
  styleUrls: ['./swiss-bill-form.component.css']
})
export class SwissBillFormComponent implements OnInit {
  virementForm: FormGroup;
  countryList: CountrySimplified[] = [];
  loading: boolean = false;

  constructor(private fb: FormBuilder, private swissBillApiRestService: SwissBillApiRestService, private swissBillDataSharingService: SwissBillDataSharingService) {
    this.virementForm = this.fb.group({
      ibanDestinataire: ['', [Validators.required, ibanValidator()]],
      nomDestinataire: ['', [Validators.required, Validators.maxLength(70)]],
      rueDestinataire: ["", [Validators.required, Validators.maxLength(70)]],
      numeroRueDestinataire: ['', [Validators.required, Validators.maxLength(16)]],
      codePostalDestinataire: ['', [Validators.required, Validators.maxLength(16), numericValidator()]],
      localiteDestinataire: ['', [Validators.required, Validators.maxLength(35)]],
      paysDestinataire: ['', Validators.required],
      numeroReferenceType: ['', Validators.required],
      numeroReference: ['', [Validators.minLength(5), Validators.maxLength(21), numericValidator()]],
      nomEmetteur: ['', [Validators.required, Validators.maxLength(70)]],
      rueEmetteur: ["", [Validators.required, Validators.maxLength(70)]],
      numeroRueEmetteur: ['', [Validators.required, Validators.maxLength(16)]],
      codePostalEmetteur: ['', [Validators.required, Validators.maxLength(16), numericValidator()]],
      localiteEmetteur: ['', [Validators.required, Validators.maxLength(35)]],
      paysEmetteur: ['', Validators.required],
      monnaie: ['', Validators.required],
      montant: ['', [Validators.required, montantValidator()]],
      additionalInformation: ['', Validators.maxLength(140)]
    });
  }

  ngOnInit(): void {
    this.swissBillApiRestService.getCountries('fr').subscribe(data => {
      this.countryList = data;
      console.log(this.countryList);
    });
  }

  onSubmit() {
    this.loading = true;
    if (this.virementForm.valid) {
      console.log(this.virementForm.value);
      if(this.virementForm.value.numeroReferenceType === 'NONE') this.virementForm.value.numeroReference = '';
      this.swissBillApiRestService.generatePdf(this.virementForm.value).subscribe(pdfBlob => {
        this.swissBillDataSharingService.updatePdfData(pdfBlob);
        this.loading = false;
      });
    } else {
      console.log('Le formulaire n\'est pas valide');
    }
  }
}
