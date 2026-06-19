
let tasks = [];
let editingTaskId = null;
let currentFilter = 'all';
let currentSearch = '';

const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const taskCountEl = document.getElementById('task-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const overdueCountEl = document.getElementById('overdue-count');
const formModal = document.getElementById('formModal');
const taskForm = document.getElementById('taskForm');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const createBtn = document.getElementById('create');
const closeBtn = document.getElementById('close');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const themeToggle = document.getElementById('theme');
const progressPct = document.getElementById('progressPct');
const progressRing = document.getElementById('progressRing');
const legendDone = document.getElementById('legendDone');
const legendPend = document.getElementById('legendPend');

// CALENDAR VARIABLES
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const calGrid = document.getElementById('calGrid');
const calLabel = document.getElementById('calLabel');

// SAVE TASK
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks 
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        loadSampleTasks();
    }
}

// Rendering
function renderTasks() {
    // First, filter the tasks
    let filteredTasks = tasks;

    // Apply search filter
    if (currentSearch.trim() !== '') {
        const searchLower = currentSearch.toLowerCase().trim();
        filteredTasks = filteredTasks.filter(task =>
            task.name.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
        );
    }

    // Applying category filter (all, pending, completed, high priority)
    if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'High');
    }
    // 'all' shows everything

    // Splitting into pending and completed..
    const pending = filteredTasks.filter(task => !task.completed);
    const completed = filteredTasks.filter(task => task.completed);

    // Clear the containers
    pendingTasksEl.innerHTML = '';
    completedTasksEl.innerHTML = '';

    // Render pending tasks
    if (pending.length === 0) {
        pendingTasksEl.innerHTML = `<div class="task-item" style="
        justify-content:center;
        color:#94a3b8;
        font-style:italic;"
        >No pending tasks</div>`;
    } else {
        pending.forEach(task => {
            pendingTasksEl.appendChild(createTaskElement(task));
        });
    }

    // Render completed tasks
    if (completed.length === 0) {
        completedTasksEl.innerHTML = `<div class="task-item" style="justify-content:center;color:#94a3b8;font-style:italic;">No completed tasks</div>`;
    } else {
        completed.forEach(task => {
            completedTasksEl.appendChild(createTaskElement(task));
        });
    }

    // Update statistics
    updateStats();
}

// Create TASK ELEMENT
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.id = task.id;

    // Priority color class
    let priorityClass = 'priority-low';
    if (task.priority === 'High') priorityClass = 'priority-high';
    else if (task.priority === 'Medium') priorityClass = 'priority-medium';

    // Check if task is overdue (only for pending tasks)
    const isOverdue = !task.completed && new Date(task.dueDate) < new Date() && new Date(task.dueDate).toDateString() !== new Date().toDateString();

    // Left side: info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.name;
    infoDiv.appendChild(titleSpan);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';

    const descSpan = document.createElement('span');
    descSpan.textContent = task.description;
    metaDiv.appendChild(descSpan);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = task.dueDate + ' ' + task.time;
    metaDiv.appendChild(dateSpan);

    const prioritySpan = document.createElement('span');
    prioritySpan.className = 'task-priority ' + priorityClass;
    prioritySpan.textContent = task.priority;
    metaDiv.appendChild(prioritySpan);

    if (isOverdue) {
        const overdueSpan = document.createElement('span');
        overdueSpan.style.color = '#ef4444';
        overdueSpan.style.fontWeight = 'bold';
        overdueSpan.textContent = '⚠️ Overdue';
        metaDiv.appendChild(overdueSpan);
    }

    infoDiv.appendChild(metaDiv);
    div.appendChild(infoDiv);

    // Right side: action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    // Toggle complete button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? '↩️' : '✅';
    toggleBtn.title = task.completed ? 'Reopen' : 'Complete';
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent any parent handlers
        toggleTaskCompletion(task.id);
    });
    actionsDiv.appendChild(toggleBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openEditForm(task.id);
    });
    actionsDiv.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Delete this task?')) {
            deleteTask(task.id);
        }
    });
    actionsDiv.appendChild(deleteBtn);

    div.appendChild(actionsDiv);

    return div;
}

// CRUD OPERATIONS

// Add new task
function addTask(taskData) {
    const newTask = {
        id: Date.now(),
        name: taskData.name,
        description: taskData.description,
        dueDate: taskData.dueDate,
        time: taskData.time,
        priority: taskData.priority,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateCalendar();
}

// Edit existing task
function editTask(id, taskData) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].name = taskData.name;
        tasks[index].description = taskData.description;
        tasks[index].dueDate = taskData.dueDate;
        tasks[index].time = taskData.time;
        tasks[index].priority = taskData.priority;
        saveTasks();
        renderTasks();
        updateCalendar();
    }
}

