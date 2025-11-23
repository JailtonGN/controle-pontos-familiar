/**
 * Script para resetar senha de um usuário
 */

const mongoose = require('mongoose');
const readline = require('readline');

// String de conexão
const MONGODB_URI = 'mongodb+srv://rninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.sddcisb.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority';

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

async function resetPassword() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        log('║          RESETAR SENHA DE USUÁRIO                         ║', 'cyan');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        log('🔄 Conectando ao MongoDB...', 'yellow');
        await mongoose.connect(MONGODB_URI);
        log('✅ Conectado ao MongoDB\n', 'green');

        const User = require('../models/User');

        // Listar usuários
        const users = await User.find().select('name email role isActive');
        
        if (users.length === 0) {
            log('❌ Nenhum usuário encontrado no banco', 'red');
            await mongoose.disconnect();
            process.exit(1);
        }

        log('📋 USUÁRIOS CADASTRADOS:\n', 'cyan');
        users.forEach((user, index) => {
            log(`   ${index + 1}. ${user.name}`, 'blue');
            log(`      📧 ${user.email}`, 'blue');
            log(`      👑 ${user.role === 'admin' ? 'Administrador' : 'Responsável'}`, 'blue');
            log(`      ✅ ${user.isActive ? 'Ativo' : 'Inativo'}\n`, 'blue');
        });

        // Solicitar email
        const email = await question('Digite o email do usuário: ');
        
        if (!email || email.trim() === '') {
            log('❌ Email é obrigatório', 'red');
            await mongoose.disconnect();
            process.exit(1);
        }

        // Buscar usuário
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        if (!user) {
            log(`❌ Usuário com email "${email}" não encontrado`, 'red');
            await mongoose.disconnect();
            process.exit(1);
        }

        log(`\n✅ Usuário encontrado: ${user.name}\n`, 'green');

        // Solicitar nova senha
        const newPassword = await question('Digite a nova senha (mínimo 6 caracteres): ');
        
        if (!newPassword || newPassword.length < 6) {
            log('❌ Senha deve ter no mínimo 6 caracteres', 'red');
            await mongoose.disconnect();
            process.exit(1);
        }

        const confirmPassword = await question('Confirme a nova senha: ');
        
        if (newPassword !== confirmPassword) {
            log('❌ As senhas não coincidem', 'red');
            await mongoose.disconnect();
            process.exit(1);
        }

        // Atualizar senha
        user.password = newPassword; // Será hasheada automaticamente pelo pre-save hook
        await user.save();

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        log('║              SENHA RESETADA COM SUCESSO!                  ║', 'green');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        log('📋 NOVAS CREDENCIAIS:\n', 'cyan');
        log(`   👤 Nome: ${user.name}`, 'blue');
        log(`   📧 Email: ${user.email}`, 'blue');
        log(`   🔑 Nova Senha: ${newPassword}`, 'blue');
        log(`   👑 Perfil: ${user.role === 'admin' ? 'Administrador' : 'Responsável'}\n`, 'blue');

        log('✅ Você já pode fazer login com a nova senha!', 'green');
        log('🌐 URL: https://controledepontos4-0.onrender.com/\n', 'cyan');

        await mongoose.disconnect();
        log('✅ Desconectado do MongoDB\n', 'green');
        
        process.exit(0);

    } catch (error) {
        log('\n❌ ERRO AO RESETAR SENHA\n', 'red');
        log(`🔍 Erro: ${error.message}\n`, 'yellow');
        
        await mongoose.disconnect();
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Executar
log('\n⚠️  Este script resetará a senha de um usuário', 'yellow');
log('   Conectando ao banco de dados...\n', 'yellow');

resetPassword();
