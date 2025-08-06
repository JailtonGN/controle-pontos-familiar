const mongoose = require('mongoose');
require('dotenv').config();

// Função para testar conexão com MongoDB Atlas
const testConnection = async () => {
    try {
        console.log('🔍 Testando conexão com MongoDB Atlas...');
        console.log('📊 Configurações:');
        console.log('- MONGODB_URI configurada:', !!process.env.MONGODB_URI);
        console.log('- Ambiente:', process.env.NODE_ENV);
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI não configurada!');
            console.error('Configure a variável de ambiente MONGODB_URI');
            process.exit(1);
        }

        console.log('- URI (mascarada):', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Conexão bem-sucedida!');
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`📊 Port: ${conn.connection.port}`);
        console.log(`📊 Ready State: ${conn.connection.readyState}`);

        // Testar operação básica
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`📊 Collections encontradas: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('📋 Collections:');
            collections.forEach(collection => {
                console.log(`  - ${collection.name}`);
            });
        }

        await mongoose.disconnect();
        console.log('✅ Teste concluído com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        console.error('🔧 Verifique:');
        console.error('  1. Se a MONGODB_URI está configurada corretamente');
        console.error('  2. Se o usuário e senha estão corretos');
        console.error('  3. Se o IP whitelist está configurado no MongoDB Atlas');
        console.error('  4. Se o cluster está ativo');
        console.error('  5. Se a string de conexão está completa');
        process.exit(1);
    }
};

// Executar teste
testConnection(); 