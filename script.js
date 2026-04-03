const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let currentFilter = 'all';

// Troca de Tema e Ícone
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    
    const isDark = document.body.classList.contains('dark');
    
    // Troca o ícone: se estiver escuro, mostra o Sol. Se claro, a Lua.
    themeToggle.innerText = isDark ? '☀️' : '🌙';
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Ao carregar a página, verifica o tema salvo para colocar o ícone correto
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.innerText = '☀️';
} else {
    themeToggle.innerText = '🌙';
}

addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    const date = dateInput.value;
    if (text) {
        tasks.push({ 
            text, 
            date, 
            completed: false, 
            deleted: false, // Nova propriedade
            id: Date.now() 
        });
        input.value = '';
        dateInput.value = '';
        saveAndRender();
    }
});

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    todoList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        // Se o filtro for 'deleted', mostra apenas os deletados
        if (currentFilter === 'deleted') return task.deleted;
        
        // Para os outros filtros, NÃO mostra os deletados
        if (task.deleted) return false;
        
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        
        return true; // Filtro 'all' (sem os deletados)
    });

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''} ${task.deleted ? 'is-deleted' : ''}`;
        
        const dateDisplay = task.date ? new Date(task.date).toLocaleString('pt-BR') : 'Sem data';

        // Se estiver deletado, o botão "Excluir" vira "Restaurar" ou "Apagar de vez"
        const deleteBtnText = task.deleted ? 'Restaurar' : 'Excluir';
        const completeBtnHtml = !task.deleted ? `
            <button class="btn-action btn-complete" onclick="toggleTask(${task.id})">
                ${task.completed ? 'Desfazer' : 'Concluir'}
            </button>
        ` : '';

        li.innerHTML = `
            <div class="task-info">
                <span>${task.text}</span>
                <small>${dateDisplay}</small>
            </div>
            <div class="task-actions">
                ${completeBtnHtml}
                <button class="btn-action btn-delete" onclick="handleDelete(${task.id}, ${task.deleted})">
                    ${deleteBtnText}
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
}

// Lógica inteligente de exclusão
function handleDelete(id, wasAlreadyDeleted) {
    if (wasAlreadyDeleted) {
        // Se já estava na lixeira, restaura a tarefa
        tasks = tasks.map(t => t.id === id ? { ...t, deleted: false } : t);
    } else {
        // Se não estava, manda para a lixeira
        tasks = tasks.map(t => t.id === id ? { ...t, deleted: true } : t);
    }
    saveAndRender();
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

renderTasks();