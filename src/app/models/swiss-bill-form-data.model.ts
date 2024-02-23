export interface SwissBillFormData {
  ibanDestinataire: string;
  nomDestinataire: string;
  rueDestinataire: string;
  numeroRueDestinataire: string;
  codePostalDestinataire: number;
  localiteDestinataire: string;
  numeroReference: number;
  nomEmetteur: string;
  rueEmetteur: string;
  numeroRueEmetteur: string;
  codePostalEmetteur: number;
  localiteEmetteur: string;
  monnaie: string;
  montant: number;
}
