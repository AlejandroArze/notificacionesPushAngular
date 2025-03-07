const jwt = require('jsonwebtoken');
const { Usuarios } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                error: 'No se proporcionó token de autorización' 
            });
        }

        // Extraer el token (quitar 'Bearer ')
        const token = authHeader.split(' ')[1];

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario
        const usuario = await Usuarios.findByPk(decoded.id);

        if (!usuario) {
            return res.status(401).json({ 
                success: false, 
                error: 'Usuario no encontrado' 
            });
        }

        // Adjuntar usuario al request
        req.user = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token inválido o expirado' 
        });
    }
};

module.exports = authMiddleware; 