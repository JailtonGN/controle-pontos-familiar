const mongoose = require('mongoose');
require('dotenv').config();

// Função para testar a nova senha do MongoDB
const testNewPassword = async () => {
    try {
        console.log('🔍 Testando nova senha do MongoDB...');
        console.log('📊 Nova senha: TyCsPlZNsDWOM46N');
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI não configurada!');
            console.error('Configure a variável de ambiente MONGODB_URI');
            console.error('Exemplo: mongodb+srv://seu_usuario:TyCsPlZNsDWOM46N@seu_cluster.mongodb.net/controle-pontos-familiar');
            process.exit(1);
        }

        console.log('- URI (mascarada):', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Conexão bem-sucedida com a nova senha!');
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
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
        console.log('✅ Teste da nova senha concluído com sucesso!');
        console.log('🚀 Agora você pode atualizar a senha no Render!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao conectar com a nova senha:', error.message);
        console.error('🔧 Verifique:');
        console.error('  1. Se a string de conexão está correta');
        console.error('  2. Se o usuário e nova senha estão corretos');
        console.error('  3. Se o IP whitelist está configurado no MongoDB Atlas');
        console.error('  4. Se o cluster está ativo');
        process.exit(1);
    }
};

// Função para gerar string de conexão com nova senha
const generateConnectionString = () => {
    console.log('🔧 Gerando string de conexão com nova senha...');
    console.log('');
    console.log('📋 Substitua os valores abaixo:');
    console.log('');
    console.log('mongodb+srv://SEU_USUARIO:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Substitua SEU_USUARIO pelo seu nome de usuário do MongoDB Atlas');
    console.log('   - Substitua SEU_CLUSTER pelo nome do seu cluster');
    console.log('   - Mantenha TyCsPlZNsDWOM46N como a nova senha');
    console.log('');
    console.log('🚀 Use esta string no Render:');
    console.log('   1. Vá para o dashboard do Render');
    console.log('   2. Encontre seu serviço controle-pontos-familiar');
    console.log('   3. Vá em Environment → MONGODB_URI');
    console.log('   4. Substitua pela nova string');
    console.log('   5. Salve e aguarde o deploy');
};

// Verificar argumentos
const args = process.argv.slice(2);

if (args.includes('--generate')) {
    generateConnectionString();
} else {
    testNewPassword();
} 