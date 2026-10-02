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
      'POST /api/osztalyok',
      'DELETE /api/osztalyok/:id',
      'GET /api/diakok',
      'GET /api/diakok/:id',
      'POST /api/diakok',
      'PUT /api/diakok/:id',
      'DELETE /api/diakok/:id'
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

// uj osztaly felvetele
app.post('/api/osztalyok', async (req, res) => {
  const { nev, szak, evfolyam } = req.body;
  if (!nev || !szak || !evfolyam) {
    return res.status(400).json({ message: 'A nev, szak és evfolyam megadása kötelező!' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO osztalyok (nev, szak, evfolyam) VALUES (?, ?, ?)',
      [nev, szak, evfolyam]
    );
    res.status(201).json({ id: result.insertId, nev, szak, evfolyam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba az osztály mentése során.' });
  }
});

// osztaly torlese id alapjan
app.delete('/api/osztalyok/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM osztalyok WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'A megadott ID-val nem található osztály.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Az osztály nem törölhető, mert még tartoznak hozzá diákok!' });
    }
    res.status(500).json({ message: 'Szerver hiba az osztály törlésekor.' });
  }
});



// osszes diak lekerese 
app.get('/api/diakok', async (req, res) => {
  try {
    const query = `
      SELECT 
        diakok.id, 
        diakok.nev, 
        diakok.email, 
        diakok.osztaly_id, 
        osztalyok.nev AS osztaly_nev,
        osztalyok.szak AS osztaly_szak,
        osztalyok.evfolyam AS osztaly_evfolyam
      FROM diakok
      INNER JOIN osztalyok ON diakok.osztaly_id = osztalyok.id
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba a diákok lekérésekor.' });
  }
});

// Egy konkrét diák lekérése ID alapján (GET /api/diakok/:id)
app.get('/api/diakok/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        diakok.id, 
        diakok.nev, 
        diakok.email, 
        diakok.osztaly_id, 
        osztalyok.nev AS osztaly_nev
      FROM diakok
      INNER JOIN osztalyok ON diakok.osztaly_id = osztalyok.id
      WHERE diakok.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'A megadott ID-val nem található diák.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba a diák lekérésekor.' });
  }
});

// Új diák felvétele
app.post('/api/diakok', async (req, res) => {
  const { nev, email, osztaly_id } = req.body;
  if (!nev || !email || !osztaly_id) {
    return res.status(400).json({ message: 'A nev, email és osztaly_id megadása kötelező!' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO diakok (nev, email, osztaly_id) VALUES (?, ?, ?)',
      [nev, email, osztaly_id]
    );
    res.status(201).json({ id: result.insertId, nev, email, osztaly_id });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ezzel az email címmel már létezik diák!' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(409).json({ message: 'A megadott osztály nem létezik!' });
    }
    res.status(500).json({ message: 'Szerver hiba a diák mentése során.' });
  }
});

// Diák módosítása
app.put('/api/diakok/:id', async (req, res) => {
  const { id } = req.params;
  const { nev, email, osztaly_id } = req.body;
  if (!nev || !email || !osztaly_id) {
    return res.status(400).json({ message: 'A nev, email és osztaly_id megadása kötelező!' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE diakok SET nev = ?, email = ?, osztaly_id = ? WHERE id = ?',
      [nev, email, osztaly_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'A megadott ID-val nem található diák.' });
    }
    res.status(200).json({ id: Number(id), nev, email, osztaly_id });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ezzel az email címmel már létezik diák!' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(409).json({ message: 'A megadott osztály nem létezik!' });
    }
    res.status(500).json({ message: 'Szerver hiba a diák frissítésekor.' });
  }
});

// Diák törlése
app.delete('/api/diakok/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM diakok WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'A megadott ID-val nem található diák.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerver hiba a diák törlésekor.' });
  }
});

// Szerver indítása
app.listen(port, () => {
  console.log(`A szerver fut a http://localhost:${port} címen`);
});