const mongoose = require('mongoose');

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/controle-pontos-familiar', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

        // Criar índices para melhor performance
        await createIndexes();

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

// Função para desconectar do MongoDB
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB desconectado');
    } catch (error) {
        console.error('❌ Erro ao desconectar do MongoDB:', error.message);
    }
};

// Função para criar índices
const createIndexes = async () => {
    try {
        // Índice para usuários (email único)
        await mongoose.connection.db.collection('users').createIndex(
            { email: 1 }, 
            { unique: true }
        );

        // Índice para pontos (kidId + data)
        await mongoose.connection.db.collection('points').createIndex(
            { kidId: 1, date: -1 }
        );

        // Índice para lembretes (kidId + status)
        await mongoose.connection.db.collection('reminders').createIndex(
            { kidId: 1, status: 1 }
        );

        console.log('✅ Índices criados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao criar índices:', error.message);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    createIndexes
}; 