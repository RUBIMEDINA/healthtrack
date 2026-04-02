const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios", message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const {
            email,
            password,
            nombre,
            rol = 'paciente',
            telefono,
            edad,
            sexo,
            tipoSangre,
            alergias,
            condicionesCronicas,
            fechaNacimiento,
            direccion
        } = req.body;

        // Validaciones generales
        if (!email || !password || !nombre) {
            return res.status(400).json({ msg: 'Email, password y nombre son requeridos' });
        }

        if (!telefono) {
            return res.status(400).json({ msg: 'El teléfono es requerido' });
        }

        // Validaciones específicas para pacientes
        if (rol === 'paciente') {
            if (!edad) {
                return res.status(400).json({ msg: 'La edad es requerida para pacientes' });
            }
            if (!sexo) {
                return res.status(400).json({ msg: 'El sexo es requerido para pacientes' });
            }
            if (!tipoSangre) {
                return res.status(400).json({ msg: 'El tipo de sangre es requerido para pacientes' });
            }
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            email,
            password: hashedPassword,
            nombre,
            rol,
            telefono,
            edad: rol === 'paciente' ? edad : null,
            sexo: rol === 'paciente' ? sexo : '',
            tipoSangre: rol === 'paciente' ? tipoSangre : '',
            alergias: rol === 'paciente' ? (alergias || 'Ninguna') : '',
            condicionesCronicas: rol === 'paciente' ? (condicionesCronicas || 'Ninguna') : '',
            fechaNacimiento: fechaNacimiento || null,
            direccion: direccion || ''
        });

        await nuevoUsuario.save();

        const payload = {
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol,
                nombre: nuevoUsuario.nombre
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            msg: 'Usuario registrado exitosamente',
            token,
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol,
                telefono: nuevoUsuario.telefono,
                ...(rol === 'paciente' && {
                    edad: nuevoUsuario.edad,
                    sexo: nuevoUsuario.sexo,
                    tipoSangre: nuevoUsuario.tipoSangre,
                    alergias: nuevoUsuario.alergias,
                    condicionesCronicas: nuevoUsuario.condicionesCronicas
                })
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario", message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email y password son requeridos' });
        }

        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const payload = {
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                nombre: usuario.nombre
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            msg: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol,
                telefono: usuario.telefono,
                ...(usuario.rol === 'paciente' && {
                    edad: usuario.edad,
                    sexo: usuario.sexo,
                    tipoSangre: usuario.tipoSangre,
                    alergias: usuario.alergias,
                    condicionesCronicas: usuario.condicionesCronicas
                })
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor", message: error.message });
    }
}; 