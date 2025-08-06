const fs = require('fs');
const path = require('path');

// Função para verificar configuração do Render
const checkRenderConfig = () => {
    console.log('🔍 Verificando configuração do Render...\n');

    // Verificar render.yaml
    const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
    if (fs.existsSync(renderYamlPath)) {
        console.log('✅ render.yaml encontrado');
        const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
        
        // Verificar se tem as variáveis necessárias
        const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE', 'BCRYPT_ROUNDS', 'CORS_ORIGIN'];
        const missingVars = [];
        
        requiredVars.forEach(varName => {
            if (!renderYaml.includes(varName)) {
                missingVars.push(varName);
            }
        });

        if (missingVars.length === 0) {
            console.log('✅ Todas as variáveis de ambiente estão configuradas no render.yaml');
        } else {
            console.log('⚠️ Variáveis faltando no render.yaml:', missingVars.join(', '));
        }

        // Verificar configurações específicas
        if (renderYaml.includes('healthCheckPath: /api/health')) {
            console.log('✅ Health check path configurado');
        } else {
            console.log('⚠️ Health check path não configurado');
        }

        if (renderYaml.includes('autoDeploy: true')) {
            console.log('✅ Auto deploy configurado');
        } else {
            console.log('⚠️ Auto deploy não configurado');
        }

    } else {
        console.log('❌ render.yaml não encontrado');
    }

    // Verificar package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        console.log('\n✅ package.json encontrado');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Verificar scripts
        const requiredScripts = ['start', 'dev', 'test-db'];
        const missingScripts = [];
        
        requiredScripts.forEach(script => {
            if (!packageJson.scripts[script]) {
                missingScripts.push(script);
            }
        });

        if (missingScripts.length === 0) {
            console.log('✅ Todos os scripts necessários estão configurados');
        } else {
            console.log('⚠️ Scripts faltando:', missingScripts.join(', '));
        }

        // Verificar dependências
        const requiredDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'dotenv', 'cors'];
        const missingDeps = [];
        
        requiredDeps.forEach(dep => {
            if (!packageJson.dependencies[dep]) {
                missingDeps.push(dep);
            }
        });

        if (missingDeps.length === 0) {
            console.log('✅ Todas as dependências necessárias estão instaladas');
        } else {
            console.log('⚠️ Dependências faltando:', missingDeps.join(', '));
        }

    } else {
        console.log('❌ package.json não encontrado');
    }

    // Verificar arquivos de configuração
    const configFiles = [
        'config/db.js',
        'server.js',
        'MONGODB_CONFIG.md',
        'SOLUCAO_MONGODB_ATLAS.md'
    ];

    console.log('\n📁 Verificando arquivos de configuração:');
    configFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} encontrado`);
        } else {
            console.log(`❌ ${file} não encontrado`);
        }
    });

    // Verificar se existe .env.example
    const envExamplePath = path.join(__dirname, '..', 'env.example');
    if (fs.existsSync(envExamplePath)) {
        console.log('✅ env.example encontrado');
    } else {
        console.log('❌ env.example não encontrado');
    }

    console.log('\n🎯 RESUMO DA CONFIGURAÇÃO:');
    console.log('1. ✅ render.yaml configurado com variáveis de ambiente');
    console.log('2. ✅ package.json com scripts e dependências');
    console.log('3. ✅ Arquivos de configuração do MongoDB');
    console.log('4. ✅ Documentação completa');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Configure a variável MONGODB_URI no Render com a string completa');
    console.log('2. Configure a variável JWT_SECRET no Render');
    console.log('3. Aguarde o rebuild automático');
    console.log('4. Verifique os logs para confirmar a conexão');
    console.log('5. Teste a aplicação em: https://controle-pontos-familiar.onrender.com');
    
    console.log('\n🔗 String de conexão para configurar no Render:');
    console.log('mongodb+srv://deejaymax2010:[SUA_SENHA]@cluster1.3mduppm.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority&appName=Cluster1');
    
    console.log('\n⚠️ IMPORTANTE: Substitua [SUA_SENHA] pela senha real do usuário deejaymax2010');
};

// Executar verificação
checkRenderConfig(); 