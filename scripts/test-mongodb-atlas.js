/**
 * Script para testar conexão com MongoDB Atlas
 * Testa a conexão e lista informações do banco
 */

const mongoose = require('mongoose');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Cores para console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testMongoDBConnection() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        log('║     TESTE DE CONEXÃO - MONGODB ATLAS                      ║', 'cyan');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Solicitar URL do cluster
        log('📝 Suas credenciais:', 'blue');
        log('   Usuário: ninformax_db_user', 'blue');
        log('   Senha: 9AUQFEgSIOAk7LDz\n', 'blue');

        log('❓ Você precisa da URL do seu cluster MongoDB Atlas', 'yellow');
        log('   Exemplo: cluster0.abc123.mongodb.net\n', 'yellow');

        const clusterUrl = await question('Digite a URL do cluster (sem mongodb+srv://): ');
        
        if (!clusterUrl || clusterUrl.trim() === '') {
            log('❌ URL do cluster é obrigatória', 'red');
            process.exit(1);
        }

        // Montar string de conexão
        const mongoUri = `mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@${clusterUrl.trim()}/controle-pontos-familiar?retryWrites=true&w=majority`;

        log('\n🔗 String de conexão montada:', 'cyan');
        log(`   ${mongoUri}\n`, 'blue');

        log('🔄 Testando conexão...', 'yellow');
        
        // Tentar conectar
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 segundos timeout
            socketTimeoutMS: 45000,
        });

        log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!\n', 'green');

        // Obter informações do banco
        const db = mongoose.connection.db;
        const admin = db.admin();

        log('📊 Informações do Banco de Dados:\n', 'cyan');

        // Nome do banco
        log(`   📁 Banco: ${db.databaseName}`, 'blue');

        // Listar collections
        const collections = await db.listCollections().toArray();
        log(`   📚 Collections: ${collections.length}`, 'blue');
        
        if (collections.length > 0) {
            log('\n   Collections encontradas:', 'blue');
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                log(`      - ${col.name}: ${count} documentos`, 'blue');
            }
        } else {
            log('      (Nenhuma collection criada ainda)', 'yellow');
        }

        // Estatísticas do servidor
        try {
            const serverStatus = await admin.serverStatus();
            log(`\n   🖥️  Versão MongoDB: ${serverStatus.version}`, 'blue');
            log(`   ⏱️  Uptime: ${Math.floor(serverStatus.uptime / 60)} minutos`, 'blue');
        } catch (error) {
            log('\n   ⚠️  Não foi possível obter estatísticas do servidor', 'yellow');
        }

        // Testar operação de escrita
        log('\n🧪 Testando operação de escrita...', 'yellow');
        
        const testCollection = db.collection('_test_connection');
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Teste de conexão bem-sucedido'
        };
        
        await testCollection.insertOne(testDoc);
        log('   ✅ Escrita bem-sucedida', 'green');
        
        // Testar operação de leitura
        log('🧪 Testando operação de leitura...', 'yellow');
        const readDoc = await testCollection.findOne({ test: true });
        log('   ✅ Leitura bem-sucedida', 'green');
        
        // Limpar documento de teste
        await testCollection.deleteOne({ test: true });
        log('   ✅ Limpeza bem-sucedida\n', 'green');

        // Resumo
        console.log('╔════════════════════════════════════════════════════════════╗');
        log('║                    TESTE CONCLUÍDO                         ║', 'green');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        log('✅ Todas as operações foram bem-sucedidas!', 'green');
        log('✅ Sua conexão com MongoDB Atlas está funcionando perfeitamente!\n', 'green');

        log('📋 String de Conexão para usar no Render:', 'cyan');
        log(`\n${mongoUri}\n`, 'blue');

        log('💡 Copie esta string e adicione como variável MONGODB_URI no Render\n', 'yellow');

        // Desconectar
        await mongoose.disconnect();
        log('✅ Desconectado do MongoDB\n', 'green');

        process.exit(0);

    } catch (error) {
        log('\n❌ ERRO AO CONECTAR COM MONGODB ATLAS\n', 'red');
        
        if (error.name === 'MongoServerSelectionError') {
            log('🔍 Possíveis causas:', 'yellow');
            log('   1. URL do cluster incorreta', 'yellow');
            log('   2. Credenciais inválidas', 'yellow');
            log('   3. IP não está na whitelist do MongoDB Atlas', 'yellow');
            log('   4. Cluster não está ativo\n', 'yellow');
            
            log('💡 Soluções:', 'cyan');
            log('   1. Verifique a URL do cluster no MongoDB Atlas', 'cyan');
            log('   2. Confirme usuário e senha', 'cyan');
            log('   3. Adicione 0.0.0.0/0 na whitelist (Network Access)', 'cyan');
            log('   4. Aguarde alguns minutos se o cluster foi criado recentemente\n', 'cyan');
        } else if (error.name === 'MongoParseError') {
            log('🔍 Erro de formato na string de conexão', 'yellow');
            log('💡 Verifique se a URL do cluster está correta\n', 'cyan');
        } else {
            log(`🔍 Erro: ${error.message}\n`, 'yellow');
        }

        log('📚 Detalhes do erro:', 'red');
        console.error(error);

        await mongoose.disconnect();
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Executar
log('\n⚠️  Este script testará a conexão com seu MongoDB Atlas', 'yellow');
log('   Você precisará fornecer a URL do seu cluster\n', 'yellow');

testMongoDBConnection();
