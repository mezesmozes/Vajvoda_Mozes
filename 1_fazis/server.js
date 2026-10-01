const express = require('express');

const app = express();
const port = 3000;


app.use(express.json());

// 1. vegpont: osszes osztaly
app.get('/osztalyok', (req, res) => {
  const data = readData();
  res.json(data.osztalyok);
});

// 2. vegpont: osszes diak
app.get('/diakok', (req, res) => {
  const data = readData();
  res.json(data.diakok);
});

// szerver inditasa
app.listen(port, () => {
  console.log(`A szerver fut a http://localhost:${port} cimen`);
});


