// ============================================
// Mis Raízes - Admin Panel Logic (Firebase)
// ============================================

var menuItems = [];
var categoryDocs = []; // Track Firestore category documents
var categoryOrder = []; // Track manual category order for drag-and-drop
var draggedItemIndex = null; // Track item being dragged

// === Auth with Firebase ===
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var pw = document.getElementById('loginPassword').value;
    var errEl = document.getElementById('loginError');

    try {
        await auth.signInWithEmailAndPassword(email, pw);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadMenuData();
        loadWeeklyMenuData();
    } catch (err) {
        console.error('Auth error:', err);
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errEl.textContent = 'Contraseña incorrecta';
        } else if (err.code === 'auth/user-not-found') {
            errEl.textContent = 'Usuario no configurado';
        } else {
            errEl.textContent = 'Error de conexión';
        }
    }
});

// Check if already logged in
auth.onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadMenuData();
        loadWeeklyMenuData();
    }
});

function logout() {
    auth.signOut();
    menuItems = [];
    categoryDocs = [];
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

// === Timeout helper para operaciones Firestore ===
function withTimeout(promise, ms) {
    var timeout = new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error('Tiempo de espera agotado. Comprueba tu conexión.'));
        }, ms || 10000);
    });
    return Promise.race([promise, timeout]);
}

// === Load Menu Data from Firestore ===
async function loadMenuData() {
    try {
        var snapshot = await withTimeout(db.collection('menu').orderBy('orden').get());
        menuItems = [];
        categoryDocs = [];

        snapshot.forEach(function (doc) {
            var data = doc.data();
            categoryDocs.push({ id: doc.id, nombre: data.nombre, orden: data.orden });
            var items = data.items || [];
            items.forEach(function (item) {
                menuItems.push({
                    categoria: data.nombre,
                    nombre: item.nombre || '',
                    precio: String(item.precio || '0'),
                    descripcion: item.descripcion || '',
                    disponible: item.disponible || 'si'
                });
            });
        });

        renderSections();
    } catch (err) {
        console.error('Error loading menu:', err);
        showStatus('Error al cargar el menú', 'error');
    }
}

// === Category Colors ===
var CATEGORY_COLORS = {
    'DESAYUNOS': '#e8a838',
    'PLATOS CRIOLLOS': '#c9785d',
    'COMBOS': '#a87ed4',
    'ENTRADAS': '#5dba7a',
    'POSTRES': '#e06088',
    'RACIONES': '#6aadcf',
    'BEBIDAS': '#4fc1b0',
    'LICORES': '#d4a14e'
};

function getCategoryColor(cat) {
    var upper = (cat || '').toUpperCase();
    var keys = Object.keys(CATEGORY_COLORS);
    for (var i = 0; i < keys.length; i++) {
        if (upper.indexOf(keys[i]) !== -1) return CATEGORY_COLORS[keys[i]];
    }
    return '#d4a853';
}

// Get unique categories preserving original order
function getCategories() {
    var seen = {};
    var cats = [];
    for (var i = 0; i < menuItems.length; i++) {
        var cat = menuItems[i].categoria || '';
        if (cat && !seen[cat]) {
            seen[cat] = true;
            cats.push(cat);
        }
    }
    return cats;
}

// Sort items so they group by category
function sortByCategory() {
    var catOrder = getCategories();
    var catMap = {};
    for (var i = 0; i < catOrder.length; i++) {
        catMap[catOrder[i]] = [];
    }
    for (var j = 0; j < menuItems.length; j++) {
        var cat = menuItems[j].categoria || '';
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(menuItems[j]);
    }
    menuItems = [];
    var allKeys = Object.keys(catMap);
    for (var k = 0; k < allKeys.length; k++) {
        for (var m = 0; m < catMap[allKeys[k]].length; m++) {
            menuItems.push(catMap[allKeys[k]][m]);
        }
    }
}

