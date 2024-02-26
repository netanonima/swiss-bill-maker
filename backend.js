const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const QRCode = require('qrcode');
const fs = require('fs');
const https = require('https');
var countries = require("i18n-iso-countries");

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
countries.registerLocale(require("i18n-iso-countries/langs/de.json"));
countries.registerLocale(require("i18n-iso-countries/langs/it.json"));

const app = express();
const port = 3000;

const sslOptions = {
  cert: fs.readFileSync(''),
  ca: fs.readFileSync(''),
  key: fs.readFileSync(''),
};

app.use(cors());
app.use(express.json());

app.get('/getCountries', (req, res) => {
  const language = req.query.lang || "en";
  const priorityCountriesCodes = ['CH', 'LI', 'FR', 'DE', 'IT'];
  let countryList = [];
  const countryCodes = countries.getAlpha2Codes();

  Object.keys(countryCodes).forEach(code => {
    countryList.push({
      code: code,
      name: countries.getName(code, language),
    });
  });

  const prioritizedCountries = countryList.filter(country => priorityCountriesCodes.includes(country.code));
  prioritizedCountries.sort((a, b) => priorityCountriesCodes.indexOf(a.code) - priorityCountriesCodes.indexOf(b.code));

  const otherCountries = countryList.filter(country => !priorityCountriesCodes.includes(country.code));
  otherCountries.sort((a, b) => a.name.localeCompare(b.name));

  const sortedCountryList = [...prioritizedCountries, ...otherCountries];

  res.json(sortedCountryList);
});

