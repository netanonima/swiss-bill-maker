import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { SwissBillDataSharingService } from '../swiss-bill-data-sharing.service';
import { PDFDocument, rgb } from 'pdf-lib';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-swiss-bill-pdf-viewer',
  templateUrl: './swiss-bill-pdf-viewer.component.html',
  styleUrls: ['./swiss-bill-pdf-viewer.component.css']
})
export class SwissBillPdfViewerComponent implements OnInit, OnDestroy {
  private formDataSubscription?: Subscription;
  pdfSrc?: SafeResourceUrl;

  constructor(private dataSharingService: SwissBillDataSharingService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.formDataSubscription = this.dataSharingService.currentFormData.subscribe(data => {
      if (data) {
        this.generatePdf(data);
      }
    });
  }

  async generatePdf(formData: any) {
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage();

    const fontSize = 12;
    page.drawText(`Iban Destinataire: ${formData.ibanDestinataire}`, { x: 50, y: page.getHeight() - 50, size: fontSize, color: rgb(0, 0, 0) });
    page.drawText(`Nom Destinataire: ${formData.nomDestinataire}`, { x: 50, y: page.getHeight() - 65, size: fontSize, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    // Marquer l'URL comme sûre
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl + '#zoom=Fit');
  }

  ngOnDestroy(): void {
    if (this.formDataSubscription) {
      this.formDataSubscription.unsubscribe();
    }
  }
}