// === Render Category Sections ===
function renderSections() {
    var container = document.getElementById('menuSections');
    var empty = document.getElementById('emptyState');

    if (menuItems.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
        return;
    }

    empty.style.display = 'none';

    // Group items by category
    var categories = [];
    var catMap = {};
    for (var i = 0; i < menuItems.length; i++) {
        var cat = menuItems[i].categoria || 'Sin categoría';
        if (!catMap[cat]) {
            catMap[cat] = [];
            categories.push(cat);
        }
        catMap[cat].push({ item: menuItems[i], globalIndex: i });
    }

    var html = '';

    for (var c = 0; c < categories.length; c++) {
        var catName = categories[c];
        var catColor = getCategoryColor(catName);
        var items = catMap[catName];

        html += '<div class="category-section" draggable="true" data-category="' + escapeAttr(catName) + '" style="border-color: ' + catColor + ';">';

        // Category header with drag handle
        html += '<div class="category-header" style="border-left: 4px solid ' + catColor + ';">';
        html += '<div class="category-header-left">';
        html += '<span class="drag-handle" title="Arrastra para reordenar">☰</span>';
        html += '<span class="category-header-name" style="color: ' + catColor + ';">' + escapeHtml(catName) + '</span>';
        html += '</div>';
        html += '<button class="btn-add" onclick="addItem(\'' + escapeAttr(catName) + '\')" title="Añadir plato a ' + escapeAttr(catName) + '">＋</button>';
        html += '</div>';

        // Items list
        html += '<div class="category-items">';
        for (var j = 0; j < items.length; j++) {
            var item = items[j].item;
            var idx = items[j].globalIndex;
            var isNo = item.disponible === 'no';

            html += '<div class="item-row' + (isNo ? ' status-no' : '') + '" data-index="' + idx + '">';
            html += '<div class="item-field item-drag">';
            html += '<span class="item-drag-handle" title="Arrastra para reordenar">☰</span>';
            html += '</div>';
            html += '<div class="item-field item-name">';
            html += '<input class="cell-input" value="' + escapeHtml(item.nombre || '') + '" placeholder="Nombre del plato" onchange="updateItem(' + idx + ', \'nombre\', this.value)">';
            html += '</div>';
            html += '<div class="item-field item-price">';
            html += '<input class="cell-input price" type="number" step="0.10" min="0" value="' + parseFloat(item.precio || 0).toFixed(2) + '" onchange="updateItem(' + idx + ', \'precio\', this.value)">';
            html += '<span class="price-symbol">€</span>';
            html += '</div>';
            html += '<div class="item-field item-desc">';
            html += '<input class="cell-input" value="' + escapeHtml(item.descripcion || '') + '" placeholder="Descripción (opcional)" onchange="updateItem(' + idx + ', \'descripcion\', this.value)">';
            html += '</div>';
            html += '<div class="item-field item-avail">';
            html += '<select class="cell-select" onchange="updateItem(' + idx + ', \'disponible\', this.value)">';
            html += '<option value="si"' + (item.disponible !== 'no' ? ' selected' : '') + '>Sí</option>';
            html += '<option value="no"' + (item.disponible === 'no' ? ' selected' : '') + '>No</option>';
            html += '</select>';
            html += '</div>';
            html += '<div class="item-field item-actions">';
            html += '<button class="btn-icon" onclick="deleteItem(' + idx + ')" title="Eliminar">\u{1F5D1}\u{FE0F}</button>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';

        html += '</div>';
    }

    container.innerHTML = html;
    initCategoryDrag();
    initItemDrag();
}

// === Category Drag and Drop ===
var draggedSection = null;

function initCategoryDrag() {
    var sections = document.querySelectorAll('.category-section');
    sections.forEach(function (section) {
        // Only start drag from the handle
        var handle = section.querySelector('.drag-handle');
        if (handle) {
            handle.addEventListener('mousedown', function () {
                section.setAttribute('draggable', 'true');
            });
            handle.addEventListener('mouseup', function () {
                section.setAttribute('draggable', 'false');
            });
        }
        // Prevent drag if not from handle
        section.setAttribute('draggable', 'false');

        section.addEventListener('dragstart', function (e) {
            draggedSection = section;
            section.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', section.dataset.category);
        });

        section.addEventListener('dragend', function () {
            section.classList.remove('dragging');
            draggedSection = null;
            // Remove all drag-over classes
            document.querySelectorAll('.category-section.drag-over').forEach(function (el) {
                el.classList.remove('drag-over');
            });
        });

        section.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedSection && draggedSection !== section) {
                section.classList.add('drag-over');
            }
        });

        section.addEventListener('dragleave', function () {
            section.classList.remove('drag-over');
        });

        section.addEventListener('drop', function (e) {
            e.preventDefault();
            section.classList.remove('drag-over');
            if (!draggedSection || draggedSection === section) return;

            var container = document.getElementById('menuSections');
            var allSections = Array.from(container.querySelectorAll('.category-section'));
            var fromIndex = allSections.indexOf(draggedSection);
            var toIndex = allSections.indexOf(section);

            if (fromIndex < 0 || toIndex < 0) return;

            // Move the DOM element
            if (fromIndex < toIndex) {
                container.insertBefore(draggedSection, section.nextSibling);
            } else {
                container.insertBefore(draggedSection, section);
            }

            // Reorder menuItems to match new category order
            reorderCategories();
            showStatus('Categoría movida. Recuerda guardar los cambios.', 'info');
        });
    });
}

