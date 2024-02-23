import { Component, OnInit } from '@angular/core';
import { SwissBillDataSharingService } from '../services/swiss-bill-data-sharing.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';


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



        pdfjsLib.getDocument(this.pdfUrl).promise.then(function(pdfDoc) {
          // Obtenir la première page
          pdfDoc.getPage(1).then(function(page) {
            var scale = 1.5; // Ajustez cette valeur pour contrôler le zoom. 1.0 = 100%
            var viewport = page.getViewport({scale: scale});
            var canvas = document.getElementById('pdfCanvas');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Paramètres de rendu
            var renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            page.render(renderContext);
          });
        });



      }
    });
  }
}
