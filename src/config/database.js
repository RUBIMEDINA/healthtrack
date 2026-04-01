const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conexión exitosa a MongoDB ❤️‍🔥');
    } catch (error) {
        console.log(`🚨 Error de conexión: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 