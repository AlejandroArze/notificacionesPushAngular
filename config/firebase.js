const admin = require('firebase-admin');

// Usar el archivo de credenciales generado por Firebase
const serviceAccount = require('./innova-42977-firebase-adminsdk-fbsvc-5602ea79f0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin; 