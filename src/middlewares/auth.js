const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'Acceso denegado. No hay token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded.usuario;
        console.log(`🔐 Usuario autenticado: ${req.usuario.email} (${req.usuario.rol})`);
        next();
    } catch (error) {
        console.log('❌ Token inválido:', error.message);
        res.status(401).json({ msg: 'Token inválido o expirado' });
    }
}; 