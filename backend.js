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
    montant: 100.5
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
    <body style="font-family: 'Arial', sans-serif; font-size: 12px;">
        <div style="width: 793.7px; height: 396.85px; border: solid 2px red; display: flex;">
          <div style="width: 196.53px; height: 359.05px; border: solid 2px blue; padding: 18.9px;">
              <!-- Zone du récépissé -->
              <div style="width: 100%; height: 26.45px;">
                  <!-- Title section -->
                  <strong>Récépissé</strong>
              </div>
              <div style="width: 100%; height: 211.65px;">
                  <!-- Information section -->
                  <p>
                      <div>Compte /Payable à</div>
                      <div>${req.body.ibanDestinataire}</div>
                      <div>${req.body.nomDestinataire}</div>
                      <div>${req.body.rueDestinataire} ${req.body.numeroRueDestinataire}</div>
                      <div>${req.body.codePostalDestinataire} ${req.body.localiteDestinataire}</div>
                  </p>
                  <p>
                      <div>Référence</div>
                      <div>${req.body.numeroReference}</div>
                  </p>
                  <p>
                      <div>Payable par</div>
                      <div>${req.body.nomEmetteur}</div>
                      <div>${req.body.rueEmetteur} ${req.body.numeroRueEmetteur}</div>
                      <div>${req.body.codePostalEmetteur} ${req.body.localiteEmetteur}</div>
                  </p>
              </div>
              <div style="width: 100%; height: 52.91px; flex-direction: column;">
                  <!-- Amount section -->
                  <div>Monnaie</div>
                  <div style="width: 113.38px; height: 37.79px">Montant</div>
              </div>
              <div style="width: 100%; height: 68.03px; text-align: right;">
                  <!-- Acceptance point section -->
                  Point de dépôt
              </div>
          </div>
          <div style="width: 521.57px; height: 359.05px; border: solid 2px green; padding: 18.9px;">
            <!-- Zone de la section paiement -->
            <div style="width: 521.56px; height: 321.26px; flex-direction: column; border: solid 2px yellow;">
                <div style="display: flex;">
                    <div style="width: 192.75px; height: 321.24px; border: solid 2px orangered;">
                      <!-- left area -->
                      <div style="width: 192.75px; height: 26.45px;">
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
                          <div>Monnaie</div>
                          <div style="width: 113.38px; height: 37.79px">Montant</div>
                      </div>
                  </div>
                  <div style="width: 328.81px; height: 321.24px; border: solid 2px blueviolet;">
                      <!-- Information section -->
                      <p>
                          <div>Compte /Payable à</div>
                          <div>${req.body.ibanDestinataire}</div>
                          <div>${req.body.nomDestinataire}</div>
                          <div>${req.body.rueDestinataire} ${req.body.numeroRueDestinataire}</div>
                          <div>${req.body.codePostalDestinataire} ${req.body.localiteDestinataire}</div>
                      </p>
                      <p>
                          <div>Référence</div>
                          <div>${req.body.numeroReference}</div>
                      </p>
                      <p>
                          <div>Payable par</div>
                          <div>${req.body.nomEmetteur}</div>
                          <div>${req.body.rueEmetteur} ${req.body.numeroRueEmetteur}</div>
                          <div>${req.body.codePostalEmetteur} ${req.body.localiteEmetteur}</div>
                      </p>
                  </div>
                </div>
            </div>
            <div style="width: 521.56px; height: 37.79px; border: solid 2px darkslategrey;">
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
