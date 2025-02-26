const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

module.exports = (requiredRoles) => {
  return (req, res, next) => {
    // Extraer el token del encabezado 'Authorization'
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log("Token recibido:", token);

    if (!token) {
      return res.status(403).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token
    jwt.verify(token, secretKey, (err, decoded) => 
    {
      if (err) {
        console.error('Error al verificar token:', err.message);
        return res.status(403).json({ message: 'Token no válido' });
      }
      // Si el token es válido, guardar los datos del usuario en la solicitud
      req.user = decoded;

      console.log("Token decodificado:", decoded);

      // Asegurarse de que el rol sea un número
      const userRole = Number(decoded.role);  // Convertir a número

      // Verificar si el usuario tiene el rol necesario
      if (requiredRoles && !requiredRoles.includes(userRole)) {
        console.log("Rol insuficiente:", decoded.role);
        return res.status(403).json({ message: "Acceso denegado. No tienes los permisos necesarios." });
      }
      // Continuar con el siguiente middleware o controlador
      next();
    });
  };
};