function reorderCategories() {
    var sections = document.querySelectorAll('.category-section');
    var newOrder = [];
    sections.forEach(function (s) {
        var cat = s.dataset.category.replace(/\\'/g, "'").replace(/&quot;/g, '"');
        newOrder.push(cat);
    });

    // Rebuild menuItems in new category order
    var catMap = {};
    for (var i = 0; i < menuItems.length; i++) {
        var cat = menuItems[i].categoria || '';
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(menuItems[i]);
    }

    menuItems = [];
    for (var j = 0; j < newOrder.length; j++) {
        var items = catMap[newOrder[j]] || [];
        for (var k = 0; k < items.length; k++) {
            menuItems.push(items[k]);
        }
    }

    categoryOrder = newOrder;
}

// === Item Drag and Drop ===
function initItemDrag() {
    var rows = document.querySelectorAll('.item-row');
    rows.forEach(function (row) {
        var handle = row.querySelector('.item-drag-handle');
        if (handle) {
            handle.addEventListener('mousedown', function () {
                row.setAttribute('draggable', 'true');
            });
            handle.addEventListener('mouseup', function () {
                row.setAttribute('draggable', 'false');
            });
        }
        row.setAttribute('draggable', 'false');

        row.addEventListener('dragstart', function (e) {
            draggedItemIndex = parseInt(row.dataset.index);
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(draggedItemIndex));
        });

        row.addEventListener('dragend', function () {
            row.classList.remove('dragging');
            draggedItemIndex = null;
            document.querySelectorAll('.item-row.drag-over').forEach(function (el) {
                el.classList.remove('drag-over');
            });
        });

        row.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedItemIndex !== null && draggedItemIndex !== parseInt(row.dataset.index)) {
                row.classList.add('drag-over');
            }
        });

        row.addEventListener('dragleave', function () {
            row.classList.remove('drag-over');
        });

        row.addEventListener('drop', function (e) {
            e.preventDefault();
            row.classList.remove('drag-over');
            if (draggedItemIndex === null) return;
            var targetIndex = parseInt(row.dataset.index);
            if (draggedItemIndex === targetIndex) return;

            moveMenuItem(draggedItemIndex, targetIndex);
        });
    });

    var itemContainers = document.querySelectorAll('.category-items');
    itemContainers.forEach(function (container) {
        container.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedItemIndex !== null) {
                container.classList.add('drag-over-container');
            }
        });

        container.addEventListener('dragleave', function () {
            container.classList.remove('drag-over-container');
        });

        container.addEventListener('drop', function (e) {
            e.preventDefault();
            container.classList.remove('drag-over-container');
            if (draggedItemIndex === null) return;

            var section = container.closest('.category-section');
            if (!section) return;
            var targetCategory = section.dataset.category;

            var draggedItem = menuItems[draggedItemIndex];
            var targetIndex = -1;

            for (var j = menuItems.length - 1; j >= 0; j--) {
                if (menuItems[j].categoria === targetCategory) {
                    targetIndex = j;
                    break;
                }
            }

            if (targetIndex !== -1) {
                if (draggedItemIndex === targetIndex) return;
                moveMenuItem(draggedItemIndex, targetIndex);
            } else {
                draggedItem.categoria = targetCategory;
                menuItems.splice(draggedItemIndex, 1);
                menuItems.push(draggedItem);
                renderSections();
                showStatus('Plato movido. Recuerda guardar los cambios.', 'info');
            }
        });
    });
}

