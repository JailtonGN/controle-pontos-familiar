/**
 * Script para verificar se existe conta admin no MongoDB
 */

const mongoose = require('mongoose');

// String de conexão
const MONGODB_URI = 'mongodb+srv://rninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.sddcisb.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority';

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

async function checkAdminExists() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        log('║     VERIFICAR CONTAS ADMIN NO MONGODB                     ║', 'cyan');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        log('🔄 Conectando ao MongoDB...', 'yellow');
        await mongoose.connect(MONGODB_URI);
        log('✅ Conectado ao MongoDB\n', 'green');

        const User = require('../models/User');
        const Family = require('../models/Family');

        // Verificar se existem usuários
        const totalUsers = await User.countDocuments();
        log(`📊 Total de usuários no banco: ${totalUsers}`, 'blue');

        if (totalUsers === 0) {
            log('\n❌ NÃO EXISTEM USUÁRIOS NO BANCO', 'red');
            log('💡 Você precisa criar o primeiro administrador', 'yellow');
            log('   Execute: npm run create-admin\n', 'cyan');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Buscar todos os admins
        const admins = await User.find({ role: 'admin' }).populate('familyId');
        
        if (admins.length === 0) {
            log('\n❌ NÃO EXISTEM ADMINISTRADORES NO BANCO', 'red');
            log('💡 Você precisa criar o primeiro administrador', 'yellow');
            log('   Execute: npm run create-admin\n', 'cyan');
        } else {
            log(`\n✅ ENCONTRADOS ${admins.length} ADMINISTRADOR(ES):\n`, 'green');
            
            for (let i = 0; i < admins.length; i++) {
                const admin = admins[i];
                log(`   ${i + 1}. 👤 ${admin.name}`, 'blue');
                log(`      📧 Email: ${admin.email}`, 'blue');
                log(`      👨‍👩‍👧‍👦 Família: ${admin.familyId ? admin.familyId.name : 'N/A'}`, 'blue');
                log(`      ✅ Ativo: ${admin.isActive ? 'Sim' : 'Não'}`, 'blue');
                log(`      📅 Criado em: ${new Date(admin.createdAt).toLocaleDateString('pt-BR')}`, 'blue');
                log(`      🔑 Último login: ${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}`, 'blue');
                console.log('');
            }
        }

        // Buscar todos os usuários (não admin)
        const parents = await User.find({ role: 'parent' }).populate('familyId');
        
        if (parents.length > 0) {
            log(`📋 OUTROS USUÁRIOS (${parents.length}):\n`, 'cyan');
            
            for (let i = 0; i < parents.length; i++) {
                const parent = parents[i];
                log(`   ${i + 1}. 👤 ${parent.name}`, 'blue');
                log(`      📧 Email: ${parent.email}`, 'blue');
                log(`      👨‍👩‍👧‍👦 Família: ${parent.familyId ? parent.familyId.name : 'N/A'}`, 'blue');
                log(`      ✅ Ativo: ${parent.isActive ? 'Sim' : 'Não'}`, 'blue');
                console.log('');
            }
        }

        // Verificar famílias
        const families = await Family.find();
        log(`👨‍👩‍👧‍👦 Total de famílias: ${families.length}\n`, 'blue');

        if (families.length > 0) {
            log('📋 FAMÍLIAS CADASTRADAS:\n', 'cyan');
            for (const family of families) {
                log(`   - ${family.name}`, 'blue');
                log(`     Ativa: ${family.isActive ? 'Sim' : 'Não'}`, 'blue');
                console.log('');
            }
        }

        // Resumo
        console.log('╔════════════════════════════════════════════════════════════╗');
        log('║                      RESUMO                                ║', 'cyan');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        log(`   👥 Total de usuários: ${totalUsers}`, 'blue');
        log(`   👑 Administradores: ${admins.length}`, admins.length > 0 ? 'green' : 'red');
        log(`   👨‍👩‍👧 Pais/Responsáveis: ${parents.length}`, 'blue');
        log(`   👨‍👩‍👧‍👦 Famílias: ${families.length}\n`, 'blue');

        if (admins.length > 0) {
            log('✅ Você pode fazer login com uma das contas admin acima', 'green');
            log('⚠️  Se esqueceu a senha, use: npm run reset-admin-password\n', 'yellow');
        } else {
            log('❌ Você precisa criar um administrador primeiro', 'red');
            log('💡 Execute: npm run create-admin\n', 'yellow');
        }

        await mongoose.disconnect();
        log('✅ Desconectado do MongoDB\n', 'green');
        
        process.exit(0);

    } catch (error) {
        log('\n❌ ERRO AO VERIFICAR BANCO DE DADOS\n', 'red');
        
        if (error.name === 'MongoServerSelectionError') {
            log('🔍 Não foi possível conectar ao MongoDB', 'yellow');
            log('💡 Verifique:', 'cyan');
            log('   1. String de conexão está correta', 'cyan');
            log('   2. Whitelist configurada (0.0.0.0/0)', 'cyan');
            log('   3. Cluster está ativo\n', 'cyan');
        } else {
            log(`🔍 Erro: ${error.message}\n`, 'yellow');
        }

        await mongoose.disconnect();
        process.exit(1);
    }
}

// Executar
log('\n⚠️  Este script verificará se existem contas admin no MongoDB', 'yellow');
log('   Conectando ao banco de dados...\n', 'yellow');

checkAdminExists();
