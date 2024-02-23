import { Component, OnInit } from '@angular/core';
import { SwissBillDataSharingService } from '../services/swiss-bill-data-sharing.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-swiss-bill-pdf-viewer',
  templateUrl: './swiss-bill-pdf-viewer.component.html',
  styleUrls: ['./swiss-bill-pdf-viewer.component.css']
})
export class SwissBillPdfViewerComponent implements OnInit {
  pdfUrl?: SafeUrl;

  constructor(private swissBillDataSharingService: SwissBillDataSharingService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.swissBillDataSharingService.currentPdfData.subscribe(pdfBlob => {
      if (pdfBlob) {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(pdfBlob));
      }
    });
  }
}
