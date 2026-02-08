# Configurando o Google Maps para Encontrar Igrejas

Para que seu aplicativo encontre igrejas católicas próximas usando o Google (que é muito mais preciso que o OpenStreetMap atual), você precisa de uma **Chave de API**.

Siga este passo a passo:

## 1. Criar um Projeto no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Faça login com sua conta Google.
3. No topo, clique no seletor de projetos e depois em **"Novo Projeto"**.
4. Dê um nome (ex: `Fides App`) e clique em **Criar**.

## 2. Ativar a Places API
1. No menu lateral, vá em **APIs e Serviços** > **Biblioteca**.
2. Na barra de busca, digite **"Places API (New)"**.
   * *Nota: Certifique-se de escolher a versão "New" se disponível, ou a "Places API" padrão.*
3. Clique nela e depois no botão **Ativar**.

## 3. Criar a Chave de API (API Key)
1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**.
2. Clique em **+ CRIA CREDENCIAIS** (no topo) > **Chave de API**.
3. **Copie a chave gerada** (ela começa com `AIza...`).

## 4. Configurar no Projeto
1. Volte aqui para o cursor.
2. Abra o arquivo `.env`.
3. Adicione (ou me mande) a seguinte linha:

```env
VITE_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

---

### ⚠️ Importante sobre Custos
* A Google oferece **$200 dólares de crédito mensal gratuito**. Isso é suficiente para milhares de buscas por mês.
* Você precisará cadastrar um cartão de crédito para ativar a conta (para verificar que você não é um robô), mas não será cobrado se ficar dentro do limite gratuito.

---
**Quando tiver a chave, me avise ou cole ela aqui para eu atualizar o código!**
