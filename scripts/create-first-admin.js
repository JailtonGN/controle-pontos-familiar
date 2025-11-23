/**
 * Script para criar o primeiro usuário administrador
 * Use este script após fazer deploy para criar o primeiro acesso ao sistema
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createFirstAdmin() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║     CRIAR PRIMEIRO ADMINISTRADOR DO SISTEMA               ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Conectar ao MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI não encontrado no .env');
            console.log('💡 Crie um arquivo .env com a string de conexão do MongoDB');
            process.exit(1);
        }

        console.log('🔄 Conectando ao MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB\n');

        const User = require('../models/User');
        const Family = require('../models/Family');

        // Verificar se já existe admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  JÁ EXISTE UM ADMINISTRADOR NO SISTEMA!');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Nome: ${existingAdmin.name}\n`);
            
            const continuar = await question('Deseja criar outro admin? (s/n): ');
            if (continuar.toLowerCase() !== 's') {
                console.log('❌ Operação cancelada');
                process.exit(0);
            }
        }

        // Coletar dados do admin
        console.log('\n📝 Preencha os dados do administrador:\n');
        
        const name = await question('Nome completo: ');
        if (!name || name.trim() === '') {
            console.error('❌ Nome é obrigatório');
            process.exit(1);
        }

        const email = await question('Email: ');
        if (!email || !email.includes('@')) {
            console.error('❌ Email inválido');
            process.exit(1);
        }

        // Verificar se email já existe
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            console.error('❌ Este email já está em uso');
            process.exit(1);
        }

        const password = await question('Senha (mínimo 6 caracteres): ');
        if (!password || password.length < 6) {
            console.error('❌ Senha deve ter no mínimo 6 caracteres');
            process.exit(1);
        }

        const passwordConfirm = await question('Confirme a senha: ');
        if (password !== passwordConfirm) {
            console.error('❌ As senhas não coincidem');
            process.exit(1);
        }

        console.log('\n🔄 Criando administrador...\n');

        // Criar ou buscar Família ADM
        let adminFamily = await Family.findOne({ name: 'Família ADM' });
        
        if (!adminFamily) {
            // Criar família temporária sem createdBy
            adminFamily = new Family({
                name: 'Família ADM',
                description: 'Família administrativa do sistema',
                isActive: true
            });
            
            // Salvar sem validação para permitir createdBy null temporariamente
            await adminFamily.save({ validateBeforeSave: false });
            console.log('✅ Família ADM criada');
        }

        // Criar usuário admin
        const admin = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password, // Será hasheada automaticamente pelo pre-save hook
            role: 'admin',
            familyId: adminFamily._id,
            isActive: true
        });

        // Atualizar createdBy da família se estava null
        if (!adminFamily.createdBy) {
            adminFamily.createdBy = admin._id;
            await adminFamily.save();
            console.log('✅ Família ADM atualizada');
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║          ADMINISTRADOR CRIADO COM SUCESSO!                ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        console.log('📋 DADOS DE ACESSO:\n');
        console.log(`   👤 Nome: ${admin.name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Senha: ${password}`);
        console.log(`   👑 Perfil: Administrador`);
        console.log(`   👨‍👩‍👧‍👦 Família: ${adminFamily.name}\n`);
        
        console.log('⚠️  IMPORTANTE:');
        console.log('   - Guarde estas credenciais em local seguro');
        console.log('   - Altere a senha após o primeiro login');
        console.log('   - Não compartilhe estas informações\n');

        await mongoose.disconnect();
        console.log('✅ Desconectado do MongoDB\n');
        
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERRO AO CRIAR ADMINISTRADOR:\n');
        console.error(error.message);
        
        if (error.code === 11000) {
            console.error('\n💡 Este email já está cadastrado no sistema');
        }
        
        await mongoose.disconnect();
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Executar
console.log('\n⚠️  ATENÇÃO: Este script criará um usuário administrador no sistema.');
console.log('   Certifique-se de que o arquivo .env está configurado corretamente.\n');

createFirstAdmin();