// Delete the task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateCalendar();
}

// Toggle task completion status
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateCalendar();
    }
}

// UPDATE STATISTICS
function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < today).length;

    taskCountEl.textContent = total;
    pendingCountEl.textContent = pending;
    completedCountEl.textContent = completed;
    overdueCountEl.textContent = overdue;

    // Update progress ring
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressPct.textContent = pct + '%';
    progressRing.style.background = `conic-gradient(#22c55e ${pct}%, #e2e8f0 ${pct}%)`;

    // Update legend
    legendDone.textContent = completed;
    legendPend.textContent = pending;
}

// FORM HANDLING

// Open the form to add the new task
function openAddForm() {
    editingTaskId = null;
    formTitle.textContent = 'Add Task';
    saveBtn.textContent = 'Save Task';
    taskForm.reset();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="duedate"]').value = today;
    formModal.style.display = 'flex';
}

// Open the form to edit an existing task
function openEditForm(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingTaskId = id;
    formTitle.textContent = 'Edit Task';
    saveBtn.textContent = 'Update Task';

    // Fill the form with task data
    document.querySelector('input[name="taskName"]').value = task.name;
    document.querySelector('input[name="duedate"]').value = task.dueDate;
    document.querySelector('input[name="time"]').value = task.time;
    document.querySelector('textarea[name="description"]').value = task.description;
    document.querySelector('select[name="priority"]').value = task.priority;

    formModal.style.display = 'flex';
}

// Close the form
function closeForm() {
    formModal.style.display = 'none';
    editingTaskId = null;
    taskForm.reset();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(taskForm);
    const taskData = {
        name: formData.get('taskName').trim(),
        dueDate: formData.get('duedate'),
        time: formData.get('time'),
        description: formData.get('description').trim(),
        priority: formData.get('priority')
    };

    // Validation
    if (!taskData.name) {
        alert('Please enter a task name.');
        return;
    }
    if (!taskData.dueDate) {
        alert('Please select a due date.');
        return;
    }
    if (!taskData.time) {
        alert('Please select a time.');
        return;
    }
    if (!taskData.description) {
        alert('Please enter a description.');
        return;
    }

    if (editingTaskId) {
        editTask(editingTaskId, taskData);
    } else {
        addTask(taskData);
    }

    closeForm();
}

// 
// CALENDAR
function renderCalendar(month, year) {
    calGrid.innerHTML = '';

    // Day labels
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayLabels.forEach(label => {
        const div = document.createElement('div');
        div.className = 'day-label';
        div.textContent = label;
        calGrid.appendChild(div);
    });

    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month days to fill first row
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Get today's date for highlighting
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Fill empty cells for days before the 1st
    for (let i = firstDay - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'day other-month';
        div.textContent = prevMonthDays - i;
        calGrid.appendChild(div);
    }

    // Fill days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement('div');
        div.className = 'day';
        if (day === todayDate && month === todayMonth && year === todayYear) {
            div.classList.add('today');
        }
        div.textContent = day;
        calGrid.appendChild(div);
    }

    // Fill remaining cells to complete the grid (optional)
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        const div = document.createElement('div');
        div.className = 'day other-month';
        div.textContent = i;
        calGrid.appendChild(div);
    }

    calLabel.textContent = monthNames[month] + ' ' + year;
}

function updateCalendar() {
    renderCalendar(currentMonth, currentYear);
}