app.post('/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF');
  // console.log(req.body);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let ibanDestinataire = req.body.ibanDestinataire;
  let ibanDestinataireFormatted = '';
  let nomDestinataire = req.body.nomDestinataire;
  let rueDestinataire = req.body.rueDestinataire;
  let numeroRueDestinataire = req.body.numeroRueDestinataire;
  let codePostalDestinataire = req.body.codePostalDestinataire;
  let localiteDestinataire = req.body.localiteDestinataire;
  let paysDestinataire = req.body.paysDestinataire;
  let numeroReferenceType = req.body.numeroReferenceType;
  let numeroReference = req.body.numeroReference;
  let numeroReferenceFormatted = '';
  let nomEmetteur = req.body.nomEmetteur;
  let rueEmetteur = req.body.rueEmetteur;
  let numeroRueEmetteur = req.body.numeroRueEmetteur;
  let codePostalEmetteur = req.body.codePostalEmetteur;
  let localiteEmetteur = req.body.localiteEmetteur;
  let paysEmetteur = req.body.paysEmetteur;
  let monnaie = req.body.monnaie;
  let montant = req.body.montant;
  let additionalInformation = req.body.additionalInformation;

  // traitement numéro de référence selon norme iso 11649
  if(numeroReferenceType === 'SCOR'){
    const refForControlNumber = numeroReference+'271500';
    const bigIntRef = BigInt(refForControlNumber);
    let controlNumber = (98n - (bigIntRef % 97n)).toString();
    controlNumber = controlNumber.padStart(2, '0');
    numeroReference = 'RF'+controlNumber+req.body.numeroReference;
  }else if(numeroReferenceType === 'QRR'){
    function calculateMod10Recursive(referenceNumber) {
      const weights = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
      let carry = 0; // Report initial
      for (let i = 0; i < referenceNumber.length - 1; i++) {
        const num = parseInt(referenceNumber.charAt(i), 10);
        carry = weights[(num + carry) % 10];
      }
      const controlDigit = (10 - carry) % 10;
      return controlDigit;
    }
    numeroReference = numeroReference+calculateMod10Recursive(numeroReference+'P').toString();
    numeroReference = numeroReference.padStart(27, '0');
  }else{
    numeroReferenceType = 'NON';
    numeroReference = '';
  }

  // formatage iban
  const ibanSansEspaces = ibanDestinataire.replace(/\s+/g, '');
  const ibanSegments = ibanSansEspaces.match(/.{1,4}/g);
  ibanDestinataireFormatted = ibanSegments.join(' ');

  // formatage numéro de référence
  if(numeroReference !== ''){
    const referenceSansEspaces = numeroReference.replace(/\s+/g, '');
    const referenceSegments = referenceSansEspaces.match(/.{1,5}/g);
    numeroReferenceFormatted = referenceSegments.join(' ');
  }

  // création du qr
  let data = `SPC
0200
1
${ibanSansEspaces}
S
${nomDestinataire}
${rueDestinataire}
${numeroRueDestinataire}
${codePostalDestinataire}
${localiteDestinataire}
${paysDestinataire}







${montant}
${monnaie}
S
${nomEmetteur}
${rueEmetteur}
${numeroRueEmetteur}
${codePostalEmetteur}
${localiteEmetteur}
${paysEmetteur}
${numeroReferenceType}
${numeroReference}
${additionalInformation}
EPD`;
  const numberOfLineBreaks = (data.match(/\n/g) || []).length;
  const maxDataLength = 997 - numberOfLineBreaks;
  if (data.length > maxDataLength) {
    data = data.slice(0, maxDataLength);
  }
  while (data.endsWith('\n')) {
    data = data.slice(0, -1);
  }

  QRCode.toDataURL(data, {
    qversion: 25,
    error: 'M',
    width: 46,
    margin: 0,
    color: {
      dark:"#000000",
      light:"#ffffff"
    }
  }, async function (err, QRCodeURL) {
    if (err) throw err;

    let content = `
    <body style="font-family: 'Arial', sans-serif; height: 100%; margin: 0; display: grid; align-content: end;">
        <div style="position: relative; left: 0px; top: -1px;">
            <div style="position: relative; width: 793.7px; height: 396.85px; border-top: dashed 1px black; display: flex;">
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
                          <div>${ibanDestinataireFormatted}</div>
                          <div>${nomDestinataire}</div>
                          <div>${rueDestinataire} ${numeroRueDestinataire}</div>
                          <div>${codePostalDestinataire} ${localiteDestinataire}</div>
                        </div>
                    </p>
                    <p>
                      <div style="font-size: 6pt; line-height: 9pt;"><strong>Référence</strong></div>
                      <div style="font-size: 8pt; line-height: 9pt;">${numeroReferenceFormatted}</div>
                    </p>
                    <p>
                        <div style="font-size: 6pt; line-height: 9pt;"><strong>Payable par</strong></div>
                        <div style="font-size: 8pt; line-height: 9pt;">
                          <div>${nomEmetteur}</div>
                          <div>${rueEmetteur} ${numeroRueEmetteur}</div>
                          <div>${codePostalEmetteur} ${localiteEmetteur}</div>
                        </div>
                    </p>
                </div>
                <div style="width: 100%; height: 52.91px; flex-direction: column;">
                    <!-- Amount section -->
                    <div style="display: flex;">
                      <div style="width: 83.15px; height: 37.79px;">
                          <div style="font-size: 6pt; line-height: 9pt;"><strong>Monnaie</strong></div>
                          <div style="font-size: 8pt; line-height: 11pt;">${monnaie}</div>
                      </div>
                      <div style="width: 113.38px; height: 37.79px">
                          <div style="font-size: 6pt; line-height: 9pt;"><strong>Montant</strong></div>
                          <div style="font-size: 8pt; line-height: 11pt;">${montant}</div>
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
                              <div style="width: 173.85px; height: 173.85px; display: flex; justify-content: center; align-items: center;">
                                <img src="${QRCodeURL}" style="max-width: 100%; max-height: 100%;" />
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
                                  <div style="font-size: 10pt; line-height: 13pt;">${monnaie}</div>
                              </div>
                              <div style="width: 113.38px; height: 37.79px">
                                  <div style="font-size: 8pt; line-height: 11pt;"><strong>Montant</strong></div>
                                  <div style="font-size: 10pt; line-height: 13pt;">${montant}</div>
                              </div>
                            </div>
                        </div>
                    </div>
                    <div style="width: 328.81px; height: 321.24px;">
                        <!-- Information section -->
                        <p>
                            <div style="font-size: 8pt; line-height: 11pt;"><strong>Compte /Payable à</strong></div>
                            <div style="font-size: 10pt; line-height: 11pt;">
                              <div>${ibanDestinataireFormatted}</div>
                              <div>${nomDestinataire}</div>
                              <div>${rueDestinataire} ${numeroRueDestinataire}</div>
                              <div>${codePostalDestinataire} ${localiteDestinataire}</div>
                            </div>
                        </p>
                        <p>
                          <div style="font-size: 8pt; line-height: 11pt;"><strong>Référence</strong></div>
                          <div style="font-size: 10pt; line-height: 11pt;">${numeroReferenceFormatted}</div>
                        </p>`;
    if(additionalInformation && additionalInformation !== ""){
      content += `
                        <p>
                          <div style="font-size: 8pt; line-height: 11pt;"><strong>Informations supplémentaires</strong></div>
                          <div style="font-size: 10pt; line-height: 11pt;">${additionalInformation}</div>
                        </p>`;
    }
    content += `
                        <p>
                            <div style="font-size: 8pt; line-height: 11pt;"><strong>Payable par</strong></div>
                            <div style="font-size: 10pt; line-height: 11pt;">
                              <div>${nomEmetteur}</div>
                              <div>${rueEmetteur} ${numeroRueEmetteur}</div>
                              <div>${codePostalEmetteur} ${localiteEmetteur}</div>
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
        </div>
    </body>
  `;

    await page.setContent(content);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      }
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');

    res.send(pdfBuffer);
  });
});

https.createServer(sslOptions, app).listen(port, () => {
  console.log('HTTPS Server running on port '+port);
});
