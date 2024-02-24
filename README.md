# SwissBillMaker

Just a simple app to generate Swiss bills according to six-group requirements. 

## Usage
install dependencies
```bash
npm install
```

Launch the backend (no database required)
```bash
node backend.js
```

Launch the frontend
```bash
ng serve
```

## Limitations
The app is not localized and only supports French for yet. 

## Technologies
- Angular 11
- Node.js
- Express.js
- Angular Material
- puppeteer
- qrcode-svg
- i18n-iso-countries

## Sources
- [Six-group ig qr-bill v2.3](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-fr.pdf)
- [Six-group introduction script invoice issuers recipients](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/introduction-script-invoice-issuers-recipients-fr.pdf)
- [BCGE style guide QR facture](https://www.bcge.ch/documents/509424/679187/BCGE_style_guide_QR_facture_en.pdf)
- [Wikipedia - creditor reference (iso 11649)](https://en.wikipedia.org/wiki/Creditor_Reference)
- [Creditor reference tester](https://kahur.ee/rfcalculator/)
