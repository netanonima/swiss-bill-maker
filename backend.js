const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF');
  console.log(req.body);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Utiliser les données du formulaire pour générer le contenu HTML
  const content = `<h1>${req.body.nomDestinataire}</h1><p>${req.body.nomDestinataire}</p>`;

  await page.setContent(content);
  const pdfBuffer = await page.pdf();
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');

  res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`PDF Generator app listening at http://localhost:${port}`);
});
