const express = require('express');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// api:
app.get('/', (req, res) => {
  res.json({
    uzenet: 'Kezdő iskolai REST API fut',
    elerheto_vegpontok: [
      'GET /api/osztalyok',
      'GET /api/osztalyok/:id',
      'GET /api/osztalyok/:id/diakok',
      'GET /api/diakok',
      'GET /api/diakok/:id',
		  'GET /api/diakok?aktiv=1'
    ]
  });
});



// osszes osztaly lekerese
app.get('/api/osztalyok', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM osztalyok');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba az osztályok lekérésekor.' });
  }
});

// egy osztaly lekerese id alapjan
app.get('/api/osztalyok/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM osztalyok WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'A megadott ID-val nem található osztály.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba az osztály lekérésekor.' });
  }
});

// egy osztalyban levo diakok lekerese
app.get('/api/osztalyok/:id/diakok', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM diakok WHERE osztaly_id = ?', [id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba a diákok lekérésekor.' });
  }
});


// Szerver indítása
app.listen(port, () => {
  console.log(`A szerver fut a http://localhost:${port} címen`);
});