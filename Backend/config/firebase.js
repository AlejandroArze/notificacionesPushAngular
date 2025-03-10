const admin = require('firebase-admin');
const path = require('path');

// Usar variables de entorno para la configuración
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Verificar si la aplicación ya está inicializada
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error);
    }
}

// Exportar messaging directamente
module.exports = {
    admin,
    messaging: admin.messaging()
}; 