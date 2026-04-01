const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const auth = require('../middlewares/auth');

router.get('/mis-citas', auth, citaController.getMisCitas);
router.get('/medicos', auth, citaController.getMedicos);
router.post('/crear', auth, citaController.crearCita);
router.put('/estado', auth, citaController.actualizarEstado);
router.put('/notas', auth, citaController.agregarNotas);

module.exports = router; 