
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');

let currentFilter = 'all';
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// --- helpers ---
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

// --- render ---
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  li.innerHTML = `
    <label class="task-left">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
      <span class="task-text">${escapeHtml(task.text)}</span>
    </label>
    <div class="task-right">
      <button class="edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  const filter = currentFilter;
  tasks.forEach(task => {
    if (filter === 'pending' && task.completed) return;
    if (filter === 'completed' && !task.completed) return;
    taskList.appendChild(createTaskElement(task));
  });
}

// --- actions ---
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.style.outline = '2px solid rgba(255,100,100,0.15)';
    setTimeout(()=> taskInput.style.outline = '', 600);
    return;
  }
  const task = { id: Date.now().toString(), text, completed: false, createdAt: Date.now() };
  tasks.unshift(task); // newest on top
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function findTaskById(id) {
  return tasks.find(t => t.id === id);
}

// --- event listeners ---
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

taskList.addEventListener('click', (e) => {
  const li = e.target.closest('li.task-item');
  if (!li) return;
  const id = li.dataset.id;
  const task = findTaskById(id);
  if (!task) return;

  // delete
  if (e.target.closest('.delete')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    return;
  }

  // edit (simple prompt approach)
  if (e.target.closest('.edit')) {
    const newText = prompt('Edit task', task.text);
    if (newText !== null) {
      const trimmed = newText.trim();
      if (trimmed) {
        task.text = trimmed;
        saveTasks();
        renderTasks();
      }
    }
    return;
  }
});

// checkbox change (use change event)
taskList.addEventListener('change', (e) => {
  if (e.target.classList.contains('task-checkbox')) {
    const li = e.target.closest('li.task-item');
    const id = li.dataset.id;
    const task = findTaskById(id);
    if (!task) return;
    task.completed = e.target.checked;
    saveTasks();
    renderTasks();
  }
});

// filters
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// clear completed
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

// initial render
renderTasks();