function moveMenuItem(fromIndex, toIndex) {
    var draggedItem = menuItems[fromIndex];
    var targetItem = menuItems[toIndex];

    draggedItem.categoria = targetItem.categoria;

    menuItems.splice(fromIndex, 1);

    var adjustedToIndex = toIndex;
    if (fromIndex < toIndex) {
        adjustedToIndex = toIndex - 1;
    }

    menuItems.splice(adjustedToIndex, 0, draggedItem);

    renderSections();
    showStatus('Plato movido. Recuerda guardar los cambios.', 'info');
}

// === CRUD Operations ===
var ALLOWED_ITEM_FIELDS = ['nombre', 'precio', 'descripcion', 'disponible'];

function updateItem(index, field, value) {
    if (!ALLOWED_ITEM_FIELDS.includes(field)) return;

    if (field === 'disponible') {
        if (value !== 'si' && value !== 'no') return;
        menuItems[index][field] = value;
        var row = document.querySelector('.item-row[data-index="' + index + '"]');
        if (row) {
            if (value === 'no') {
                row.classList.add('status-no');
            } else {
                row.classList.remove('status-no');
            }
        }
        return;
    }

    if (field === 'precio') {
        // Permite entrada parcial durante tipeo (ej. "1.", "1.5")
        // Solo almacena el string; validación definitiva ocurre al guardar
        menuItems[index][field] = String(value).slice(0, 20);
        return;
    }

    if (field === 'nombre') {
        menuItems[index][field] = String(value).slice(0, 150);
        return;
    }

    if (field === 'descripcion') {
        menuItems[index][field] = String(value).slice(0, 500);
        return;
    }
}

function deleteItem(index) {
    if (confirm('¿Eliminar "' + menuItems[index].nombre + '"?')) {
        menuItems.splice(index, 1);
        renderSections();
        showStatus('Plato eliminado. Recuerda guardar los cambios.', 'info');
    }
}

function addItem(category) {
    var newItem = {
        categoria: category,
        nombre: '',
        precio: '0.00',
        descripcion: '',
        disponible: 'si'
    };

    // Find the position to insert (after the last item of this category)
    var insertIndex = -1;
    for (var j = menuItems.length - 1; j >= 0; j--) {
        if (menuItems[j].categoria === category) {
            insertIndex = j + 1;
            break;
        }
    }

    if (insertIndex === -1) {
        menuItems.push(newItem);
        insertIndex = menuItems.length - 1;
    } else {
        menuItems.splice(insertIndex, 0, newItem);
    }

    renderSections();

    // Scroll to and focus the new row
    setTimeout(function () {
        var row = document.querySelector('.item-row[data-index="' + insertIndex + '"]');
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var nameInput = row.querySelector('.item-name .cell-input');
            if (nameInput) nameInput.focus();
        }
    }, 200);

    showStatus('Nuevo plato añadido en "' + category + '". Edita el nombre y precio, luego guarda.', 'info');
}

