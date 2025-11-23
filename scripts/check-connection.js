/**
 * Script para verificar qual banco está sendo usado
 */

const mongoose = require('mongoose');
require('dotenv').config();

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

async function checkConnection() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        log('║     VERIFICAR CONEXÃO E BANCO DE DADOS                    ║', 'cyan');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Verificar variável de ambiente
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            log('❌ MONGODB_URI não encontrada no .env', 'red');
            log('💡 Crie um arquivo .env com MONGODB_URI\n', 'yellow');
            process.exit(1);
        }

        log('📋 INFORMAÇÕES DA CONEXÃO:\n', 'cyan');
        
        // Extrair informações da string
        const uriParts = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
        
        if (uriParts) {
            log(`   👤 Usuário: ${uriParts[1]}`, 'blue');
            log(`   🔑 Senha: ${'*'.repeat(uriParts[2].length)}`, 'blue');
            log(`   🌐 Cluster: ${uriParts[3]}`, 'blue');
            log(`   📁 Banco: ${uriParts[4]}`, 'green');
        }
        
        log(`\n🔗 String completa:`, 'cyan');
        log(`   ${mongoUri.substring(0, 50)}...`, 'blue');

        log('\n🔄 Conectando ao MongoDB...', 'yellow');
        await mongoose.connect(mongoUri);
        log('✅ Conectado ao MongoDB\n', 'green');

        const db = mongoose.connection.db;
        
        log('📊 INFORMAÇÕES DO BANCO:\n', 'cyan');
        log(`   📁 Nome do banco: ${db.databaseName}`, 'green');
        
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

        // Verificar usuários
        const User = require('../models/User');
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: 'admin' });
        
        log(`\n👥 USUÁRIOS:\n`, 'cyan');
        log(`   Total: ${totalUsers}`, 'blue');
        log(`   Admins: ${admins}`, 'blue');

        if (admins > 0) {
            const adminList = await User.find({ role: 'admin' }).select('name email');
            log('\n   Administradores:', 'green');
            adminList.forEach(admin => {
                log(`      - ${admin.name} (${admin.email})`, 'green');
            });
        }

        await mongoose.disconnect();
        log('\n✅ Desconectado do MongoDB\n', 'green');
        
        process.exit(0);

    } catch (error) {
        log('\n❌ ERRO\n', 'red');
        log(`🔍 ${error.message}\n`, 'yellow');
        
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkConnection();
