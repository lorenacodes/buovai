# Buovai — Site institucional

Site institucional da Buovai, fundada por Lorena Cardoso. HTML, CSS e
JavaScript puros, com Supabase como backend real (sem dado mockado).

## Estrutura

```
index.html          Marcação única da página (SPA de seção única)
css/
  variables.css      Tokens de design (cor, tipografia, espaçamento, movimento)
  base.css           Reset e ritmo tipográfico global
  components.css     Botões, navegação, formulário, glass panel, tags
  sections.css        Estilos específicos de cada seção (hero, sobre, cases...)
  responsive.css      Breakpoints e ajustes mobile
js/
  config.js           Configuração pública do projeto Supabase
  supabase-client.js  Instância única do cliente Supabase
  portfolio.js         Busca e renderiza os cases publicados (tabela portfolio_projects)
  contact.js            Envia o formulário de contato (tabela contact_messages)
  main.js               Interações de UI (header, menu, reveal-on-scroll)
```

O cliente Supabase JS é carregado via CDN (`@supabase/supabase-js@2`) em
`index.html`, sem etapa de build.

## Backend (Supabase)

Projeto: `Buovai` (`xfdqukrmfrqqsbcctbhh`).

- `portfolio_projects` — cases reais (MilaLab/Milatec e Portal do
  Cliente/Trilhar Contabilidade), com leitura pública restrita a
  `published = true` via Row Level Security.
- `contact_messages` — mensagens do formulário de contato, com `INSERT`
  público via RLS (sem leitura pública).

A chave usada no cliente é a chave pública ("publishable"), segura para uso
no navegador — toda a proteção de dado real está nas políticas de RLS do
banco, não no frontend.

## Rodando localmente

Qualquer servidor estático funciona, por exemplo:

```
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.
