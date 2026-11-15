(() => {
  'use strict';

  const STORAGE_KEY = 'todo.tasks.v1';
  const THEME_KEY = 'todo.theme';
  const PRIORITY_ORDER = { alta: 0, media: 1, baixa: 2 };
  const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  const DAY_MS = 86400000;
  const TOAST_MS = 5000;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    today: $('#today'),
    greeting: $('#greeting'),
    themeToggle: $('#theme-toggle'),
    form: $('#task-form'),
    input: $('#task-input'),
    priority: $('#task-priority'),
    due: $('#task-due'),
    filters: $('.filters'),
    search: $('#search'),
    sort: $('#sort'),
    list: $('#task-list'),
    template: $('#task-template'),
    empty: $('#empty-state'),
    emptyText: $('#empty-text'),
    progressText: $('#progress-text'),
    progressPercent: $('#progress-percent'),
    progressBar: $('#progress-bar'),
    progressFill: $('#progress-fill'),
    countAll: $('#count-all'),
    countActive: $('#count-active'),
    countDone: $('#count-done'),
    remaining: $('#remaining'),
    clearDone: $('#clear-done'),
    toast: $('#toast'),
    toastText: $('#toast-text'),
    toastUndo: $('#toast-undo'),
  };

  let tasks = loadTasks();
  let filter = 'all';
  let query = '';
  let sortBy = 'created';
  let undoAction = null;
  let toastTimer = null;

  /* ===== Persistência ===== */

  function loadTasks() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter((t) => t && typeof t.id === 'string' && typeof t.text === 'string').map((t) => ({
        id: t.id,
        text: t.text,
        done: Boolean(t.done),
        priority: PRIORITY_ORDER[t.priority] !== undefined ? t.priority : 'media',
        due: typeof t.due === 'string' ? t.due : '',
        createdAt: Number(t.createdAt) || Date.now(),
      }));
    } catch {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* storage cheio ou bloqueado: app segue funcionando em memória */
    }
  }

  function uid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  /* ===== Datas (sempre no fuso local, evita bug de UTC) ===== */

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseISODate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function describeDue(due, done) {
    if (!due) return null;
    const diff = Math.round((parseISODate(due) - parseISODate(toISODate(new Date()))) / DAY_MS);
    let label;
    if (diff === 0) label = 'Hoje';
    else if (diff === 1) label = 'Amanhã';
    else if (diff === -1) label = 'Ontem';
    else label = parseISODate(due).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

    let state = '';
    if (!done && diff < 0) state = 'is-overdue';
    else if (!done && diff === 0) state = 'is-today';
    return { label: `📅 ${label}`, state, overdue: state === 'is-overdue' };
  }

  /* ===== Operações ===== */

  function addTask(text, priority, due) {
    tasks.push({ id: uid(), text, done: false, priority, due, createdAt: Date.now() });
    saveTasks();
    render();
  }

  function findTask(id) {
    return tasks.find((t) => t.id === id);
  }

  function toggleTask(id) {
    const task = findTask(id);
    if (!task) return;
    task.done = !task.done;
    saveTasks();
    render();
  }

  function updateText(id, text) {
    const task = findTask(id);
    if (!task || !text || text === task.text) return;
    task.text = text;
    saveTasks();
  }

  function removeTasks(ids, message) {
    const idSet = new Set(ids);
    const removed = tasks.filter((t) => idSet.has(t.id));
    if (!removed.length) return;
    tasks = tasks.filter((t) => !idSet.has(t.id));
    saveTasks();
    render();
    showToast(message, () => {
      const existing = new Set(tasks.map((t) => t.id));
      tasks = tasks.concat(removed.filter((t) => !existing.has(t.id)));
      saveTasks();
      render();
    });
  }

  /* ===== Renderização ===== */

  function visibleTasks() {
    const q = query.trim().toLocaleLowerCase('pt-BR');
    const comparators = {
      created: (a, b) => b.createdAt - a.createdAt,
      due: (a, b) => (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31') || b.createdAt - a.createdAt,
      priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt - a.createdAt,
    };
    const cmp = comparators[sortBy] || comparators.created;

    return tasks
      .filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done))
      .filter((t) => !q || t.text.toLocaleLowerCase('pt-BR').includes(q))
      .sort((a, b) => Number(a.done) - Number(b.done) || cmp(a, b));
  }

  function renderTask(task) {
    const li = els.template.content.firstElementChild.cloneNode(true);
    li.dataset.id = task.id;
    li.dataset.priority = task.priority;
    li.classList.toggle('is-done', task.done);

    const check = li.querySelector('.task-check');
    check.checked = task.done;
    check.setAttribute('aria-label', `${task.done ? 'Desmarcar' : 'Concluir'}: ${task.text}`);

    li.querySelector('.task-text').textContent = task.text;

    const priority = li.querySelector('.badge-priority');
    priority.dataset.priority = task.priority;
    priority.textContent = PRIORITY_LABEL[task.priority];

    const dueInfo = describeDue(task.due, task.done);
    if (dueInfo) {
      const dueEl = li.querySelector('.badge-due');
      dueEl.hidden = false;
      dueEl.textContent = dueInfo.overdue ? `${dueInfo.label} · atrasada` : dueInfo.label;
      if (dueInfo.state) dueEl.classList.add(dueInfo.state);
    }
    return li;
  }

  function render() {
    const list = visibleTasks();
    els.list.replaceChildren(...list.map(renderTask));

    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const active = total - done;
    const percent = total ? Math.round((done / total) * 100) : 0;

    els.countAll.textContent = total;
    els.countActive.textContent = active;
    els.countDone.textContent = done;

    els.progressText.textContent = total
      ? done === total
        ? 'Tudo concluído! 🎉'
        : `${done} de ${total} concluída${total === 1 ? '' : 's'}`
      : 'Nenhuma tarefa ainda';
    els.progressPercent.textContent = `${percent}%`;
    els.progressFill.style.width = `${percent}%`;
    els.progressBar.setAttribute('aria-valuenow', String(percent));

    els.remaining.textContent = `${active} pendente${active === 1 ? '' : 's'}`;
    els.clearDone.disabled = done === 0;

    els.empty.hidden = list.length > 0;
    if (!list.length) {
      if (!total) els.emptyText.textContent = 'Nenhuma tarefa ainda. Adicione a primeira acima!';
      else if (query.trim()) els.emptyText.textContent = 'Nenhuma tarefa encontrada para essa busca.';
      else if (filter === 'done') els.emptyText.textContent = 'Nenhuma tarefa concluída ainda.';
      else els.emptyText.textContent = 'Tudo em dia! Nada pendente. 🎉';
    }
  }

  function renderHeader() {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    els.today.textContent = date.charAt(0).toUpperCase() + date.slice(1);
    const hour = now.getHours();
    els.greeting.textContent = hour < 12 ? 'Bom dia 👋' : hour < 18 ? 'Boa tarde 👋' : 'Boa noite 👋';
  }

  /* ===== Edição inline ===== */

  function startEdit(li) {
    const task = findTask(li.dataset.id);
    const textEl = li.querySelector('.task-text');
    if (!task || !textEl) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = task.text;
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Editar tarefa');
    textEl.replaceWith(input);
    input.focus();
    input.select();

    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      if (commit) updateText(task.id, input.value.trim());
      render();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish(true);
      } else if (e.key === 'Escape') {
        finish(false);
      }
    });
    input.addEventListener('blur', () => finish(true));
  }

  /* ===== Toast com desfazer ===== */

  function showToast(message, onUndo) {
    clearTimeout(toastTimer);
    undoAction = onUndo;
    els.toastText.textContent = message;
    els.toast.hidden = false;
    toastTimer = setTimeout(hideToast, TOAST_MS);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    els.toast.hidden = true;
    undoAction = null;
  }

  /* ===== Tema ===== */

  function currentTheme() {
    const saved = document.documentElement.dataset.theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignora */
    }
  }

  /* ===== Eventos ===== */

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = els.input.value.trim();
    if (!text) {
      els.input.focus();
      return;
    }
    addTask(text, els.priority.value, els.due.value);
    els.input.value = '';
    els.due.value = '';
    els.input.focus();
  });

  els.list.addEventListener('change', (e) => {
    if (!e.target.matches('.task-check')) return;
    toggleTask(e.target.closest('.task').dataset.id);
  });

  els.list.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = btn.closest('.task');
    if (btn.classList.contains('task-edit')) {
      startEdit(li);
    } else if (btn.classList.contains('task-delete')) {
      li.classList.add('is-removing');
      setTimeout(() => removeTasks([li.dataset.id], 'Tarefa excluída'), 180);
    }
  });

  els.list.addEventListener('dblclick', (e) => {
    if (e.target.closest('.task-text')) startEdit(e.target.closest('.task'));
  });

  els.filters.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    filter = chip.dataset.filter;
    els.filters.querySelectorAll('[data-filter]').forEach((c) => {
      const active = c === chip;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-pressed', String(active));
    });
    render();
  });

  els.search.addEventListener('input', () => {
    query = els.search.value;
    render();
  });

  els.sort.addEventListener('change', () => {
    sortBy = els.sort.value;
    render();
  });

  els.clearDone.addEventListener('click', () => {
    const ids = tasks.filter((t) => t.done).map((t) => t.id);
    removeTasks(ids, `${ids.length} tarefa${ids.length === 1 ? '' : 's'} removida${ids.length === 1 ? '' : 's'}`);
  });

  els.toastUndo.addEventListener('click', () => {
    const action = undoAction;
    hideToast();
    if (action) action();
  });

  els.themeToggle.addEventListener('click', toggleTheme);

  // Atalho: tecla "n" foca o campo de nova tarefa
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    els.input.focus();
  });

  // Sincroniza entre abas abertas
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      tasks = loadTasks();
      render();
    }
  });

  // Atualiza rótulos "Hoje/Amanhã" quando a aba volta a ficar visível
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderHeader();
      render();
    }
  });

  renderHeader();
  render();
})();
