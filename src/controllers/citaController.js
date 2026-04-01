const Cita = require('../models/Cita');
const Usuario = require('../models/Usuario');

exports.getMisCitas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const usuarioRol = req.usuario.rol;

        let citas;
        if (usuarioRol === 'paciente') {
            citas = await Cita.find({ paciente: usuarioId })
                .populate('medico', 'nombre email telefono')
                .sort({ fecha: 1 });
        } else if (usuarioRol === 'medico') {
            citas = await Cita.find({ medico: usuarioId })
                .populate('paciente', 'nombre email telefono fechaNacimiento')
                .sort({ fecha: 1 });
        } else {
            return res.status(403).json({ msg: 'Rol no autorizado' });
        }

        res.json(citas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener citas", message: error.message });
    }
};

exports.crearCita = async (req, res) => {
    try {
        const { medicoId, fecha, motivo } = req.body;

        if (!medicoId || !fecha || !motivo) {
            return res.status(400).json({ msg: 'Todos los campos son requeridos' });
        }

        const medico = await Usuario.findById(medicoId);
        if (!medico || medico.rol !== 'medico') {
            return res.status(400).json({ msg: 'Médico no válido' });
        }

        let prioridad = 'normal';
        const palabrasUrgentes = ['urgencia', 'emergencia', 'dolor fuerte', 'fiebre alta', 'sangrado'];
        const motivoLower = motivo.toLowerCase();
        
        if (palabrasUrgentes.some(palabra => motivoLower.includes(palabra))) {
            prioridad = 'urgente';
        }

        const nuevaCita = new Cita({
            paciente: req.usuario.id,
            medico: medicoId,
            fecha: new Date(fecha),
            motivo,
            prioridad
        });

        await nuevaCita.save();
        await nuevaCita.populate('medico', 'nombre email');

        res.status(201).json({
            msg: 'Cita creada exitosamente',
            cita: nuevaCita
        });

    } catch (error) {
        res.status(500).json({ error: "Error al crear cita", message: error.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    try {
        const { citaId, estado } = req.body;
        const usuarioId = req.usuario.id;
        const usuarioRol = req.usuario.rol;

        const cita = await Cita.findById(citaId);
        if (!cita) {
            return res.status(404).json({ msg: 'Cita no encontrada' });
        }

        if (usuarioRol === 'medico' && cita.medico.toString() !== usuarioId) {
            return res.status(403).json({ msg: 'No autorizado para modificar esta cita' });
        }
        
        if (usuarioRol === 'paciente' && cita.paciente.toString() !== usuarioId) {
            return res.status(403).json({ msg: 'No autorizado para modificar esta cita' });
        }

        if (usuarioRol === 'paciente' && estado !== 'cancelada') {
            return res.status(403).json({ msg: 'Los pacientes solo pueden cancelar citas' });
        }

        cita.estado = estado;
        await cita.save();

        res.json({ msg: 'Estado actualizado exitosamente', cita });

    } catch (error) {
        res.status(500).json({ error: "Error al actualizar estado", message: error.message });
    }
};

exports.agregarNotas = async (req, res) => {
    try {
        const { citaId, notasMedicas } = req.body;
        const medicoId = req.usuario.id;

        const cita = await Cita.findById(citaId);
        if (!cita) {
            return res.status(404).json({ msg: 'Cita no encontrada' });
        }

        if (cita.medico.toString() !== medicoId) {
            return res.status(403).json({ msg: 'No autorizado para agregar notas a esta cita' });
        }

        cita.notasMedicas = notasMedicas;
        cita.estado = 'realizada';
        await cita.save();

        res.json({ msg: 'Notas médicas agregadas correctamente' });

    } catch (error) {
        res.status(500).json({ error: "Error al agregar notas", message: error.message });
    }
};

exports.getMedicos = async (req, res) => {
    try {
        const medicos = await Usuario.find({ rol: 'medico' })
            .select('nombre email telefono');
        res.json(medicos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener médicos", message: error.message });
    }
}; 