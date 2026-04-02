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
    telefono: {
        type: String,
        required: true,
        default: ''
    },
    edad: {
        type: Number,
        default: null
    },
    sexo: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: ''
    },
    tipoSangre: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    alergias: {
        type: String,
        default: ''
    },
    condicionesCronicas: {
        type: String,
        default: ''
    },
    fechaNacimiento: {
        type: Date,
        default: null
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