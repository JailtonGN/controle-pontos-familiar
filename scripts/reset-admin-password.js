const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('../models/User');

async function resetAdminPassword() {
    try {
        console.log('🔐 Resetando senha do administrador...\n');

        // Buscar usuário admin
        const admin = await User.findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('❌ Nenhum usuário administrador encontrado.');
            console.log('📝 Criando usuário administrador padrão...\n');
            
            // Criar admin padrão
            const newAdmin = new User({
                name: 'Administrador',
                email: 'admin@controlepontos.com',
                password: 'admin123',
                role: 'admin',
                familyId: null // Será definido depois
            });

            // Verificar se existe família ADM
            const Family = require('../models/Family');
            let adminFamily = await Family.findOne({ name: 'Família ADM' });
            
            if (!adminFamily) {
                console.log('📝 Criando Família ADM...');
                adminFamily = new Family({
                    name: 'Família ADM',
                    description: 'Família administrativa do sistema',
                    isActive: true
                });
                await adminFamily.save();
                console.log('✅ Família ADM criada com sucesso');
            }

            newAdmin.familyId = adminFamily._id;
            await newAdmin.save();
            
            console.log('✅ Usuário administrador criado com sucesso!');
            console.log('📧 Email: admin@controlepontos.com');
            console.log('🔑 Senha: admin123');
            console.log('⚠️  IMPORTANTE: Altere esta senha após o primeiro login!\n');
            
        } else {
            console.log(`✅ Usuário administrador encontrado: ${admin.name} (${admin.email})`);
            
            // Definir nova senha
            const newPassword = 'admin123';
            
            // Hash da nova senha
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            // Atualizar senha
            admin.password = hashedPassword;
            await admin.save();
            
            console.log('✅ Senha resetada com sucesso!');
            console.log(`📧 Email: ${admin.email}`);
            console.log('🔑 Nova senha: admin123');
            console.log('⚠️  IMPORTANTE: Altere esta senha após o login!\n');
        }

        console.log('🚀 Agora você pode fazer login com:');
        console.log('   Email: admin@controlepontos.com');
        console.log('   Senha: admin123');
        console.log('\n🔒 Lembre-se de alterar a senha após o login por segurança!');

    } catch (error) {
        console.error('❌ Erro ao resetar senha do admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

async function listAllAdmins() {
    try {
        console.log('👥 Listando todos os administradores...\n');

        const admins = await User.find({ role: 'admin' });
        
        if (admins.length === 0) {
            console.log('❌ Nenhum administrador encontrado no sistema.');
            return;
        }

        console.log(`✅ Encontrados ${admins.length} administrador(es):\n`);
        
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name}`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   📅 Criado em: ${admin.createdAt.toLocaleDateString('pt-BR')}`);
            console.log(`   🔄 Último login: ${admin.lastLogin ? admin.lastLogin.toLocaleDateString('pt-BR') : 'Nunca'}`);
            console.log(`   ✅ Ativo: ${admin.isActive ? 'Sim' : 'Não'}\n`);
        });

    } catch (error) {
        console.error('❌ Erro ao listar administradores:', error);
    } finally {
        mongoose.connection.close();
    }
}

async function createNewAdmin() {
    try {
        console.log('👤 Criando novo administrador...\n');

        // Solicitar dados (simulado - em produção usaria readline)
        const adminData = {
            name: 'Novo Administrador',
            email: 'novoadmin@controlepontos.com',
            password: 'novasenha123'
        };

        // Verificar se email já existe
        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('❌ Já existe um usuário com este email.');
            return;
        }

        // Buscar ou criar família ADM
        const Family = require('../models/Family');
        let adminFamily = await Family.findOne({ name: 'Família ADM' });
        
        if (!adminFamily) {
            adminFamily = new Family({
                name: 'Família ADM',
                description: 'Família administrativa do sistema',
                isActive: true
            });
            await adminFamily.save();
        }

        // Criar novo admin
        const newAdmin = new User({
            name: adminData.name,
            email: adminData.email,
            password: adminData.password,
            role: 'admin',
            familyId: adminFamily._id
        });

        await newAdmin.save();

        console.log('✅ Novo administrador criado com sucesso!');
        console.log(`📧 Email: ${adminData.email}`);
        console.log(`🔑 Senha: ${adminData.password}`);
        console.log('⚠️  Altere a senha após o primeiro login!\n');

    } catch (error) {
        console.error('❌ Erro ao criar novo administrador:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

if (require.main === module) {
    switch (command) {
        case 'list':
            listAllAdmins();
            break;
        case 'create':
            createNewAdmin();
            break;
        case 'reset':
        default:
            resetAdminPassword();
            break;
    }
}

module.exports = { 
    resetAdminPassword, 
    listAllAdmins, 
    createNewAdmin 
};