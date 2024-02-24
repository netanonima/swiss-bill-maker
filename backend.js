const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const QRCodeSVG = require('qrcode-svg');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF');
  console.log(req.body);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /*
  {
    ibanDestinataire: 'CH9300762011623852957',
    nomDestinataire: 'Jean Dupont',
    rueDestinataire: 'Rue Exemple',
    numeroRueDestinataire: '10',
    codePostalDestinataire: 1000,
    localiteDestinataire: 'Lausanne',
    numeroReference: 123456789012345680000,
    nomEmetteur: 'Marie Curie',
    rueEmetteur: 'Rue de la Science',
    numeroRueEmetteur: '42',
    codePostalEmetteur: 1015,
    localiteEmetteur: 'Lausanne',
    monnaie: 'CHF',
    montant: 100.5,
    additionalInformation: 'Facture du 3 février 2024'
  }
  ${req.body.nomDestinataire}
  */
  // traitement numéro de référence selon norme iso 11649
  const numeroReference = req.body.numeroReference.toString();
  const refForControlNumber = `${numeroReference}271500`;
  const bigIntRef = BigInt(refForControlNumber);
  let controlNumber = (98n - (bigIntRef % 97n)).toString();
  controlNumber = controlNumber.padStart(2, '0');
  req.body.numeroReference = `RF${controlNumber}${numeroReference}`;

  // formatage iban
  const ibanSansEspaces = req.body.ibanDestinataire.replace(/\s+/g, '');
  const ibanSegments = ibanSansEspaces.match(/.{1,4}/g);
  req.body.ibanDestinataire = ibanSegments.join(' ');

  // formatage numéro de référence
  const referenceSansEspaces = req.body.numeroReference.replace(/\s+/g, '');
  const referenceSegments = referenceSansEspaces.match(/.{1,5}/g);
  req.body.numeroReference = referenceSegments.join(' ');

  // formatage montant
  req.body.montant = req.body.montant.toFixed(2);

  // création du qr
  let data = 'les données à encoder iciles données à encoder iciles données à encoder iciles données à encoder iciles données à encoder iciles données à encoder iciles données à encoder iciles données à encoder iciles données à encoder ici';
  const numberOfLineBreaks = (data.match(/\n/g) || []).length;
  const maxDataLength = 997 - numberOfLineBreaks;
  if (data.length > maxDataLength) {
    data = data.slice(0, maxDataLength);
  }
  while (data.endsWith('\n')) {
    data = data.slice(0, -1);
  }

  const qrcode = new QRCodeSVG({
    content: data,
    padding: 0,
    width: 46,
    height: 46,
    container: "svg-viewbox",
    join: true,
    color: "#000000",
    background: "#ffffff"
  });
  const svgString = qrcode.svg();

  const content = `
    <body style="font-family: 'Arial', sans-serif;">
        <div style="position: relative; width: 793.7px; height: 396.85px; border-top: dashed 1px black; border-left: solid 1px black; border-right: solid 1px black; border-bottom: solid 1px black; display: flex;">
          <span style="position: absolute; top: -10px; left: 4%; transform: translateX(-50%); font-size: 14px;">&#x2702;</span>
          <div style="position: relative; width: 196.53px; height: 359.05px; border-right: dashed 1px black; padding: 18.9px;">
            <span style="position: absolute; top: 6%; right: -15px; transform: translate(-50%, -50%) rotate(90deg); font-size: 14px;">&#x2702;</span>
              <!-- Zone du récépissé -->
              <div style="width: 100%; height: 26.45px; font-size: 11pt;">
                  <!-- Title section -->
                  <strong>Récépissé</strong>
              </div>
              <div style="width: 100%; height: 211.65px;">
                  <!-- Information section -->
                  <p>
                      <div style="font-size: 6pt; line-height: 9pt;"><strong>Compte / Payable à</strong></div>
                      <div style="font-size: 8pt; line-height: 9pt;">
                        <div>${req.body.ibanDestinataire}</div>
                        <div>${req.body.nomDestinataire}</div>
                        <div>${req.body.rueDestinataire} ${req.body.numeroRueDestinataire}</div>
                        <div>${req.body.codePostalDestinataire} ${req.body.localiteDestinataire}</div>
                      </div>
                  </p>
                  <p>
                    <div style="font-size: 6pt; line-height: 9pt;"><strong>Référence</strong></div>
                    <div style="font-size: 8pt; line-height: 9pt;">${req.body.numeroReference}</div>
                  </p>
                  <p>
                      <div style="font-size: 6pt; line-height: 9pt;"><strong>Payable par</strong></div>
                      <div style="font-size: 8pt; line-height: 9pt;">
                        <div>${req.body.nomEmetteur}</div>
                        <div>${req.body.rueEmetteur} ${req.body.numeroRueEmetteur}</div>
                        <div>${req.body.codePostalEmetteur} ${req.body.localiteEmetteur}</div>
                      </div>
                  </p>
              </div>
              <div style="width: 100%; height: 52.91px; flex-direction: column;">
                  <!-- Amount section -->
                  <div style="display: flex;">
                    <div style="width: 83.15px; height: 37.79px;">
                        <div style="font-size: 6pt; line-height: 9pt;"><strong>Monnaie</strong></div>
                        <div style="font-size: 8pt; line-height: 11pt;">${req.body.monnaie}</div>
                    </div>
                    <div style="width: 113.38px; height: 37.79px">
                        <div style="font-size: 6pt; line-height: 9pt;"><strong>Montant</strong></div>
                        <div style="font-size: 8pt; line-height: 11pt;">${req.body.montant}</div>
                    </div>
                  </div>
              </div>
              <div style="width: 100%; height: 68.03px; text-align: right; font-size: 6pt; line-height: 8pt;">
                  <!-- Acceptance point section -->
                  <strong>Point de dépôt</strong>
              </div>
          </div>
          <div style="width: 521.57px; height: 359.05px; padding: 18.9px;">
            <!-- Zone de la section paiement -->
            <div style="width: 521.56px; height: 321.26px; flex-direction: column;">
                <div style="display: flex;">
                    <div style="width: 192.75px; height: 321.24px;">
                      <!-- left area -->
                      <div style="width: 192.75px; height: 26.45px; font-size: 11pt">
                          <!-- Title section -->
                          <strong>Section paiement</strong>
                      </div>
                      <div style="width: 192.75px; height: 211.65px; padding-top: 18.9px; padding-right: 18.9px; padding-bottom: 18.9px;">
                          <!-- Swiss QR Code section -->
                          <div style="position: relative; width: 173.85px; height: 173.85px; position: relative; display: flex; justify-content: center; align-items: center;">
                            <div style="width: 100%; height: auto;">
                                ${svgString}
                            </div>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                <svg width="7mm" height="7mm" version="1.1" id="Ebene_2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 19.8 19.8" style="enable-background:new 0 0 19.8 19.8;" xml:space="preserve">
                                  <style type="text/css">
                                   .st0{fill:#FFFFFF;}
                                   .st1{fill:none;stroke:#FFFFFF;stroke-width:1.4357;stroke-miterlimit:10;}
                                  </style>
                                  <polygon points="18.3,0.7 1.6,0.7 0.7,0.7 0.7,1.6 0.7,18.3 0.7,19.1 1.6,19.1 18.3,19.1 19.1,19.1 19.1,18.3 19.1,1.6 19.1,0.7 "/>
                                  <rect x="8.3" y="4" class="st0" width="3.3" height="11"/>
                                  <rect x="4.4" y="7.9" class="st0" width="11" height="3.3"/>
                                  <polygon class="st1" points="0.7,1.6 0.7,18.3 0.7,19.1 1.6,19.1 18.3,19.1 19.1,19.1 19.1,18.3 19.1,1.6 19.1,0.7 18.3,0.7 1.6,0.7 0.7,0.7 "/>
                                </svg>
                            </div>
                          </div>
                      </div>
                      <div style="width: 192.75px; height: 83.14px; flex-direction: column;">
                          <!-- Amount section -->
                          <div style="display: flex;">
                            <div style="width: 83.15px; height: 37.79px;">
                                <div style="font-size: 8pt; line-height: 11pt;"><strong>Monnaie</strong></div>
                                <div style="font-size: 10pt; line-height: 13pt;">${req.body.monnaie}</div>
                            </div>
                            <div style="width: 113.38px; height: 37.79px">
                                <div style="font-size: 8pt; line-height: 11pt;"><strong>Montant</strong></div>
                                <div style="font-size: 10pt; line-height: 13pt;">${req.body.montant}</div>
                            </div>
                          </div>
                      </div>
                  </div>
                  <div style="width: 328.81px; height: 321.24px;">
                      <!-- Information section -->
                      <p>
                          <div style="font-size: 8pt; line-height: 11pt;"><strong>Compte /Payable à</strong></div>
                          <div style="font-size: 10pt; line-height: 11pt;">
                            <div>${req.body.ibanDestinataire}</div>
                            <div>${req.body.nomDestinataire}</div>
                            <div>${req.body.rueDestinataire} ${req.body.numeroRueDestinataire}</div>
                            <div>${req.body.codePostalDestinataire} ${req.body.localiteDestinataire}</div>
                          </div>
                      </p>
                      <p>
                        <div style="font-size: 8pt; line-height: 11pt;"><strong>Référence</strong></div>
                        <div style="font-size: 10pt; line-height: 11pt;">${req.body.numeroReference}</div>
                      </p>
                      <p>
                        <div style="font-size: 8pt; line-height: 11pt;"><strong>Informations supplémentaires</strong></div>
                        <div style="font-size: 10pt; line-height: 11pt;">${req.body.additionalInformation}</div>
                      </p>
                      <p>
                          <div style="font-size: 8pt; line-height: 11pt;"><strong>Payable par</strong></div>
                          <div style="font-size: 10pt; line-height: 11pt;">
                            <div>${req.body.nomEmetteur}</div>
                            <div>${req.body.rueEmetteur} ${req.body.numeroRueEmetteur}</div>
                            <div>${req.body.codePostalEmetteur} ${req.body.localiteEmetteur}</div>
                          </div>
                      </p>
                  </div>
                </div>
            </div>
            <div style="width: 521.56px; height: 37.79px;">
                <!-- Further information section -->
            </div>
          </div>
      </div>
    </body>
  `;

  await page.setContent(content);
  const pdfBuffer = await page.pdf();
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');

  res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`PDF Generator app listening at http://localhost:${port}`);
});
