# 🔒 Configurar Network Access no MongoDB Atlas

## 📍 Como Encontrar Network Access

### Passo 1: Acessar MongoDB Atlas

1. Acesse: https://cloud.mongodb.com
2. Faça login com sua conta

### Passo 2: Localizar o Menu

Após fazer login, você verá um **menu lateral ESQUERDO** com várias opções:

```
┌─────────────────────────┐
│ 🏠 Overview            │
│ 📊 Charts              │
│ 🗄️  Database           │ ← Você está aqui provavelmente
│ 🔐 Security            │ ← CLIQUE AQUI!
│    ├─ Database Access  │
│    └─ Network Access   │ ← ESTÁ AQUI!
│ 📈 Metrics             │
│ ⚙️  Settings           │
└─────────────────────────┘
```

### Passo 3: Expandir Security

1. No menu lateral esquerdo, procure por **"Security"** ou **"SECURITY"**
2. Clique em **"Security"** para expandir
3. Você verá duas opções:
   - **Database Access** (usuários do banco)
   - **Network Access** (IPs permitidos) ← **CLIQUE AQUI!**

---

## 🎯 Caminho Alternativo

Se não encontrar "Security", tente:

### Opção 1: Menu Superior
1. Procure por **"Network Access"** no menu superior
2. Ou clique em **"Security"** no topo

### Opção 2: URL Direta
Acesse diretamente:
```
https://cloud.mongodb.com/v2/[SEU-PROJECT-ID]#/security/network/accessList
```

### Opção 3: Pelo Database
1. Clique em **"Database"** no menu lateral
2. No seu cluster, clique em **"..."** (três pontos)
3. Selecione **"Edit Configuration"**
4. Vá em **"Network Access"**

---

## ✅ Quando Encontrar Network Access

Você verá uma tela com:
- Título: **"Network Access"** ou **"IP Access List"**
- Botão: **"Add IP Address"** ou **"+ ADD IP ADDRESS"**
- Lista de IPs permitidos (pode estar vazia)

### Adicionar IP:

1. Clique em **"Add IP Address"** ou **"+ ADD IP ADDRESS"**
2. Uma janela popup abrirá
3. Você verá opções:
   - **Add Current IP Address** (seu IP atual)
   - **Allow Access from Anywhere** ← **SELECIONE ESTA!**
   - **Add IP Address** (manual)

4. Clique em **"Allow Access from Anywhere"**
5. Vai preencher automaticamente: `0.0.0.0/0`
6. Adicione um comentário: `Render e desenvolvimento`
7. Clique em **"Confirm"** ou **"Add Entry"**

---

## 🔍 Estrutura Visual do MongoDB Atlas

```
┌──────────────────────────────────────────────────────────┐
│  MongoDB Atlas                                    [User] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────────────────────────┐  │
│  │             │  │                                   │  │
│  │  MENU       │  │  CONTEÚDO PRINCIPAL              │  │
│  │  LATERAL    │  │                                   │  │
│  │             │  │  [Aqui aparece o conteúdo]       │  │
│  │  Overview   │  │                                   │  │
│  │  Database   │  │                                   │  │
│  │  Security   │◄─┤  Clique aqui!                    │  │
│  │   ├─ DB     │  │                                   │  │
│  │   └─ Net    │  │                                   │  │
│  │  Metrics    │  │                                   │  │
│  │             │  │                                   │  │
│  └─────────────┘  └──────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📱 Se Estiver no Mobile/Tablet

1. Clique no **menu hambúrguer** (☰) no canto superior esquerdo
2. Role até encontrar **"Security"**
3. Toque em **"Security"**
4. Toque em **"Network Access"**

---

## 🆘 Ainda Não Encontrou?

### Verifique se você está na tela certa:

1. **URL deve ser:** `cloud.mongodb.com`
2. **Deve ver:** Nome do seu projeto no topo
3. **Deve ver:** Menu lateral com várias opções

### Se estiver em outra tela:

1. Clique no **logo MongoDB** no canto superior esquerdo
2. Selecione seu projeto
3. Agora deve ver o menu lateral completo

---

## 🎯 Resumo Rápido

1. ✅ Acesse: https://cloud.mongodb.com
2. ✅ Menu lateral esquerdo → **"Security"**
3. ✅ Clique em **"Network Access"**
4. ✅ Clique em **"Add IP Address"**
5. ✅ Selecione **"Allow Access from Anywhere"**
6. ✅ IP: `0.0.0.0/0`
7. ✅ Clique em **"Confirm"**
8. ✅ Aguarde 2-3 minutos

---

## 📸 O Que Você Deve Ver

### Antes de Adicionar:
```
Network Access
┌────────────────────────────────────────┐
│  + ADD IP ADDRESS                      │
├────────────────────────────────────────┤
│  No IP addresses configured            │
│  Add an IP address to get started      │
└────────────────────────────────────────┘
```

### Depois de Adicionar:
```
Network Access
┌────────────────────────────────────────┐
│  + ADD IP ADDRESS                      │
├────────────────────────────────────────┤
│  IP Address: 0.0.0.0/0                │
│  Comment: Render e desenvolvimento     │
│  Status: Active ✓                      │
└────────────────────────────────────────┘
```

---

## 💡 Dica

Se você conseguiu criar o cluster e o usuário do banco, o Network Access está no mesmo lugar, só que em outra aba!

**Caminho completo:**
```
MongoDB Atlas → Security → Network Access → Add IP Address
```

---

## 🔗 Links Úteis

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentação:** https://docs.atlas.mongodb.com/security/ip-access-list/

---

**Me avise quando encontrar! 🚀**

*Guia criado em: ${new Date().toLocaleDateString('pt-BR')}*
