-- 1. Osztályok tábla létrehozása
CREATE TABLE IF NOT EXISTS osztalyok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nev VARCHAR(50) NOT NULL,
    szak VARCHAR(100) NOT NULL,
    evfolyam INT NOT NULL
);

-- 2. Diákok tábla létrehozása (idegen kulccsal)
CREATE TABLE IF NOT EXISTS diakok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nev VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    osztaly_id INT NOT NULL,
    
    CONSTRAINT fk_diak_osztaly 
        FOREIGN KEY (osztaly_id) 
        REFERENCES osztalyok(id) 

);

-- 3. Kezdőadatok feltöltése: Osztályok
INSERT INTO osztalyok (id, nev, szak, evfolyam) VALUES
(1, '9.A', 'Általános', 9),
(2, '10.B', 'Informatika', 10),
(3, '11.C', 'Közgazdaság', 11),
(4, '12.A', 'Gimnázium', 12),
(5, '9.B', 'Elektronika', 9),
(6, '10.A', 'Művészeti', 10);

-- 4. Kezdőadatok feltöltése: Diákok
INSERT INTO diakok (id, nev, email, osztaly_id) VALUES
(1, 'Kovács Anna', 'kovacs.anna@iskola.hu', 1),
(2, 'Nagy Péter', 'nagy.peter@iskola.hu', 2),
(3, 'Szabó Eszter', 'szabo.eszter@iskola.hu', 2),
(4, 'Tóth Bence', 'toth.bence@iskola.hu', 3),
(5, 'Horváth Lili', 'horvath.lili@iskola.hu', 4),
(6, 'Varga Máté', 'varga.mate@iskola.hu', 5);