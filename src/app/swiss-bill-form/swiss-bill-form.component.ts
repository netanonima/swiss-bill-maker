import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwissBillApiRestService } from "../services/swiss-bill-api-rest.service";
import { SwissBillDataSharingService } from "../services/swiss-bill-data-sharing.service";

@Component({
  selector: 'app-swiss-bill-form',
  templateUrl: './swiss-bill-form.component.html',
  styleUrls: ['./swiss-bill-form.component.css']
})
export class SwissBillFormComponent implements OnInit {
  virementForm: FormGroup;

  constructor(private fb: FormBuilder, private swissBillApiRestService: SwissBillApiRestService, private swissBillDataSharingService: SwissBillDataSharingService) {
    this.virementForm = this.fb.group({
      ibanDestinataire: ['CH9300762011623852957'],
      nomDestinataire: ['Jean Dupont'],
      rueDestinataire: ['Rue Exemple'],
      numeroRueDestinataire: ['10'],
      codePostalDestinataire: [1000],
      localiteDestinataire: ['Lausanne'],
      numeroReference: [123456789012345678901],
      nomEmetteur: ['Marie Curie'],
      rueEmetteur: ['Rue de la Science'],
      numeroRueEmetteur: ['42'],
      codePostalEmetteur: [1015],
      localiteEmetteur: ['Lausanne'],
      monnaie: ['CHF'],
      montant: [100.50]
    });
  }

  ngOnInit(): void {
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
