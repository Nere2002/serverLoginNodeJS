const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./inici-sessio-firebase-adminsdk-tt5hp-86a9a76cfa.json');
const port = 3000

// Crear un flujo de escritura para el archivo de log
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'server.log'), { flags: 'a' });

// Función para imprimir en la consola y en el archivo de log
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    logStream.write(`[${timestamp}] ${message}\n`);
}





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

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
});

const upload = multer({ storage: storage });

// Ruta para subir una imagen
app.post('/upload', upload.single('image'), function (req, res, next) {
    const file = req.file;
    if (!file) {
        const error = new Error('Sube un archivo');
        error.statusCode = 400;
        return next(error);
    }
    res.send({ filename: file.filename });
});

// Ruta para guardar las preguntas de los clientes
app.post('/queries', (req, res) => {
    const pregunta = req.body.pregunta;
    const timestamp = new Date().toISOString();

    // Guardar la pregunta en un archivo
    fs.appendFile('preguntas.txt', `[${timestamp}] ${pregunta}\n`, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al guardar la pregunta' });
        } else {
            console.log(`[${timestamp}] Pregunta guardada correctamente: ${pregunta}`);
            res.status(201).json({ message: 'Pregunta guardada correctamente' });
        }
    });
});
















app.listen(port, () => {
    console.log('Servidor iniciat al port : '+ port);
});