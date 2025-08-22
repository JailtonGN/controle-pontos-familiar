# 🚀 Guia de Deploy no Render

## 📋 Pré-requisitos

1. **Conta no Render**: [render.com](https://render.com)
2. **Conta no MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Repositório no GitHub**: [github.com/JailtonGN/controle-pontos-familiar](https://github.com/JailtonGN/controle-pontos-familiar)

## 🔧 Configuração do MongoDB Atlas

### 1. **Criar Cluster no MongoDB Atlas**
1. Acesse [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (plano gratuito)
4. Configure o IP whitelist (0.0.0.0/0 para permitir qualquer IP)
5. Crie um usuário de banco de dados
6. Obtenha a string de conexão

### 2. **String de Conexão**
A string será algo como:
```
mongodb+srv://username:password@cluster.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

## 🚀 Deploy no Render

### 1. **Conectar Repositório**
1. Acesse [render.com](https://render.com)
2. Faça login com sua conta GitHub
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório: `JailtonGN/controle-pontos-familiar`

### 2. **Configurar o Serviço**
- **Name**: `controle-pontos-familiar`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (ou mais próxima)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. **Variáveis de Ambiente**
Configure as seguintes variáveis:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `10000` | Porta do Render |
| `MONGODB_URI` | `sua-string-de-conexao` | String do MongoDB Atlas |
| `JWT_SECRET` | `sua-chave-secreta-muito-segura` | Chave para JWT |
| `JWT_EXPIRE` | `24h` | Tempo de expiração do token |
| `BCRYPT_ROUNDS` | `12` | Rounds de criptografia |
| `CORS_ORIGIN` | `https://controle-pontos-familiar.onrender.com` | URL do seu app |

### 4. **Criar o Serviço**
1. Clique em "Create Web Service"
2. Aguarde o build (pode demorar alguns minutos)
3. O Render fornecerá uma URL como: `https://controle-pontos-familiar.onrender.com`

## 🔍 Verificar o Deploy

### 1. **Testar a API**
Acesse: `https://controle-pontos-familiar.onrender.com/api/health`

Deve retornar:
```json
{
  "success": true,
  "message": "Servidor funcionando!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. **Testar a Aplicação**
Acesse: `https://controle-pontos-familiar.onrender.com`

## 📊 Monitoramento

### 1. **Logs**
- Acesse o dashboard do Render
- Vá em "Logs" para ver os logs em tempo real
- Útil para debug de problemas

### 2. **Métricas**
- **Uptime**: Monitora se o serviço está online
- **Response Time**: Tempo de resposta das requisições
- **Error Rate**: Taxa de erros

## 🔧 Configurações Avançadas

### 1. **Auto-Deploy**
- O Render faz deploy automático quando você faz push para o `main`
- Você pode desabilitar isso nas configurações

### 2. **Custom Domain**
- Vá em "Settings" → "Custom Domains"
- Adicione seu domínio personalizado
- Configure os registros DNS

### 3. **Environment Variables**
- Sempre use variáveis de ambiente para dados sensíveis
- Nunca commite chaves secretas no código

## 🚨 Troubleshooting

### **Problema**: Build falha
**Solução**: 
- Verifique se o `package.json` está correto
- Confirme se todas as dependências estão listadas
- Verifique os logs de build

### **Problema**: Erro de conexão com MongoDB
**Solução**:
- Verifique se a string de conexão está correta
- Confirme se o IP whitelist está configurado
- Teste a conexão localmente

### **Problema**: App não carrega
**Solução**:
- Verifique se a porta está configurada corretamente
- Confirme se o comando de start está correto
- Verifique os logs do servidor

### **Problema**: CORS errors
**Solução**:
- Configure corretamente a variável `CORS_ORIGIN`
- Verifique se a URL está correta

## 📱 URLs Importantes

- **Aplicação**: `https://controle-pontos-familiar.onrender.com`
- **API Health**: `https://controle-pontos-familiar.onrender.com/api/health`
- **Dashboard**: `https://controle-pontos-familiar.onrender.com/dashboard`
- **Login**: `https://controle-pontos-familiar.onrender.com`

## 🔐 Segurança

### **Variáveis Sensíveis**
- `JWT_SECRET`: Use uma string longa e aleatória
- `MONGODB_URI`: Mantenha segura a string de conexão
- `NODE_ENV`: Sempre `production` em produção

### **Boas Práticas**
- Nunca commite arquivos `.env`
- Use HTTPS sempre
- Configure CORS adequadamente
- Monitore logs regularmente

## 🎉 Resultado Final

Após o deploy bem-sucedido, você terá:
- ✅ Aplicação online e acessível
- ✅ Banco de dados MongoDB funcionando
- ✅ Sistema de autenticação ativo
- ✅ Interface responsiva
- ✅ Deploy automático configurado

---

**🚀 Seu sistema estará disponível 24/7 no Render!** 🌍 