// DARK THEME
function toggleDarkMode() {
    const isDark = themeToggle.checked;
    if (isDark) {
        document.body.style.background = '#0f172a';
        document.body.style.color = '#e2e8f0';
        document.querySelector('.container').style.background = '#1e293b';
        document.querySelectorAll('.stat-card, .sidebar, .calendar-card, .progress-card, .task-item').forEach(el => {
            el.style.background = '#2d3a4f';
            el.style.color = '#e2e8f0';
        });
        document.querySelector('.popup').style.background = '#1e293b';
        document.querySelector('.popup').style.color = '#e2e8f0';
        document.querySelectorAll('.popup form input, .popup form textarea, .popup form select').forEach(el => {
            el.style.background = '#2d3a4f';
            el.style.color = '#e2e8f0';
            el.style.borderColor = '#4a5a7a';
        });
        document.querySelector('.search-wrap').style.background = '#2d3a4f';
        document.querySelector('.search-wrap input').style.background = 'transparent';
        document.querySelector('.search-wrap input').style.color = '#e2e8f0';
        document.getElementById('filter').style.background = '#2d3a4f';
        document.getElementById('filter').style.color = '#e2e8f0';
        document.querySelector('.dark-mode').style.background = '#2d3a4f';
        navLinks.forEach(link => {
            if (!link.classList.contains('active')) {
                link.style.color = '#94a3b8';
            }
        });
        document.querySelectorAll('.task-item .task-meta').forEach(el => {
            el.style.color = '#94a3b8';
        });
        document.querySelector('.ring-inner').style.background = '#1e293b';
    } else {
        document.body.style.background = '#f4f7fc';
        document.body.style.color = '#1e293b';
        document.querySelector('.container').style.background = '#ffffff';
        document.querySelectorAll('.stat-card, .sidebar, .calendar-card, .progress-card, .task-item').forEach(el => {
            el.style.background = '#f8fafc';
            el.style.color = '#1e293b';
        });
        document.querySelector('.popup').style.background = 'white';
        document.querySelector('.popup').style.color = '#1e293b';
        document.querySelectorAll('.popup form input, .popup form textarea, .popup form select').forEach(el => {
            el.style.background = '#fafcff';
            el.style.color = '#1e293b';
            el.style.borderColor = '#e2e8f0';
        });
        document.querySelector('.search-wrap').style.background = '#f1f5f9';
        document.querySelector('.search-wrap input').style.background = 'transparent';
        document.querySelector('.search-wrap input').style.color = '#1e293b';
        document.getElementById('filter').style.background = '#f1f5f9';
        document.getElementById('filter').style.color = '#1e293b';
        document.querySelector('.dark-mode').style.background = '#eef2f6';
        navLinks.forEach(link => {
            if (!link.classList.contains('active')) {
                link.style.color = '#334155';
            }
        });
        document.querySelectorAll('.task-item .task-meta').forEach(el => {
            el.style.color = '#475569';
        });
        document.querySelector('.ring-inner').style.background = 'white';
    }
}

// NAVIGATION & FILTERS
const navLinks = document.querySelectorAll('nav a');

function setActiveFilter(filter, element) {
    // Update active class on nav
    navLinks.forEach(link => link.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        // If no element provided, find the one matching the filter
        navLinks.forEach(link => {
            if (link.dataset.filter === filter) {
                link.classList.add('active');
            }
        });
    }
    // Update filter and render
    currentFilter = filter;
    filterSelect.value = filter;
    renderTasks();
}

// EVENT LISTENERS

// Navigation links 
document.querySelector('nav').addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.dataset.filter) {
        e.preventDefault();
        // Remove active from all
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentFilter = link.dataset.filter;
        filterSelect.value = currentFilter;
        renderTasks();
    }
});

// Filter select 
filterSelect.addEventListener('change', function() {
    currentFilter = this.value;
    // Update nav active state
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.filter === currentFilter);
    });
    renderTasks();
});

// Search input
searchInput.addEventListener('input', function() {
    currentSearch = this.value;
    renderTasks();
});

// Create button - open add form
createBtn.addEventListener('click', openAddForm);

// Close button on modal
closeBtn.addEventListener('click', closeForm);

// Click outside modal to close (event delegation - using target)
formModal.addEventListener('click', function(e) {
    if (e.target === this) {
        closeForm();
    }
});

// Form submit - using submit event with preventDefault
taskForm.addEventListener('submit', handleFormSubmit);

// Dark mode toggle
themeToggle.addEventListener('change', toggleDarkMode);

// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

// MENU BUTTON (Mobile)
const menuBtn = document.getElementById('menu-btn');
let sidebarVisible = true;

menuBtn.addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    sidebarVisible = !sidebarVisible;
    sidebar.style.display = sidebarVisible ? 'flex' : 'none';
});

// KEYBOARD SHORTCUTS 
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape' && formModal.style.display === 'flex') {
        closeForm();
    }
    // Ctrl + K to focus search (like many apps)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// INITIALIZE APP
loadTasks();
renderTasks();
updateCalendar();

// Set default date in form to today
const todayStr = new Date().toISOString().split('T')[0];
document.querySelector('input[name="duedate"]').value = todayStr;

// Set default time to current time rounded to nearest hour
const now = new Date();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(Math.round(now.getMinutes() / 15) * 15).padStart(2, '0');
document.querySelector('input[name="time"]').value = hours + ':' + (minutes === '60' ? '00' : minutes);



