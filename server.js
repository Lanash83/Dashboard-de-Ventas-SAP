const express = require('express');
const hdb = require('hdb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a SAP HANA
const configHana = {
    host: 'xxx.xxx.xxx.xx',
    port: xxxx,
    user: 'xxxxx',
    password: 'xxxx'
};

app.post('/ejecutar-sql', (req, res) => {
    const { query } = req.body;
    const client = hdb.createClient(configHana);

    client.connect((err) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a HANA' });
        
        client.exec(query, (err, rows) => {
            client.disconnect();
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

app.listen(3000, () => {
    console.log("🚀 SERVIDOR SAP BI CORRIENDO EN PUERTO 3000");
});