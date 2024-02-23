import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwissBillDataSharingService} from "../swiss-bill-data-sharing.service";

@Component({
  selector: 'app-swiss-bill-form',
  templateUrl: './swiss-bill-form.component.html',
  styleUrls: ['./swiss-bill-form.component.css']
})
export class SwissBillFormComponent implements OnInit {
  virementForm: FormGroup;

  constructor(private fb: FormBuilder, private swissBillDataSharingService: SwissBillDataSharingService) {
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
      this.swissBillDataSharingService.updateFormData(this.virementForm.value);
      console.log(this.virementForm.value);
    } else {
      console.log('Le formulaire n\'est pas valide');
    }
  }
}
