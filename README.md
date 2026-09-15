# Site oficial da Banda Valete

Projeto Next.js preparado para Vercel, Neon Postgres e Vercel Blob.

## O que está incluído

- Site público com páginas Início, A Banda, Agenda, Música, Vídeos, Fotos e Contato.
- Integrantes com fotos, símbolos individuais e biografia em modal.
- Instagram individual de cada integrante configurável no CMS.
- Galeria organizada por álbuns.
- Formulário de contratação com caixa de entrada e alerta no CMS.
- Painel `/cms` protegido por usuário e senha.
- Upload de imagens pelo painel usando Vercel Blob.
- Termos, Política de Privacidade e crédito centralizado da Forge Labs.

## 1. Criar o banco no Neon

Abra o SQL Editor do projeto Neon e execute todo o conteúdo de `database/schema.sql`.

## 2. Configurar na Vercel

Importe o repositório e adicione estas variáveis em **Settings > Environment Variables**:

- `DATABASE_URL`: conexão fornecida pelo Neon.
- `CMS_USERNAME`: usuário do painel.
- `CMS_PASSWORD`: senha forte do painel.
- `CMS_SECRET`: chave aleatória com pelo menos 32 caracteres.
- `BLOB_READ_WRITE_TOKEN`: criado automaticamente ao conectar um Blob Store ao projeto na Vercel.

Use `.env.example` somente como modelo. Nunca publique sua senha real no GitHub.

## 3. Publicar

A Vercel detecta o Next.js automaticamente. O comando de build é `pnpm build` e a pasta de saída é administrada pelo próprio Next.js.

Depois da publicação:

- Site: `/`
- Login do CMS: `/cms/login`
- Painel: `/cms`

Na primeira abertura, o site usa o conteúdo inicial que já acompanha o projeto. Ao salvar pelo CMS, o conteúdo passa a ser armazenado no Neon.

## Desenvolvimento local

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Preencha `.env.local` antes de testar login, banco e uploads.
