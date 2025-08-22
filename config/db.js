const mongoose = require('mongoose');

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        // Verificar se a variável de ambiente está configurada
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGODB_URI não configurada!');
            console.error('Configure a variável de ambiente MONGODB_URI no Render');
            console.error('Exemplo: mongodb+srv://username:password@cluster.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority');
            console.error('Para teste local, crie um arquivo .env com MONGODB_URI');
            return; // Não sai do processo, apenas retorna
        }



        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });



        // Criar índices para melhor performance
        await createIndexes();

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        console.error('🔧 Verifique:');
        console.error('  1. Se a MONGODB_URI está configurada no Render');
        console.error('  2. Se a string de conexão está correta');
        console.error('  3. Se o IP whitelist está configurado no MongoDB Atlas');
        console.error('  4. Se o usuário e senha estão corretos');
        console.error('⚠️ Servidor continuará rodando sem conexão com MongoDB');
    }
};

// Função para desconectar do MongoDB
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erro ao desconectar do MongoDB:', error.message);
    }
};

// Função para criar índices
const createIndexes = async () => {
    try {
        // Verificar se a conexão está ativa
        if (!mongoose.connection || mongoose.connection.readyState !== 1) {
            return;
        }

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


    } catch (error) {
        console.error('❌ Erro ao criar índices:', error.message);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    createIndexes
}; 