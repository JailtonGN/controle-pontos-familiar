const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔍 Encontrando String de Conexão do MongoDB Atlas');
console.log('================================================');
console.log('');

console.log('📋 Passos para encontrar o nome do cluster:');
console.log('');
console.log('1. Acesse: https://mongodb.com/atlas');
console.log('2. Faça login com sua conta');
console.log('3. Clique em "Browse Collections" ou "Database"');
console.log('4. Na página principal, você verá o nome do cluster');
console.log('5. Exemplo: cluster0.abc123.mongodb.net');
console.log('');

console.log('💡 Dica: O nome do cluster aparece na URL ou no título da página');
console.log('');

rl.question('🔧 Digite o nome do seu cluster (ex: cluster0.abc123): ', (clusterName) => {
    console.log('');
    console.log('✅ String de conexão correta:');
    console.log('');
    console.log(`mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@${clusterName}.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority`);
    console.log('');
    console.log('🚀 Use esta string no Render:');
    console.log('1. Vá para o dashboard do Render');
    console.log('2. Encontre seu serviço controle-pontos-familiar');
    console.log('3. Vá em Environment → MONGODB_URI');
    console.log('4. Substitua pela string acima');
    console.log('5. Salve e aguarde o deploy');
    console.log('');
    console.log('🔍 Para testar localmente, crie um arquivo .env com:');
    console.log(`MONGODB_URI=mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@${clusterName}.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority`);
    console.log('');
    
    rl.close();
});

rl.on('close', () => {
    console.log('✅ Processo concluído!');
    process.exit(0);
}); 