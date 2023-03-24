const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./inici-sessio-firebase-adminsdk-tt5hp-86a9a76cfa.json');
const port = 3000
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://inici-sessio.firebaseio.com'
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/users', (req, res) => {
    const { email, password } = req.body;

    admin.auth().createUser({
        email: email,
        password: password
    })
        .then((userRecord) => {
            console.log('Usuari creat correctament: ', userRecord.toJSON());
            res.status(201).json({ message: 'Usuari creat correctament' });
        })
        .catch((error) => {
            console.error('Error al crear usuari: ', error);
            res.status(500).json({ error: 'Error al crear usuari' });
        });
});

app.listen(port, () => {
    console.log('Servidor iniciat al port : '+ port);
});