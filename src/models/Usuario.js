const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    rol: {
        type: String,
        enum: ['paciente', 'medico'],
        default: 'paciente',
        required: true
    },
    fechaNacimiento: {
        type: Date,
        default: null
    },
    telefono: {
        type: String,
        default: ''
    },
    direccion: {
        type: String,
        default: ''
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

usuarioSchema.methods.toJSON = function() {
    const usuario = this.toObject();
    delete usuario.password;
    return usuario;
};

module.exports = mongoose.model('Usuario', usuarioSchema); 