function addCategory() {
    var name = prompt('Nombre de la nueva categoría:');
    if (!name || !name.trim()) return;

    name = name.trim().toUpperCase();

    // Check if category already exists
    var existing = getCategories();
    for (var i = 0; i < existing.length; i++) {
        if (existing[i].toUpperCase() === name) {
            showStatus('La categoría "' + name + '" ya existe.', 'error');
            return;
        }
    }

    // Add a placeholder item in the new category
    menuItems.push({
        categoria: name,
        nombre: '',
        precio: '0.00',
        descripcion: '',
        disponible: 'si'
    });

    renderSections();

    // Scroll to the new section
    setTimeout(function () {
        var sections = document.querySelectorAll('.category-section');
        var lastSection = sections[sections.length - 1];
        if (lastSection) {
            lastSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var nameInput = lastSection.querySelector('.item-name .cell-input');
            if (nameInput) nameInput.focus();
        }
    }, 200);

    showStatus('Categoría "' + name + '" creada. Añade platos y guarda.', 'success');
}

// === Save to Firestore ===
async function saveMenu() {
    try {
        sortByCategory();

        // Group items by category
        var categories = getCategories();
        var catMap = {};
        for (var i = 0; i < menuItems.length; i++) {
            var cat = menuItems[i].categoria || '';
            if (!catMap[cat]) catMap[cat] = [];
            var rawPrecio = parseFloat(menuItems[i].precio);
            var safePrecio = (!isNaN(rawPrecio) && rawPrecio >= 0)
                ? rawPrecio.toFixed(2)
                : '0.00';

            catMap[cat].push({
                nombre: (menuItems[i].nombre || '').trim().slice(0, 150),
                precio: safePrecio,
                descripcion: (menuItems[i].descripcion || '').trim().slice(0, 500),
                disponible: menuItems[i].disponible === 'no' ? 'no' : 'si'
            });
        }

        // Use a batch write for atomicity
        var batch = db.batch();

        // Delete existing category docs
        var existingDocs = await db.collection('menu').get();
        existingDocs.forEach(function (doc) {
            batch.delete(doc.ref);
        });

        // Write new category docs
        for (var c = 0; c < categories.length; c++) {
            var catName = categories[c];
            var slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            var docRef = db.collection('menu').doc(slug);
            batch.set(docRef, {
                nombre: catName,
                orden: c,
                items: catMap[catName] || []
            });
        }

        await batch.commit();
        showStatus('✅ Menú guardado correctamente', 'success');
        renderSections();
    } catch (err) {
        console.error('Error saving menu:', err);
        showStatus('❌ Error al guardar: ' + err.message, 'error');
    }
}

// === QR Modal (Static Image) ===
function showQRModal() {
    document.getElementById('qrModal').style.display = '';
}

function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function printQR() {
    window.print();
}

// === Monthly Menu Management ===
var adminCurrentDayTab = 1;

var DEFAULT_MONTHLY_TEMPLATE = {
    mes: "Septiembre",
    precio: "13,90€",
    incluye: "Primero + Segundo + Bebida + Postre",
    dias: {
        1: {
            nombre: "Lunes",
            entradas: ["Ceviche", "Aguadito", "Causa Limeña"],
            segundos: ["Arroz con pollo", "Lentejas c/ (dorada o filete)", "Cerdo con ensalada rusa", "¼ pollo a la brasa"]
        },
        2: {
            nombre: "Martes",
            entradas: ["Sopa wantan", "Wantan frito", "Tequeños", "Papa rellena"],
            segundos: ["Combinado de pollo", "Chijaukay", "Aeropuerto", "¼ pollo a la brasa"]
        },
        3: {
            nombre: "Miércoles",
            cerrado: true,
            mensaje: "Cerrado por descanso del personal",
            entradas: [],
            segundos: []
        },
        4: {
            nombre: "Jueves",
            entradas: ["Leche de tigre", "Anticucho", "Caldo de gallina"],
            segundos: ["Cau cau", "Tallarines rojos con papa a la huancaína", "¼ pollo a la brasa"]
        },
        5: {
            nombre: "Viernes",
            entradas: ["Patasca", "Ceviche", "Chicharrón de pota"],
            segundos: ["Picante de carne", "Ají de gallina", "¼ pollo a la brasa", "Pollada"]
        }
    }
};

