# AGENTS.md — Enhanced

## Visão geral

`LABHDUFBA/enhanced` é um site Quarto estático publicado em:

- https://enhanced.inovahd.org/
- domínio configurado em `CNAME`

O código-fonte editorial fica na raiz. O HTML publicado é gerado em `docs/`.

## Estrutura editorial

- `index.qmd`: página inicial e badge de visitantes.
- `textos.qmd`: listagem automática de textos em `posts/`.
- `edicoes.qmd`: página de edições; atualizar quando uma nova edição for criada.
- `posts/<slug>/index.qmd`: um texto publicado.
- `posts/<slug>/files/images/`: imagens específicas do texto.
- `files/images/`: imagens compartilhadas do site e imagens Open Graph.
- `i18n/en.json` e `i18n/pt.json`: traduções.
- `i18n/i18n.js`: seleção de idioma, traduções no cliente e atualização da badge.
- `styles-v2.css` e `styles.css`: estilos.
- `_quarto.yml`: configuração geral do site.
- `docs/`: saída renderizada; deve ser atualizada e versionada.
- `.github/workflows/pages.yml`: build e publicação no GitHub Pages.

## Adicionar um novo texto

1. Crie um diretório com slug estável:

   ```text
   posts/meu-novo-texto/index.qmd
   ```

2. Use front matter compatível com a listagem:

   ```yaml
   ---
   title: "Título do texto"
   author: "Nome do autor"
   date: 2026-08-06
   description: "Resumo curto para os cards e metadados."
   image: files/images/minha-imagem.jpg
   categories:
     - Humanidades Digitais
   lang: pt-BR
   ---
   ```

3. Coloque imagens em `posts/meu-novo-texto/files/images/` e use caminhos relativos.
4. Para textos bilíngues, siga o padrão de `posts/example-essay/index.qmd`:
   - `#article-language-meta` com títulos e descrições em PT/EN;
   - blocos `.article-version` com `data-article-version="pt"` e `"en"`;
   - botões `data-article-lang`.
5. Renderize, verifique o card em `docs/index.html`/`docs/textos.html` e faça commit.

## Adicionar ou atualizar uma edição

Edite `edicoes.qmd`. Mantenha a edição mais recente e seus textos com links ou listagens claras. Se a edição ganhar uma página própria, crie um diretório em `posts/` ou uma página `.qmd` e atualize a navegação/listagem conforme necessário.

## Renderização local

A versão usada no projeto é Quarto `1.7.30`:

```bash
quarto --version
quarto render
```

O comando gera/atualiza `docs/`. Antes do commit:

```bash
git diff --check
git status --short
```

Não versione caches temporários ou alterações não relacionadas produzidas por uma renderização. Se o Quarto alterar hashes de recursos sem necessidade, preserve os arquivos já versionados e inclua somente a saída necessária para a alteração editorial.

## Publicação

O GitHub Pages usa o workflow `.github/workflows/pages.yml`:

1. `actions/checkout@v4`;
2. `quarto-dev/quarto-actions/setup@v2`, Quarto `1.7.30`;
3. `quarto render`;
4. `actions/upload-pages-artifact@v3` com `docs/`;
5. `actions/deploy-pages@v4` no ambiente `github-pages`.

O Pages deve permanecer configurado com `build_type: workflow`, não com o builder legado `main:/docs`.

Após `git push` para `main`, verifique em **Actions** a execução `Deploy Quarto site to GitHub Pages`. Pela API:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/LABHDUFBA/enhanced/actions/runs?per_page=5
```

Não declare publicação concluída enquanto o job `build` e o job `deploy` não estiverem `success` e o HTML público não refletir a mudança.

## Badge de visitantes

A badge fica somente na página inicial para não contar cada página interna como uma visita. O HTML usa `hitscounter.dev` e `i18n/i18n.js` troca o parâmetro `label` entre `Visitors` e `Visitantes`. Não mova a badge para o footer sem avaliar o impacto na contagem.

## Regras operacionais

- Nunca coloque tokens, senhas ou credenciais em commits, URLs, logs ou este arquivo.
- Preserve URLs absolutas para metadados Open Graph e imagens públicas.
- Faça alterações pequenas e verificáveis; não substitua `docs/` inteiro por mudanças de cache sem revisar o diff.
- Depois de publicar, valide HTTP `200`, o HTML relevante e os assets alterados.
