# Fides - Sob o Manto de Maria

## Estrutura do projeto (Back e Front separados)

- **Frontend**: aplicação React (Vite) na raiz do repositório. Roda em `http://localhost:8080`.
- **Backend**: API Node (Express) na pasta `backend/`. Roda em `http://localhost:3001`.

### Variáveis de ambiente

**Frontend** (arquivo `.env` na raiz):

- `VITE_SUPABASE_URL` – URL do projeto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` – Chave anônima do Supabase
- `VITE_API_URL` – URL da API (ex.: `http://localhost:3001`). Opcional; padrão: `http://localhost:3001`

**Backend** (arquivo `backend/.env`):

- `PORT` – Porta do servidor (padrão: 3001)
- `FRONTEND_URL` – URL do frontend para CORS (ex.: `http://localhost:8080`)
- `SUPABASE_URL` – Mesmo valor de `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` – Mesmo valor de `VITE_SUPABASE_PUBLISHABLE_KEY`

### Como rodar

1. **Instalar dependências**
   ```sh
   npm i
   cd backend && npm i && cd ..
   ```

2. **Subir o backend**
   ```sh
   cd backend
   cp .env.example .env
   # Edite backend/.env com SUPABASE_URL e SUPABASE_ANON_KEY
   npm run dev
   ```
   Em outro terminal:

3. **Subir o frontend**
   ```sh
   npm run dev
   ```

4. Acesse o app em `http://localhost:8080`. Login/registro são feitos via backend (Supabase Auth).

---

## Project info (Lovable)

**URL**: https://lovable.dev/projects/c7bbdb63-024e-4d15-aa55-3d16073dece4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7bbdb63-024e-4d15-aa55-3d16073dece4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7bbdb63-024e-4d15-aa55-3d16073dece4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
