const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    prioridad: {
        type: String,
        enum: ['normal', 'urgente'],
        default: 'normal'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'realizada'],
        default: 'pendiente'
    },
    notasMedicas: {
        type: String,
        default: ''
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cita', citaSchema); 