function showWeeklyMenu() {
    document.getElementById('weeklyMenuModal').style.display = '';
    loadMonthlyMenuData();
}

function closeWeeklyMenu() {
    document.getElementById('weeklyMenuModal').style.display = 'none';
}

function switchAdminMenuDay(dayNum) {
    adminCurrentDayTab = dayNum;

    for (var d = 1; d <= 5; d++) {
        var btn = document.getElementById('adminTabBtn_' + d);
        var panel = document.getElementById('adminDayPanel_' + d);
        if (btn) {
            if (d === dayNum) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        if (panel) {
            panel.style.display = (d === dayNum) ? '' : 'none';
        }
    }
}

function toggleDayCerrado(dayNum) {
    var checkEl = document.getElementById('adminCerrado_' + dayNum);
    var platosEl = document.getElementById('adminMiercolesPlatos');
    if (checkEl && platosEl) {
        platosEl.style.display = checkEl.checked ? 'none' : '';
    }
}

function loadDefaultTemplate() {
    if (confirm('¿Restablecer los campos con la plantilla base de Septiembre?')) {
        populateAdminMenuForm(DEFAULT_MONTHLY_TEMPLATE);
        showStatus('ℹ️ Plantilla cargada en el formulario', 'info');
    }
}

function populateAdminMenuForm(data) {
    if (!data) return;

    if (document.getElementById('menuMes')) {
        document.getElementById('menuMes').value = data.mes || 'Septiembre';
    }
    if (document.getElementById('menuPrecio')) {
        document.getElementById('menuPrecio').value = data.precio || '13,90€';
    }
    if (document.getElementById('menuIncluye')) {
        document.getElementById('menuIncluye').value = data.incluye || 'Primero + Segundo + Bebida + Postre';
    }

    var dias = data.dias || {};
    for (var d = 1; d <= 5; d++) {
        var dayInfo = dias[d] || {};
        var entEl = document.getElementById('adminEntradas_' + d);
        var segEl = document.getElementById('adminSegundos_' + d);
        var cerrEl = document.getElementById('adminCerrado_' + d);

        if (entEl) entEl.value = (dayInfo.entradas || []).join('\n');
        if (segEl) segEl.value = (dayInfo.segundos || []).join('\n');
        if (cerrEl) {
            cerrEl.checked = !!dayInfo.cerrado;
            toggleDayCerrado(d);
        }
    }

    switchAdminMenuDay(adminCurrentDayTab || 1);
}

async function loadMonthlyMenuData() {
    try {
        var doc = await db.collection('config').doc('monthly_menu').get();
        if (doc.exists && doc.data() && doc.data().dias) {
            populateAdminMenuForm(doc.data());
        } else {
            populateAdminMenuForm(DEFAULT_MONTHLY_TEMPLATE);
        }
    } catch (err) {
        console.warn('Cargando plantilla base por defecto:', err);
        populateAdminMenuForm(DEFAULT_MONTHLY_TEMPLATE);
    }
}

async function publishMonthlyMenu() {
    try {
        showStatus('Guardando menú del mes...', 'info');

        var mes = (document.getElementById('menuMes').value || 'Septiembre').trim();
        var precio = (document.getElementById('menuPrecio').value || '13,90€').trim();
        var incluye = (document.getElementById('menuIncluye').value || 'Primero + Segundo + Bebida + Postre').trim();

        var dias = {};
        var dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes' };

        for (var d = 1; d <= 5; d++) {
            var cerrEl = document.getElementById('adminCerrado_' + d);
            var isClosed = cerrEl ? cerrEl.checked : false;

            var entEl = document.getElementById('adminEntradas_' + d);
            var segEl = document.getElementById('adminSegundos_' + d);

            var entradas = [];
            var segundos = [];

            if (!isClosed) {
                if (entEl && entEl.value.trim()) {
                    entradas = entEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
                }
                if (segEl && segEl.value.trim()) {
                    segundos = segEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
                }
            }

            dias[d] = {
                id: dayNames[d].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                nombre: dayNames[d],
                activo: !isClosed,
                cerrado: isClosed,
                mensaje: isClosed ? 'Cerrado por descanso del personal' : '',
                entradas: entradas,
                segundos: segundos
            };
        }

        var payload = {
            mes: mes,
            precio: precio,
            incluye: incluye,
            dias: dias,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Guardar configuración mensual en config/monthly_menu
        await db.collection('config').doc('monthly_menu').set(payload);

        // Guardar snapshot en weekly_menu para compatibilidad
        var today = new Date().getDay();
        var targetDayKey = (today >= 1 && today <= 5 && !dias[today].cerrado) ? today : 1;
        var activeDayData = dias[targetDayKey] || dias[1];

        await db.collection('config').doc('weekly_menu').set({
            mes: mes,
            primeros: activeDayData.entradas || [],
            segundos: activeDayData.segundos || [],
            fecha: mes + ' · ' + activeDayData.nombre,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showStatus('✅ Menú de ' + mes + ' guardado y publicado correctamente', 'success');
        closeWeeklyMenu();
    } catch (err) {
        console.error('Error publicando menú mensual:', err);
        showStatus('❌ Error al guardar el menú: ' + err.message, 'error');
    }
}

// === Status Bar ===
function showStatus(message, type) {
    type = type || 'info';
    var bar = document.getElementById('statusBar');
    var msg = document.getElementById('statusMessage');
    bar.style.display = '';
    bar.className = 'status-bar ' + type;
    msg.textContent = message;

    if (type === 'success') {
        setTimeout(function () { hideStatus(); }, 5000);
    }
}

function hideStatus() {
    document.getElementById('statusBar').style.display = 'none';
}

// === Helpers ===
// escapeHtml está disponible globalmente desde firebase-config.js

function escapeAttr(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#039;');
}
// === Helper to check image existence ===
async function checkImageExists(url) {
    return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(true); };
        img.onerror = function () { resolve(false); };
        img.src = url;
    });
}

// === Helper to convert dish name to file path ===
function getDishImagePaths(dishName) {
    if (!dishName) return [];
    var baseName = dishName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    return [
        'img/menu/' + baseName + '.avif',
        'img/menu/' + baseName + '.webp',
        'img/menu/' + baseName + '.jpg'
    ];
}

// === Find First Valid Image for a list of Dishes ===
async function getFirstValidImage(dishes) {
    for (var i = 0; i < dishes.length; i++) {
        var dish = dishes[i].trim();
        if (dish) {
            var paths = getDishImagePaths(dish);
            for (var j = 0; j < paths.length; j++) {
                if (await checkImageExists(paths[j])) {
                    return paths[j];
                }
            }
        }
    }
    return ''; // No image found
}

// === Find All Valid Images for a list of Dishes, return as array ===
async function getAllValidImages(dishes) {
    var result = [];
    for (var i = 0; i < dishes.length; i++) {
        var dish = dishes[i].trim();
        if (dish) {
            var paths = getDishImagePaths(dish);
            var found = false;
            for (var j = 0; j < paths.length; j++) {
                if (await checkImageExists(paths[j])) {
                    result.push(paths[j]);
                    found = true;
                    break;
                }
            }
            if (!found) result.push('');
        }
    }
    return result;
}

// === Download Menu as Image ===
async function downloadMenuImage() {
    showStatus('Generando imagen, por favor espera...', 'info');

    var currentDayNumber = adminCurrentDayTab || 1;
    var dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes' };
    var dayName = dayNames[currentDayNumber] || 'Hoy';
    var mes = (document.getElementById('menuMes') ? document.getElementById('menuMes').value : 'Septiembre').trim();

    var cerrEl = document.getElementById('adminCerrado_' + currentDayNumber);
    if (cerrEl && cerrEl.checked) {
        showStatus('⚠️ ' + dayName + ' está marcado como cerrado. Selecciona otro día para generar imagen.', 'error');
        return;
    }

    var entEl = document.getElementById('adminEntradas_' + currentDayNumber);
    var segEl = document.getElementById('adminSegundos_' + currentDayNumber);

    var primeros = entEl ? entEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    var segundos = segEl ? segEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : [];

    if (primeros.length === 0 && segundos.length === 0) {
        showStatus('⚠️ No hay platos introducidos para ' + dayName, 'error');
        return;
    }

    var fecha = mes + " · " + dayName;

    // Process Texts
    var previewPrimeros = document.getElementById('previewPrimeros');
    var previewSegundos = document.getElementById('previewSegundos');
    var previewDate = document.getElementById('previewDate');

    previewDate.textContent = fecha;

    previewPrimeros.innerHTML = primeros.map(function (item) {
        return '<div style="display: flex; align-items: flex-start;"><span style="color: #f9d406; margin-right: 15px; font-size: 30px;">•</span><span style="color: #ffffff;">' + item + '</span></div>';
    }).join('');

    previewSegundos.innerHTML = segundos.map(function (item) {
        return '<div style="display: flex; align-items: flex-start; margin-bottom: 5px;"><span style="color: #f9d406; margin-right: 15px; font-size: 30px;">•</span><span style="color: #ffffff;">' + item + '</span></div>';
    }).join('');

    // Fetch matching images for slots (1 from primeros, 2 from segundos usually, or just whatever fits)
    var img1Src = await getFirstValidImage(primeros);
    var img2Src = await getFirstValidImage(segundos);

    // Attempt to get a different image for the third slot
    var allSegundosImgs = await getAllValidImages(segundos);
    var img3Src = '';
    for (var k = 0; k < allSegundosImgs.length; k++) {
        if (allSegundosImgs[k] && allSegundosImgs[k] !== img2Src) {
            img3Src = allSegundosImgs[k];
            break;
        }
    }
    // Fallback if not enough matching images
    if (!img1Src) img1Src = 'img/perfil.webp';
    if (!img2Src) img2Src = 'img/perfil.webp';
    if (!img3Src) img3Src = img1Src !== 'img/perfil.webp' ? img1Src : 'img/perfil.webp';

    var img1 = document.getElementById('previewImg1');
    var img2 = document.getElementById('previewImg2');
    var img3 = document.getElementById('previewImg3');

    img1.src = img1Src;
    img2.src = img2Src;
    img3.src = img3Src;

    // Wait for images to load before rendering
    await Promise.all([
        new Promise(function (r) { img1.onload = img1.onerror = r; }),
        new Promise(function (r) { img2.onload = img2.onerror = r; }),
        new Promise(function (r) { img3.onload = img3.onerror = r; })
    ]);

    var container = document.getElementById('menuImagePreviewBox');
    // Temporarily bring it offscreen but visible strictly to html2canvas
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.opacity = '1';
    container.style.zIndex = '-9999';

    try {
        var canvas = await html2canvas(document.getElementById('menuImagePreview'), {
            scale: 2, // High resolution
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        });

        // Re-hide container
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';

        var dataURL = canvas.toDataURL('image/png');
        var link = document.createElement('a');
        link.download = 'Menu_Mis_Raizes_Hoy.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showStatus('✅ Imagen generada y descargada', 'success');
    } catch (err) {
        console.error('Error html2canvas:', err);
        showStatus('❌ Error al generar la imagen', 'error');
        container.style.left = '-9999px';
    }
}

