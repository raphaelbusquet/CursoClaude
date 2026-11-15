# Curso Claude Code

Repositório oficial da série de vídeos no YouTube sobre **[Claude Code](https://claude.com/claude-code)**, a ferramenta de IA da Anthropic que trabalha direto no terminal: lê o projeto, escreve código, roda testes, corrige bugs e publica, tudo a partir de pedidos em linguagem natural.

Aqui ficam os projetos construídos ao longo das aulas. Cada projeto é um pouco mais avançado que o anterior, para mostrar na prática até onde dá para ir com o Claude Code.

## Projetos

| #   | Projeto                                  | Nível         | Status                                                                 |
| --- | ---------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| 1   | [Minhas Tarefas (To-Do List)](#projeto-1--minhas-tarefas-to-do-list) | Básico        | ✅ [Ver no ar](https://raphaelbusquet.github.io/CursoClaude/)           |
| 2   | Em breve (aula 4)                        | Intermediário | 🚧 Em preparação                                                        |

---

## Projeto 1 · Minhas Tarefas (To-Do List)

**Demo:** https://raphaelbusquet.github.io/CursoClaude/

O primeiro e mais básico projeto do curso: uma to-do list moderna e responsiva, feita com HTML, CSS e JavaScript puros, sem dependências nem build. É um pequeno exemplo do que dá para fazer com o Claude Code.

### Como foi feito com o Claude Code

Tudo começou com um único pedido em português:

> "Eu quero criar um site para acompanhamento das tarefas do meu dia a dia, uma to-do list, que seja moderna e tenha um layout responsivo."

A partir daí, o Claude Code:

1. **Planejou e escreveu** o site completo (`index.html`, `styles.css`, `app.js`).
2. **Testou sozinho** no Chrome em modo headless: 27 testes automáticos cobrindo adicionar, concluir, editar, excluir, desfazer, filtrar, buscar, salvar e trocar de tema.
3. **Tirou screenshots** em desktop e celular, nos temas claro e escuro, e com elas **encontrou e corrigiu um bug visual** (um selo de prazo vazio aparecendo em tarefas sem prazo).
4. **Fez o commit**, criou este repositório no GitHub e **publicou o site** no GitHub Pages.

### Funcionalidades

- Adicionar tarefas com **prioridade** (alta, média, baixa) e **prazo**
- Concluir, **editar** (botão de lápis ou duplo clique no texto; Enter salva, Esc cancela) e excluir
- **Desfazer** exclusões por 5 segundos
- Filtros: todas, pendentes, concluídas, com contadores
- Busca por texto e ordenação por data de criação, prazo ou prioridade
- Prazos destacados: "Hoje", "Amanhã" e tarefas **atrasadas**
- Barra de progresso do dia
- Tema claro/escuro (segue o sistema por padrão)
- Dados salvos no `localStorage` do navegador e sincronizados entre abas
- Atalho: tecla `n` foca o campo de nova tarefa
- Layout responsivo (de 320px até desktop) e acessível (teclado, leitores de tela, `prefers-reduced-motion`)

### Como rodar

Abra `index.html` no navegador. Ou sirva localmente:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

### Estrutura

| Arquivo      | Conteúdo                        |
| ------------ | ------------------------------- |
| `index.html` | Marcação da página              |
| `styles.css` | Estilos, temas e responsividade |
| `app.js`     | Lógica, persistência e eventos  |

### Limitação (e gancho para a próxima aula)

As tarefas ficam salvas só no navegador em uso: não sincronizam entre aparelhos e somem se os dados do site forem apagados. Resolver isso exige um backend, e é aí que os próximos projetos ficam mais interessantes.

---

## Próxima aula

Na **aula 4** vamos construir algo mais complexo, subindo o nível em relação a este primeiro projeto. Acompanhe a série no YouTube para ver o próximo passo.

## Quer acompanhar?

1. Instale o [Claude Code](https://claude.com/claude-code).
2. Clone este repositório:
   ```bash
   git clone https://github.com/raphaelbusquet/CursoClaude.git
   ```
3. Assista às aulas e tente reproduzir cada projeto com seus próprios pedidos.
