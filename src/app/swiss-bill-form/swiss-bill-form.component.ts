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

  constructor(private fb: FormBuilder, private swissBillApiRestService: SwissBillApiRestService, private swissBillDataSharingService: SwissBillDataSharingService) {
    this.virementForm = this.fb.group({
      ibanDestinataire: ['CH9300762011623852957', [Validators.required, ibanValidator()]],
      nomDestinataire: ['Jean Dupont', [Validators.required, Validators.maxLength(70)]],
      rueDestinataire: ['Rue Exemple', [Validators.required, Validators.maxLength(70)]],
      numeroRueDestinataire: ['10', [Validators.required, Validators.maxLength(16)]],
      codePostalDestinataire: [1000, [Validators.required, Validators.maxLength(16), numericValidator()]],
      localiteDestinataire: ['Lausanne', [Validators.required, Validators.maxLength(35)]],
      paysDestinataire: ['CH', Validators.required],
      numeroReference: ['012345678901234567899', [Validators.minLength(5), Validators.maxLength(21), numericValidator()]],
      nomEmetteur: ['Marie Curie', [Validators.required, Validators.maxLength(70)]],
      rueEmetteur: ['Rue de la Science', [Validators.required, Validators.maxLength(70)]],
      numeroRueEmetteur: ['42', [Validators.required, Validators.maxLength(16)]],
      codePostalEmetteur: [1015, [Validators.required, Validators.maxLength(16), numericValidator()]],
      localiteEmetteur: ['Lausanne', [Validators.required, Validators.maxLength(35)]],
      paysEmetteur: ['CH', Validators.required],
      monnaie: ['CHF', Validators.required],
      montant: ['100.50', [Validators.required, montantValidator()]],
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
    if (this.virementForm.valid) {
      console.log(this.virementForm.value);
      this.swissBillApiRestService.generatePdf(this.virementForm.value).subscribe(pdfBlob => {
        this.swissBillDataSharingService.updatePdfData(pdfBlob);
      });
    } else {
      console.log('Le formulaire n\'est pas valide');
    }
  }
}
