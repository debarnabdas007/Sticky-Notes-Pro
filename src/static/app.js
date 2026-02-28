// --- Configuration & State ---
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
let authToken = localStorage.getItem('token');
let currentMode = 'login'; 
let currentView = 'landing';

// --- DOM Elements ---
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const authControls = document.getElementById('auth-controls');
const logoutBtn = document.getElementById('logout-btn');

// Views
const viewLanding = document.getElementById('view-landing');
const viewWorkspace = document.getElementById('view-workspace');
const viewHowItWorks = document.getElementById('view-how-it-works');
const viewContact = document.getElementById('view-contact');

// App Elements
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authError = document.getElementById('auth-error');
const showLoginBtn = document.getElementById('show-login-btn');
const showRegisterBtn = document.getElementById('show-register-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const newNoteInput = document.getElementById('new-note-input');
const newNoteDate = document.getElementById('new-note-date');
const addNoteBtn = document.getElementById('add-note-btn');
const notesGrid = document.getElementById('notes-grid');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Search Elements
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');

let currentCalDate = new Date();
let globalNotes = []; 

// --- 1. Core Engines (Theme, Routing & UI) ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}
themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
});
initTheme();

// SPA Navigation Router
function navigateTo(viewId) {
    // Hide all views
    viewLanding.classList.add('hidden');
    viewWorkspace.classList.add('hidden');
    viewWorkspace.classList.remove('flex'); // Workspace uses flex layout
    viewHowItWorks.classList.add('hidden');
    viewContact.classList.add('hidden');

    // Show requested view
    if (viewId === 'workspace' && authToken) {
        viewWorkspace.classList.remove('hidden');
        viewWorkspace.classList.add('flex');
    } else if (viewId === 'workspace' && !authToken) {
        viewLanding.classList.remove('hidden'); // Fallback if logged out
    } else if (viewId === 'landing') {
        viewLanding.classList.remove('hidden');
    } else if (viewId === 'how-it-works') {
        viewHowItWorks.classList.remove('hidden');
    } else if (viewId === 'contact') {
        viewContact.classList.remove('hidden');
    }
    
    // Clear search when navigating
    searchInput.value = '';
    if(authToken && globalNotes.length > 0) renderNotes(globalNotes);
}

function updateUI() {
    if (authToken) {
        authControls.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        searchContainer.classList.remove('hidden'); // Show Search bar
        navigateTo('workspace');
        fetchNotes();
    } else {
        authControls.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        searchContainer.classList.add('hidden'); // Hide Search bar
        notesGrid.innerHTML = '';
        globalNotes = [];
        navigateTo('landing');
    }
}

// --- 2. Live Search Logic ---
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredNotes = globalNotes.filter(note => 
        note.content.toLowerCase().includes(searchTerm)
    );
    renderNotes(filteredNotes);
});

// --- 3. Auth Logic ---
showLoginBtn.addEventListener('click', () => openModal('login'));
showRegisterBtn.addEventListener('click', () => openModal('register'));
closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));

function openModal(mode) {
    currentMode = mode;
    authTitle.textContent = mode === 'login' ? 'Welcome Back' : 'Create Account';
    authSubmitBtn.textContent = mode === 'login' ? 'Login' : 'Sign Up';
    authError.classList.add('hidden');
    authModal.classList.remove('hidden');
}

logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('token');
    updateUI();
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Processing...';

    try {
        if (currentMode === 'register') {
            const res = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
            currentMode = 'login';
        }
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST', body: formData
        });
        if (!res.ok) throw new Error('Invalid username or password');
        const data = await res.json();
        authToken = data.access_token;
        localStorage.setItem('token', authToken);
        authModal.classList.add('hidden');
        updateUI();
    } catch (err) { 
        authError.textContent = err.message; authError.classList.remove('hidden'); 
    } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = currentMode === 'login' ? 'Login' : 'Sign Up';
    }
});

// --- 4. API & CRUD ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method, 
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
    });
    if (res.status === 401) { logoutBtn.click(); throw new Error('Unauthorized'); }
    return res.status === 204 ? null : await res.json();
}

async function fetchNotes() {
    try {
        globalNotes = await apiCall('/notes/');
        renderNotes(globalNotes);
        renderCalendar();
    } catch (err) { console.error('Failed to fetch notes:', err); }
}

async function addNote() {
    const content = newNoteInput.value.trim();
    if (!content) return;
    await apiCall('/notes/', 'POST', { 
        content: content, 
        due_date: newNoteDate.value ? new Date(newNoteDate.value).toISOString() : null,
        is_completed: false
    });
    newNoteInput.value = ''; newNoteDate.value = '';
    fetchNotes();
}
addNoteBtn.addEventListener('click', addNote);

async function toggleComplete(id, currentStatus) {
    await apiCall(`/notes/${id}`, 'PUT', { is_completed: !currentStatus });
    fetchNotes(); 
}

async function deleteNote(id) {
    await apiCall(`/notes/${id}`, 'DELETE');
    fetchNotes();
}

async function updateNoteContent(id) {
    const inputEl = document.getElementById(`edit-input-${id}`);
    const newContent = inputEl.value.trim();
    if (newContent) await apiCall(`/notes/${id}`, 'PUT', { content: newContent });
    fetchNotes();
}

