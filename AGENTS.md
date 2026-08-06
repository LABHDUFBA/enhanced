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
- `files/anexos/<edição>/<slug-do-artigo>/`: anexos estáticos de artigos — mapas, HTMLs, datasets pequenos e outros materiais suplementares. Exemplo: `files/anexos/2026.2/recortes-de-jornais-ufba/mapa-recortes.html`.
- `i18n/en.json` e `i18n/pt.json`: traduções.
- `i18n/i18n.js`: seleção de idioma, traduções no cliente e atualização da badge.
- `styles-v2.css` e `styles.css`: estilos.
- `_quarto.yml`: configuração geral do site.
- `docs/`: saída renderizada; deve ser atualizada e versionada.
- `docs/.nojekyll`: marca a saída do Quarto como conteúdo estático; mantenha-o
  versionado para impedir processamento Jekyll pelo Pages legado.
- `.github/workflows/`: reservado para automações auxiliares; o Pages atualmente usa o builder legado.

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

O GitHub Pages está configurado para o builder legado servindo diretamente `main:/docs`.
Isso é intencional: o workflow Actions/Pages ficou preso em `deployment_queued` no backend do GitHub, apesar de o build Quarto passar. O HTML renderizado em `docs/` deve ser versionado junto com cada alteração editorial.

O domínio `enhanced.inovahd.org` é configurado por `docs/CNAME`. Para o GitHub
validar o domínio e renovar o certificado, o CNAME deve apontar diretamente para
`labhdufba.github.io` e permanecer em **DNS only** na Cloudflare durante a
validação. Depois de um build concluído, habilite HTTPS no Pages e confirme que
HTTP redireciona para HTTPS.

Renderize localmente com Quarto `1.7.30` e publique o conteúdo renderizado:

```bash
quarto render
git diff --check
git add docs <arquivos-fonte>
git commit -m "..."
git push origin main
```

Verifique a configuração Pages pela API e confirme `build_type: legacy` e `source.path: /docs` antes de diagnosticar um deploy:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/LABHDUFBA/enhanced/pages
```

Após um push, acompanhe o build legado até `built`:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/LABHDUFBA/enhanced/pages/builds/latest
```

Não declare publicação concluída enquanto o HTML público não refletir a mudança. Para uma alteração editorial, valide HTTP `200`, o redirecionamento HTTP → HTTPS, o HTML público e os assets alterados. Não reintroduza `deploy-pages` sem antes confirmar que o backend de deployments do Pages voltou a processar a fila.

## Badge de visitantes

A badge fica somente na página inicial para não contar cada página interna como uma visita. O HTML usa `hitscounter.dev` e `i18n/i18n.js` troca o parâmetro `label` entre `Visitors` e `Visitantes`. Não mova a badge para o footer sem avaliar o impacto na contagem.

## Regras operacionais

- Nunca coloque tokens, senhas ou credenciais em commits, URLs, logs ou este arquivo.
- Preserve URLs absolutas para metadados Open Graph e imagens públicas.
- Faça alterações pequenas e verificáveis; não substitua `docs/` inteiro por mudanças de cache sem revisar o diff.
- Depois de publicar, valide HTTP `200`, o HTML relevante e os assets alterados.
