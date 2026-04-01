require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'HealthTrack API',
        version: '1.0.0',
        description: 'API para gestión de citas médicas con privacidad de datos estricta',
        contact: {
            name: 'Soporte HealthTrack',
            email: 'soporte@healthtrack.com'
        }
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Servidor de desarrollo'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Ingresa el token JWT con formato: Bearer {token}'
            }
        },
        schemas: {
            UsuarioRegistro: {
                type: 'object',
                required: ['email', 'password', 'nombre'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'paciente@ejemplo.com' },
                    password: { type: 'string', format: 'password', example: 'miPassword123' },
                    nombre: { type: 'string', example: 'Juan Pérez' },
                    rol: { type: 'string', enum: ['paciente', 'medico'], example: 'paciente' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'paciente@ejemplo.com' },
                    password: { type: 'string', format: 'password', example: 'miPassword123' }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    msg: { type: 'string' },
                    token: { type: 'string' },
                    usuario: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            nombre: { type: 'string' },
                            rol: { type: 'string' }
                        }
                    }
                }
            },
            Cita: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    paciente: { type: 'object' },
                    medico: { type: 'object' },
                    fecha: { type: 'string', format: 'date-time' },
                    motivo: { type: 'string' },
                    prioridad: { type: 'string', enum: ['normal', 'urgente'] },
                    estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'realizada'] },
                    notasMedicas: { type: 'string' }
                }
            },
            CrearCitaInput: {
                type: 'object',
                required: ['medicoId', 'fecha', 'motivo'],
                properties: {
                    medicoId: { type: 'string', example: '65f2a1b2c3d4e5f6a7b8c9d0' },
                    fecha: { type: 'string', format: 'date-time', example: '2024-04-15T10:00:00Z' },
                    motivo: { type: 'string', example: 'Dolor de cabeza persistente' }
                }
            }
        }
    },
    paths: {
        '/': {
            get: {
                tags: ['Sistema'],
                summary: 'Verificar estado del servidor',
                responses: {
                    '200': {
                        description: 'Servidor funcionando',
                        content: {
                            'text/plain': {
                                schema: { type: 'string', example: '🏥 HealthTrack API funcionando!' }
                            }
                        }
                    }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Autenticación'],
                summary: 'Registrar nuevo usuario',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UsuarioRegistro' }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Usuario registrado exitosamente' },
                    '400': { description: 'Datos inválidos o email ya existe' }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Iniciar sesión',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Login exitoso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginResponse' }
                            }
                        }
                    },
                    '400': { description: 'Credenciales inválidas' }
                }
            }
        },
        '/api/citas/mis-citas': {
            get: {
                tags: ['Citas'],
                summary: 'Obtener mis citas',
                description: 'Paciente ve sus citas, médico ve las citas asignadas',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de citas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Cita' }
                                }
                            }
                        }
                    },
                    '401': { description: 'No autorizado' }
                }
            }
        },
        '/api/citas/medicos': {
            get: {
                tags: ['Citas'],
                summary: 'Obtener lista de médicos',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de médicos disponibles' }
                }
            }
        },
        '/api/citas/crear': {
            post: {
                tags: ['Citas'],
                summary: 'Crear nueva cita (solo pacientes)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CrearCitaInput' }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Cita creada exitosamente' },
                    '401': { description: 'No autorizado' }
                }
            }
        },
        '/api/citas/estado': {
            put: {
                tags: ['Citas'],
                summary: 'Actualizar estado de cita',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['citaId', 'estado'],
                                properties: {
                                    citaId: { type: 'string' },
                                    estado: { type: 'string', enum: ['confirmada', 'cancelada', 'realizada'] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Estado actualizado' }
                }
            }
        },
        '/api/citas/notas': {
            put: {
                tags: ['Citas'],
                summary: 'Agregar notas médicas (solo médicos)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['citaId', 'notasMedicas'],
                                properties: {
                                    citaId: { type: 'string' },
                                    notasMedicas: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Notas agregadas' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "HealthTrack API Documentation"
}));

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

app.get("/", (req, res) => {
    res.status(200).send("🏥 HealthTrack API funcionando correctamente!");
});

app.use("/api/auth", authRoutes);
app.use("/api/citas", citaRoutes);

app.listen(PORT, () => {
    console.log(`\n=================================`);
    console.log(`🏥 HealthTrack API`);
    console.log(`=================================`);
    console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔗 Endpoints disponibles:`);
    console.log(`   📝 Autenticación:`);
    console.log(`      POST /api/auth/register - Registrar usuario`);
    console.log(`      POST /api/auth/login - Iniciar sesión`);
    console.log(`      GET  /api/auth/me - Obtener mi perfil (protegido)`);
    console.log(`   💊 Citas:`);
    console.log(`      GET  /api/citas/mis-citas - Mis citas (protegido)`);
    console.log(`      GET  /api/citas/medicos - Lista de médicos (protegido)`);
    console.log(`      POST /api/citas/crear - Crear cita (protegido)`);
    console.log(`      PUT  /api/citas/estado - Actualizar estado (protegido)`);
    console.log(`      PUT  /api/citas/notas - Agregar notas médicas (protegido)`);
    console.log(`=================================\n`);
}); 