async function changeColor(id, hex) {
    await apiCall(`/notes/${id}`, 'PUT', { color_hex: hex });
    fetchNotes();
}

// --- 5. Render Engine ---
function renderNotes(notes) {
    notesGrid.innerHTML = '';
    notes.forEach(note => {
        const noteEl = document.createElement('div');
        const isDone = note.is_completed;
        noteEl.className = `note-card p-5 rounded-lg shadow-sm flex flex-col justify-between min-h-[160px] text-gray-900 transition-all duration-300 ${isDone ? 'opacity-50 grayscale' : ''}`;
        noteEl.style.backgroundColor = note.color_hex || '#ffeb3b';
        noteEl.id = `note-${note.id}`;
        noteEl.dataset.id = note.id;

        noteEl.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <button onclick="toggleComplete(${note.id}, ${isDone})" class="w-6 h-6 rounded-full border-2 border-black/30 flex items-center justify-center hover:bg-black/10 transition-colors">
                    ${isDone ? '<i class="fa-solid fa-check text-xs text-black"></i>' : ''}
                </button>
                <button onclick="enableEdit(${note.id})" class="text-black/30 hover:text-black/70 transition-colors"><i class="fa-solid fa-pen-to-square"></i></button>
            </div>
            <div id="content-${note.id}" class="text-lg whitespace-pre-wrap flex-grow ${isDone ? 'line-through decoration-2 decoration-black/50' : ''}">${note.content}</div>
            <div class="mt-4">
                ${note.due_date ? `<p class="text-xs text-black/60 font-semibold"><i class="fa-regular fa-clock mr-1"></i>${new Date(note.due_date).toLocaleDateString()}</p>` : ''}
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-black/10">
                    <div class="flex gap-2">
                        <button class="w-4 h-4 rounded-full bg-[#ffeb3b] border border-black/20 hover:scale-125 transition-transform" onclick="changeColor(${note.id}, '#ffeb3b')"></button>
                        <button class="w-4 h-4 rounded-full bg-[#a7f3d0] border border-black/20 hover:scale-125 transition-transform" onclick="changeColor(${note.id}, '#a7f3d0')"></button>
                        <button class="w-4 h-4 rounded-full bg-[#fecaca] border border-black/20 hover:scale-125 transition-transform" onclick="changeColor(${note.id}, '#fecaca')"></button>
                        <button class="w-4 h-4 rounded-full bg-[#bfdbfe] border border-black/20 hover:scale-125 transition-transform" onclick="changeColor(${note.id}, '#bfdbfe')"></button>
                    </div>
                    <button onclick="deleteNote(${note.id})" class="text-black/40 hover:text-red-600 transition-colors"><i class="fa-solid fa-trash text-sm"></i></button>
                </div>
            </div>
        `;
        notesGrid.appendChild(noteEl);
    });
}

window.enableEdit = function(id) {
    const contentDiv = document.getElementById(`content-${id}`);
    const currentText = contentDiv.innerText;
    contentDiv.innerHTML = `
        <textarea id="edit-input-${id}" class="w-full bg-white/40 border border-black/20 rounded p-2 outline-none resize-none focus:bg-white/60 transition-colors" rows="3">${currentText}</textarea>
        <button onclick="updateNoteContent(${id})" class="mt-2 text-xs bg-black/80 text-white px-3 py-1 rounded hover:bg-black transition-colors">Save</button>
    `;
    const input = document.getElementById(`edit-input-${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
};

// --- 6. SortableJS Drag & Drop ---
new Sortable(notesGrid, {
    animation: 200, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',
    onEnd: async function () {
        const noteElements = Array.from(notesGrid.children);
        for (let i = 0; i < noteElements.length; i++) {
            const noteId = noteElements[i].dataset.id;
            await apiCall(`/notes/${noteId}`, 'PUT', { position_index: i });
        }
    },
});

// --- 7. Calendar Rendering Engine ---
function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    calendarMonthYear.textContent = currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += `<div class="p-2"></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayNotes = globalNotes.filter(n => n.due_date && n.due_date.startsWith(dayString));
        
        const hasNotes = dayNotes.length > 0;
        const allCompleted = hasNotes && dayNotes.every(n => n.is_completed);
        
        let visualIndicator = '';
        if (allCompleted) {
            visualIndicator = `<i class="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>`;
        } else if (hasNotes) {
            let dots = dayNotes.map(n => `<div class="w-1.5 h-1.5 rounded-full" style="background-color: ${n.color_hex}; border: 1px solid rgba(0,0,0,0.1)"></div>`).join('');
            visualIndicator = `<div class="flex flex-wrap justify-center gap-0.5 mt-1 w-full max-w-[20px]">${dots}</div>`;
        }

        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        const todayClass = isToday ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold rounded-lg shadow-inner' : 'rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800';

        calendarGrid.innerHTML += `
            <div class="p-2 flex flex-col items-center justify-start h-14 ${todayClass} cursor-default transition-colors">
                <span class="${isToday ? 'scale-110' : ''}">${day}</span>
                ${visualIndicator}
            </div>
        `;
    }
}

prevMonthBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendar(); });

// Initialize App
updateUI();