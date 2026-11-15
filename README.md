# Minhas Tarefas

To-do list moderna e responsiva para acompanhar as tarefas do dia a dia. HTML, CSS e JavaScript puros, sem dependências nem build.

## Como usar

Abra `index.html` no navegador. Ou sirva localmente:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Funcionalidades

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

## Estrutura

| Arquivo      | Conteúdo                         |
| ------------ | -------------------------------- |
| `index.html` | Marcação da página               |
| `styles.css` | Estilos, temas e responsividade  |
| `app.js`     | Lógica, persistência e eventos   |

> Os dados ficam só no navegador em uso. Limpar os dados do site apaga as tarefas.
