# Hub Estratégico — Bih × Júnior

## Como publicar (passo a passo)

### 1. Criar o banco de dados gratuito (JSONBin)

1. Acesse https://jsonbin.io e crie conta gratuita (pode usar Google)
2. Clique em **"Create Bin"**
3. Cole este JSON inicial e clique em **Create**:
```json
{"metas":{},"ideias":[],"reunioes":[],"checklist":[]}
```
4. Copie o **BIN ID** que aparece na URL (ex: `64abc123def456`)
5. Vá em **API Keys** no menu, copie sua **Master Key**

---

### 2. Subir o projeto no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `bih-hub`
3. Clique em **Create repository**
4. Na tela seguinte, clique em **"uploading an existing file"**
5. Faça upload de **todos os arquivos** desta pasta
6. Clique em **Commit changes**

---

### 3. Publicar no Vercel

1. Acesse https://vercel.com e entre com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `bih-hub`
4. Antes de clicar em Deploy, clique em **"Environment Variables"** e adicione:
   - `VITE_BIN_ID` → cole o BIN ID do passo 1
   - `VITE_JSONBIN_KEY` → cole a Master Key do passo 1
5. Clique em **Deploy**
6. Em ~1 minuto você terá um link tipo `bih-hub.vercel.app`

---

### Pronto! 🚀

Mande o link para a Bih. Os dois acessam, os dois editam, os dois veem os mesmos dados.

- Qualquer alteração feita por um aparece para o outro em até 30 segundos
- Funciona no celular e no computador
- Gratuito para sempre dentro do uso normal

---

## Estrutura do projeto

```
bih-hub/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx      ← hub completo
    └── storage.js   ← lógica de sync compartilhado
```
