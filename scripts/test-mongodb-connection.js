const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testando conexão com MongoDB Atlas...');
    console.log('==========================================');
    
    try {
        // Verificar se as variáveis estão configuradas
        console.log('\n📋 Verificando configurações:');
        console.log('- MONGODB_URI configurada:', !!process.env.MONGODB_URI);
        console.log('- JWT_SECRET configurada:', !!process.env.JWT_SECRET);
        console.log('- PORT configurada:', process.env.PORT || '3000');
        console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI não encontrada no arquivo .env');
            process.exit(1);
        }
        
        // Mascarar a senha na URL para exibição
        const maskedURI = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':***@');
        console.log('- URI (mascarada):', maskedURI);
        
        console.log('\n🔌 Tentando conectar...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Conexão estabelecida com sucesso!');
        console.log('📊 Detalhes da conexão:');
        console.log('- Host:', conn.connection.host);
        console.log('- Database:', conn.connection.name);
        console.log('- ReadyState:', conn.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
        console.log('- Collections disponíveis:', Object.keys(conn.connection.collections).length);
        
        // Testar uma operação simples
        console.log('\n🧪 Testando operação no banco...');
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('✅ Collections encontradas:', collections.length);
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        
        // Testar criação de índices
        console.log('\n🔧 Testando criação de índices...');
        try {
            await conn.connection.db.collection('test').createIndex({ testField: 1 });
            console.log('✅ Índice de teste criado com sucesso');
            await conn.connection.db.collection('test').drop();
            console.log('✅ Collection de teste removida');
        } catch (indexError) {
            console.log('⚠️ Aviso ao testar índices:', indexError.message);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Teste concluído com sucesso!');
        console.log('🎉 MongoDB Atlas está funcionando corretamente!');
        
    } catch (error) {
        console.error('\n❌ Erro na conexão:', error.message);
        console.error('\n🔧 Possíveis soluções:');
        console.error('  1. Verifique se a senha está correta na MONGODB_URI');
        console.error('  2. Verifique se o IP está liberado no MongoDB Atlas');
        console.error('  3. Verifique se o cluster está ativo');
        console.error('  4. Verifique a conectividade com a internet');
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('\n🌐 Erro de seleção do servidor - possíveis causas:');
            console.error('  - Cluster inativo ou pausado');
            console.error('  - IP não autorizado no Network Access');
            console.error('  - Problemas de conectividade');
        }
        
        if (error.name === 'MongoParseError') {
            console.error('\n🔗 Erro na string de conexão - verifique:');
            console.error('  - Formato da URI');
            console.error('  - Caracteres especiais na senha');
            console.error('  - Nome do cluster');
        }
        
        process.exit(1);
    }
}

// Executar o teste
testConnection();