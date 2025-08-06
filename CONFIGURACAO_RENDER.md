# 🔧 Configuração do Render e MongoDB Atlas

## 🚨 **PROBLEMA IDENTIFICADO**
O erro `MongooseServerSelectionError: connect ECONNREFUSED` indica que a variável `MONGODB_URI` não está configurada no Render.

## 📋 **PASSO A PASSO PARA RESOLVER**

### 1. **Configurar MongoDB Atlas**

#### 1.1 Criar Conta no MongoDB Atlas
1. Acesse [mongodb.com/atlas](https://mongodb.com/atlas)
2. Clique em "Try Free"
3. Crie uma conta gratuita

#### 1.2 Criar Cluster
1. Clique em "Build a Database"
2. Escolha "FREE" (M0)
3. Selecione um provedor (AWS, Google Cloud, Azure)
4. Escolha uma região (preferencialmente próxima ao Brasil)
5. Clique em "Create"

#### 1.3 Configurar Segurança
1. **Criar Usuário de Banco:**
   - Username: `controle-pontos-user`
   - Password: `SuaSenhaMuitoSegura123!`
   - Role: `Read and write to any database`

2. **Configurar IP Whitelist:**
   - Clique em "Network Access"
   - Clique em "Add IP Address"
   - Clique em "Allow Access from Anywhere" (0.0.0.0/0)
   - Clique em "Confirm"

#### 1.4 Obter String de Conexão
1. Clique em "Database" no menu lateral
2. Clique em "Connect"
3. Escolha "Connect your application"
4. Copie a string de conexão

**Exemplo da string:**
```
mongodb+srv://controle-pontos-user:SuaSenhaMuitoSegura123!@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

### 2. **Configurar Variáveis no Render**

#### 2.1 Acessar o Render
1. Vá para [render.com](https://render.com)
2. Faça login com sua conta GitHub
3. Acesse seu serviço `controle-pontos-familiar`

#### 2.2 Configurar Environment Variables
1. Clique em "Environment" no menu lateral
2. Clique em "Add Environment Variable"
3. Adicione as seguintes variáveis:

| **Key** | **Value** | **Descrição** |
|---------|-----------|---------------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `10000` | Porta do Render |
| `MONGODB_URI` | `mongodb+srv://controle-pontos-user:SuaSenhaMuitoSegura123!@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority` | **SUA STRING DE CONEXÃO** |
| `JWT_SECRET` | `sua-chave-secreta-muito-segura-e-longa-123456789` | Chave para JWT |
| `JWT_EXPIRE` | `24h` | Tempo de expiração do token |
| `BCRYPT_ROUNDS` | `12` | Rounds de criptografia |
| `CORS_ORIGIN` | `https://controle-pontos-familiar.onrender.com` | URL do seu app |

#### 2.3 Salvar e Rebuild
1. Clique em "Save Changes"
2. O Render fará rebuild automático
3. Aguarde alguns minutos

### 3. **Verificar Configuração**

#### 3.1 Verificar Logs
1. No Render, vá em "Logs"
2. Procure por estas mensagens:
```
🔍 Configuração MongoDB:
- MONGODB_URI configurada: true
- Ambiente: production
- URI (mascarada): mongodb+srv://***:***@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
✅ Conectado ao MongoDB com sucesso!
📊 Database: controle-pontos-familiar
```

#### 3.2 Testar API
1. Acesse: `https://controle-pontos-familiar.onrender.com/api/health`
2. Deve retornar:
```json
{
  "success": true,
  "message": "Servidor funcionando!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## 🚨 **PROBLEMAS COMUNS**

### **Erro: MONGODB_URI não configurada**
**Solução:** Configure a variável `MONGODB_URI` no Render

### **Erro: Authentication failed**
**Solução:** Verifique se o usuário e senha estão corretos

### **Erro: Network is unreachable**
**Solução:** Configure o IP whitelist para `0.0.0.0/0`

### **Erro: Server selection timeout**
**Solução:** Verifique se a string de conexão está correta

## 📞 **SUPORTE**

Se ainda tiver problemas:

1. **Verifique os logs** no Render
2. **Teste a conexão** localmente primeiro
3. **Verifique a documentação** do MongoDB Atlas
4. **Entre em contato** com o suporte do Render

---

**🎯 Após configurar, seu sistema estará funcionando no Render!** 🚀 