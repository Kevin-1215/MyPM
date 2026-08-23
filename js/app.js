document.addEventListener('DOMContentLoaded', () => {
    let appData = {};
    let currentModelKey = 'dtc';
    let currentGanttModel = 'all';
    let fileHandle = null;

    // ── Google Firebase Realtime Database 雲端設定 ──────────────
    const firebaseConfig = {
        apiKey: "AIzaSyB74NFgqqf81lN_tGFGdRtg6CC-2FtD0xo",
        authDomain: "vb-apparel-design-startup.firebaseapp.com",
        databaseURL: "https://vb-apparel-design-startup-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "vb-apparel-design-startup",
        storageBucket: "vb-apparel-design-startup.firebasestorage.app",
        messagingSenderId: "1045855280818",
        appId: "1:1045855280818:web:01377dcf5757bf5a9bb3ab"
    };

    let firebaseApp = null;
    let firebaseDb = null;
    let dbDataRef = null;
    let isConnectedToFirebase = false;
    let isLocalUpdate = false; // 避免本機寫入時觸發不必要的重複全頁重繪

    // 向量 SVG 圖標字典 (全面取代 Emoji)
    const ICONS = {
        user: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        calendar: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
        folder: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        check: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        note: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        grip: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:4px;"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`
    };

    // 商業模式/專案色彩與標籤映射
    const MODEL_MAP = {
        dtc: { name: 'DTC 垂直電商', badgeClass: 'badge-dtc', barClass: 'gantt-bar-dtc', dotClass: 'dtc-dot' },
        b2b: { name: 'B2B 團服', badgeClass: 'badge-b2b', barClass: 'gantt-bar-b2b', dotClass: 'b2b-dot' },
        pod: { name: 'POD 隨選列印', badgeClass: 'badge-pod', barClass: 'gantt-bar-pod', dotClass: 'pod-dot' },
        lifestyle: { name: 'Lifestyle 品牌', badgeClass: 'badge-lifestyle', barClass: 'gantt-bar-lifestyle', dotClass: 'life-dot' }
    };

    function getModelMeta(key) {
        if (MODEL_MAP[key]) return MODEL_MAP[key];
        return {
            name: appData[key]?.title || '自訂專案',
            badgeClass: 'badge-custom',
            barClass: 'gantt-bar-custom',
            dotClass: 'custom-dot'
        };
    }

    // DOM Elements - Navigation & Views
    const viewTabs = document.querySelectorAll('.view-tab');
    const dashboardView = document.getElementById('dashboard-view');
    const modelsView = document.getElementById('models-view');
    const ganttView = document.getElementById('gantt-view');
    const savingStatus = document.getElementById('saving-status');
    
    // DOM Elements - Dashboard
    const dbTotalTasks = document.getElementById('db-total-tasks');
    const dbCompletedTasks = document.getElementById('db-completed-tasks');
    const dbPendingTasks = document.getElementById('db-pending-tasks');
    const dbOverallProgress = document.getElementById('db-overall-progress');
    const overallProgressContainer = document.getElementById('overall-progress-container');
    const decisionsTableBody = document.querySelector('#decisions-table tbody');
    const budgetTableBody = document.querySelector('#budget-table tbody');
    const budgetTotal = document.getElementById('budget-total');
    const addDecisionBtn = document.getElementById('add-decision-btn');
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const dbFilterModel = document.getElementById('db-filter-model');
    const dbFilterStatus = document.getElementById('db-filter-status');
    const dashboardMasterTodos = document.getElementById('dashboard-master-todos');

    // DOM Elements - Projects & Tasks
    const scenarioNav = document.getElementById('scenario-nav');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const editCategoryBtn = document.getElementById('edit-category-btn');
    const delCategoryBtn = document.getElementById('del-category-btn');

    const modelConcept = document.getElementById('model-concept');
    const modelPros = document.getElementById('model-pros');
    const modelCons = document.getElementById('model-cons');
    const todoContainer = document.getElementById('todo-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const kpiAudience = document.getElementById('kpi-audience');
    const kpiRevenue = document.getElementById('kpi-revenue');
    const kpiProgress = document.getElementById('kpi-progress');
    const addPhaseBtn = document.getElementById('add-phase-btn');
    const addTaskBtn = document.getElementById('add-task-btn');

    const btnEditAudience = document.getElementById('btn-edit-audience');
    const btnEditRevenue = document.getElementById('btn-edit-revenue');
    const btnEditConcept = document.getElementById('btn-edit-concept');
    const btnAddPro = document.getElementById('btn-add-pro');
    const btnAddCon = document.getElementById('btn-add-con');

    // DOM Elements - Gantt
    const ganttModelPills = document.getElementById('gantt-model-pills');
    const ganttDynamicLegend = document.getElementById('gantt-dynamic-legend');
    const ganttChartWrapper = document.getElementById('gantt-chart-wrapper');

    // DOM Elements - Modals
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const modalTaskClose = document.getElementById('modal-task-close');
    const modalTaskCancel = document.getElementById('modal-task-cancel');
    const taskFormPhase = document.getElementById('task-form-phase');
    const taskFormName = document.getElementById('task-form-name');
    const taskFormStart = document.getElementById('task-form-start');
    const taskFormDue = document.getElementById('task-form-due');
    const taskFormOwner = document.getElementById('task-form-owner');
    const taskFormNotes = document.getElementById('task-form-notes');
    const taskEditModel = document.getElementById('task-edit-model');
    const taskEditPhaseId = document.getElementById('task-edit-phase-id');
    const taskEditItemId = document.getElementById('task-edit-item-id');

    const phaseModal = document.getElementById('phase-modal');
    const phaseForm = document.getElementById('phase-form');
    const modalPhaseClose = document.getElementById('modal-phase-close');
    const modalPhaseCancel = document.getElementById('modal-phase-cancel');
    const phaseFormName = document.getElementById('phase-form-name');

    const categoryModal = document.getElementById('category-modal');
    const categoryForm = document.getElementById('category-form');
    const modalCategoryTitle = document.getElementById('modal-category-title');
    const modalCategoryClose = document.getElementById('modal-category-close');
    const modalCategoryCancel = document.getElementById('modal-category-cancel');
    const categoryEditKey = document.getElementById('category-edit-key');
    const categoryFormName = document.getElementById('category-form-name');
    const categoryFormConcept = document.getElementById('category-form-concept');
    const categoryFormAudience = document.getElementById('category-form-audience');
    const categoryFormRevenue = document.getElementById('category-form-revenue');

    const textEditModal = document.getElementById('text-edit-modal');
    const textEditForm = document.getElementById('text-edit-form');
    const modalTextTitle = document.getElementById('modal-text-title');
    const modalTextLabel = document.getElementById('modal-text-label');
    const modalTextContent = document.getElementById('modal-text-content');
    const modalTextClose = document.getElementById('modal-text-close');
    const modalTextCancel = document.getElementById('modal-text-cancel');
    const textEditType = document.getElementById('text-edit-type');

    // ── 初始化 App 與 Firebase 雲端即時同步 ────────────────────────
    function init() {
        if (window.dashboardData) {
            appData = JSON.parse(JSON.stringify(window.dashboardData));
        } else {
            console.error("No data found in window.dashboardData!");
            return;
        }

        normalizeData();

        setupViewSwitcher();
        setupGlobalDataEditors();
        setupModals();
        setupCategoryCRUD();
        setupCardCRUD();
        setupDashboardFilters();
        
        renderScenarioNav();
        renderDashboard();
        
        const modelKeys = getModelKeys();
        if (modelKeys.length > 0) {
            selectModel(modelKeys[0]);
        }

        // 啟動 Firebase 雲端雙向即時同步
        initFirebaseSync();
    }

    function initFirebaseSync() {
        if (typeof firebase === 'undefined') {
            console.warn("Firebase SDK 未載入，進入本機模式。");
            updateSyncStatus('offline', '離線 (本機快取)');
            return;
        }

        try {
            if (!firebase.apps.length) {
                firebaseApp = firebase.initializeApp(firebaseConfig);
            } else {
                firebaseApp = firebase.app();
            }
            firebaseDb = firebase.database();
            dbDataRef = firebaseDb.ref('dashboardAppData');

            // 監聽連線狀態
            const connectedRef = firebaseDb.ref('.info/connected');
            connectedRef.on('value', (snap) => {
                isConnectedToFirebase = snap.val() === true;
                if (isConnectedToFirebase) {
                    updateSyncStatus('online', '🟢 雲端已即時同步');
                } else {
                    updateSyncStatus('connecting', '🟡 雲端連線中...');
                }
            });

            // 監聽雲端資料即時變更 (WebSocket 長連線推送)
            dbDataRef.on('value', (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData && typeof cloudData === 'object') {
                    // 若是本機剛剛發出的更新，不需重複重繪
                    if (isLocalUpdate) {
                        isLocalUpdate = false;
                        return;
                    }
                    console.log("☁️ 收到雲端即時同步資料更新");
                    appData = cloudData;
                    normalizeData();
                    refreshActiveViews();
                    updateSyncStatus('online', '🟢 雲端已即時同步');
                } else {
                    // 雲端尚無資料，自動將本機預設資料上傳作為初始種子資料
                    console.log("☁️ 雲端尚無資料，正在上傳初始資料集...");
                    if (window.dashboardData) {
                        dbDataRef.set(window.dashboardData);
                    }
                }
            }, (error) => {
                console.error("Firebase 讀取受限:", error);
                updateSyncStatus('error', '🔴 權限受限 (請檢查規則)');
            });

        } catch (err) {
            console.error("Firebase 初始化失敗:", err);
            updateSyncStatus('offline', '離線模式');
        }
    }

    function updateSyncStatus(state, text) {
        if (!savingStatus) return;
        savingStatus.textContent = text;
        if (state === 'online') {
            savingStatus.style.borderColor = 'var(--green-border)';
            savingStatus.style.color = 'var(--green-text)';
            savingStatus.style.background = 'var(--green-bg)';
        } else if (state === 'saving' || state === 'connecting') {
            savingStatus.style.borderColor = 'var(--amber-border)';
            savingStatus.style.color = 'var(--amber-text)';
            savingStatus.style.background = 'var(--amber-bg)';
        } else if (state === 'error') {
            savingStatus.style.borderColor = 'var(--red-border)';
            savingStatus.style.color = 'var(--red-text)';
            savingStatus.style.background = 'var(--red-bg)';
        } else {
            savingStatus.style.borderColor = 'var(--border)';
            savingStatus.style.color = 'var(--text-muted)';
            savingStatus.style.background = 'transparent';
        }
    }

    function refreshActiveViews() {
        const activeTab = document.querySelector('.view-tab.active');
        const view = activeTab ? activeTab.dataset.view : 'dashboard';

        renderScenarioNav();
        renderDashboard();

        if (view === 'models') {
            if (currentModelKey && appData[currentModelKey]) {
                selectModel(currentModelKey);
            } else {
                const keys = getModelKeys();
                if (keys.length > 0) selectModel(keys[0]);
            }
        } else if (view === 'gantt') {
            renderGanttChart();
        }
    }

    function getModelKeys() {
        return Object.keys(appData).filter(k => k !== 'global_data');
    }

    function normalizeData() {
        if (!appData.global_data) {
            appData.global_data = { decisions: [], budget: [] };
        }
        if (!appData.global_data.decisions) appData.global_data.decisions = [];
        if (!appData.global_data.budget) appData.global_data.budget = [];

        getModelKeys().forEach(key => {
            const model = appData[key];
            if (!model.title) model.title = '未命名專案';
            if (!model.concept) model.concept = '尚未填寫核心概念。';
            if (!model.target_audience) model.target_audience = '尚未指定目標受眾。';
            if (!model.revenue) model.revenue = '尚未指定營收來源。';
            if (!model.pros) model.pros = [];
            if (!model.cons) model.cons = [];
            if (!model.todos) model.todos = [];
            
            model.todos.forEach((group, gIdx) => {
                if (!group.id) group.id = `${key}-${gIdx + 1}`;
                if (!group.items) group.items = [];
                group.items.forEach((item, iIdx) => {
                    if (!item.id) item.id = `${group.id}-${iIdx + 1}`;
                    if (!item.startDate) item.startDate = '2026-09-01';
                    if (!item.dueDate) item.dueDate = '2026-09-30';
                    if (!item.owner) item.owner = '負責人';
                    if (item.notes === undefined) item.notes = '';
                    if (item.completed === undefined) item.completed = false;
                });
            });
        });
    }

    // ── SPA 視圖切換 ───────────────────────────────────────────────
    function setupViewSwitcher() {
        viewTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                viewTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const view = tab.dataset.view;
                dashboardView.style.display = view === 'dashboard' ? 'block' : 'none';
                modelsView.style.display = view === 'models' ? 'block' : 'none';
                ganttView.style.display = view === 'gantt' ? 'block' : 'none';

                if (view === 'dashboard') {
                    renderDashboard();
                } else if (view === 'models') {
                    if (currentModelKey) selectModel(currentModelKey);
                } else if (view === 'gantt') {
                    renderGanttChart();
                }
            });
        });
    }

    // ── 總儀表板 (Dashboard) 邏輯 ──────────────────────────────────
    function setupDashboardFilters() {
        dbFilterModel.addEventListener('change', renderMasterTodos);
        dbFilterStatus.addEventListener('change', renderMasterTodos);
    }

    function renderDashboard() {
        // 重新更新下拉篩選清單
        const prevVal = dbFilterModel.value;
        dbFilterModel.innerHTML = '<option value="all">所有專案分類</option>';
        getModelKeys().forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = appData[key].title;
            dbFilterModel.appendChild(opt);
        });
        if (getModelKeys().includes(prevVal) || prevVal === 'all') {
            dbFilterModel.value = prevVal;
        }

        let totalCount = 0;
        let completedCount = 0;

        overallProgressContainer.innerHTML = '';
        getModelKeys().forEach(key => {
            const data = appData[key];
            let modelTotal = 0, modelCompleted = 0;
            let nextAction = '無待辦事項';

            (data.todos || []).forEach(group => {
                (group.items || []).forEach(item => {
                    modelTotal++;
                    if (item.completed) {
                        modelCompleted++;
                    } else if (nextAction === '無待辦事項') {
                        nextAction = item.task;
                    }
                });
            });

            totalCount += modelTotal;
            completedCount += modelCompleted;

            const percentage = modelTotal === 0 ? 0 : Math.round((modelCompleted / modelTotal) * 100);

            const row = document.createElement('div');
            row.className = 'model-progress-row';
            row.innerHTML = `
                <div class="model-progress-header">
                    <span style="font-weight:700; color:var(--navy);">${data.title}</span>
                    <span>${modelCompleted}/${modelTotal} (${percentage}%)</span>
                </div>
                <div class="progress-bar-bg" style="margin-top:2px; height:8px;">
                    <div class="progress-bar-fill" style="width:${percentage}%;"></div>
                </div>
                <div class="model-next-action">${nextAction}</div>
            `;
            overallProgressContainer.appendChild(row);
        });

        const pendingCount = totalCount - completedCount;
        const overallPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

        dbTotalTasks.textContent = `${totalCount} 項`;
        dbCompletedTasks.textContent = `${completedCount} 項`;
        dbPendingTasks.textContent = `${pendingCount} 項`;
        dbOverallProgress.textContent = `${overallPercent}%`;

        renderDecisions();
        renderBudget();
        renderMasterTodos();
    }

    function renderMasterTodos() {
        dashboardMasterTodos.innerHTML = '';
        const modelFilter = dbFilterModel.value;
        const statusFilter = dbFilterStatus.value;

        let allTasks = [];

        getModelKeys().forEach(mKey => {
            if (modelFilter !== 'all' && modelFilter !== mKey) return;

            const model = appData[mKey];
            (model.todos || []).forEach(group => {
                (group.items || []).forEach(item => {
                    if (statusFilter === 'completed' && !item.completed) return;
                    if (statusFilter === 'pending' && item.completed) return;

                    allTasks.push({
                        modelKey: mKey,
                        modelTitle: model.title,
                        phaseTitle: group.parent,
                        task: item
                    });
                });
            });
        });

        if (allTasks.length === 0) {
            dashboardMasterTodos.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-muted); font-size:0.9rem;">沒有符合條件的待辦事項</div>`;
            return;
        }

        allTasks.forEach(({ modelKey, modelTitle, task }) => {
            const card = document.createElement('div');
            card.className = `master-todo-item ${task.completed ? 'completed' : ''}`;
            
            const meta = getModelMeta(modelKey);
            const notesHtml = task.notes && task.notes.trim() 
                ? `<div class="master-todo-notes">${ICONS.note}${task.notes}</div>` 
                : '';

            card.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} id="db-todo-${task.id}">
                <div class="master-todo-content">
                    <div class="master-todo-title">${task.task}</div>
                    ${notesHtml}
                    <div class="master-todo-meta">
                        <span class="badge ${meta.badgeClass}">${meta.name}</span>
                        <span class="badge badge-owner">${ICONS.user}${task.owner}</span>
                        <span class="badge badge-date">${ICONS.calendar}${task.startDate} ~ ${task.dueDate}</span>
                    </div>
                </div>
            `;

            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                task.completed = e.target.checked;
                card.classList.toggle('completed', task.completed);
                renderDashboard();
                saveData();
            });

            dashboardMasterTodos.appendChild(card);
        });
    }

    // ── 決策備忘錄與預算表格 ─────────────────────────────────────────
    function setupGlobalDataEditors() {
        addDecisionBtn.addEventListener('click', () => {
            appData.global_data.decisions.push({ date: new Date().toISOString().slice(0,10), topic: '', decision: '', owner: '' });
            renderDecisions();
            saveData(true);
        });

        addBudgetBtn.addEventListener('click', () => {
            appData.global_data.budget.push({ item: '', estimated_cost: '0', notes: '' });
            renderBudget();
            saveData(true);
        });
    }

    function renderDecisions() {
        decisionsTableBody.innerHTML = '';
        appData.global_data.decisions.forEach((dec, index) => {
            const tr = document.createElement('tr');
            
            const createInput = (field, value) => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.className = 'table-input';
                input.value = value || '';
                input.addEventListener('change', (e) => {
                    appData.global_data.decisions[index][field] = e.target.value;
                    saveData(true);
                });
                td.appendChild(input);
                return td;
            };

            tr.appendChild(createInput('date', dec.date));
            tr.appendChild(createInput('topic', dec.topic));
            tr.appendChild(createInput('decision', dec.decision));
            tr.appendChild(createInput('owner', dec.owner));

            const actionTd = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger-ghost';
            delBtn.textContent = '刪除';
            delBtn.addEventListener('click', () => {
                appData.global_data.decisions.splice(index, 1);
                renderDecisions();
                saveData(true);
            });
            actionTd.appendChild(delBtn);
            tr.appendChild(actionTd);

            decisionsTableBody.appendChild(tr);
        });
    }

    function renderBudget() {
        budgetTableBody.innerHTML = '';
        let sum = 0;
        appData.global_data.budget.forEach((bud, index) => {
            const tr = document.createElement('tr');
            
            const createInput = (field, value) => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.className = 'table-input';
                input.value = value || '';
                input.addEventListener('change', (e) => {
                    appData.global_data.budget[index][field] = e.target.value;
                    saveData(true);
                    renderBudget();
                });
                td.appendChild(input);
                return td;
            };

            tr.appendChild(createInput('item', bud.item));
            tr.appendChild(createInput('estimated_cost', bud.estimated_cost));
            tr.appendChild(createInput('notes', bud.notes));

            const actionTd = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger-ghost';
            delBtn.textContent = '刪除';
            delBtn.addEventListener('click', () => {
                appData.global_data.budget.splice(index, 1);
                renderBudget();
                saveData(true);
            });
            actionTd.appendChild(delBtn);
            tr.appendChild(actionTd);

            budgetTableBody.appendChild(tr);

            const cost = parseInt(String(bud.estimated_cost).replace(/,/g, ''), 10);
            if (!isNaN(cost)) sum += cost;
        });
        
        budgetTotal.textContent = sum.toLocaleString('en-US');
    }

    // ── 第一層專案分類 (Category) CRUD ──────────────────────────────
    function setupCategoryCRUD() {
        addCategoryBtn.addEventListener('click', () => {
            categoryForm.reset();
            modalCategoryTitle.textContent = '新增專案分類';
            categoryEditKey.value = '';
            categoryModal.style.display = 'flex';
            categoryFormName.focus();
        });

        editCategoryBtn.addEventListener('click', () => {
            const model = appData[currentModelKey];
            if (!model) return;
            categoryForm.reset();
            modalCategoryTitle.textContent = '編輯專案分類';
            categoryEditKey.value = currentModelKey;
            categoryFormName.value = model.title;
            categoryFormConcept.value = model.concept || '';
            categoryFormAudience.value = model.target_audience || '';
            categoryFormRevenue.value = model.revenue || '';
            categoryModal.style.display = 'flex';
            categoryFormName.focus();
        });

        delCategoryBtn.addEventListener('click', () => {
            const keys = getModelKeys();
            if (keys.length <= 1) {
                alert('至少需保留一個專案分類！');
                return;
            }
            const model = appData[currentModelKey];
            if (confirm(`確定要刪除「${model.title}」專案分類及其包含的所有待辦事項嗎？此動作無法復原。`)) {
                delete appData[currentModelKey];
                const nextKey = getModelKeys()[0];
                renderScenarioNav();
                selectModel(nextKey);
                saveData();
            }
        });

        modalCategoryClose.addEventListener('click', () => categoryModal.style.display = 'none');
        modalCategoryCancel.addEventListener('click', () => categoryModal.style.display = 'none');

        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editKey = categoryEditKey.value;
            const name = categoryFormName.value.trim();
            const concept = categoryFormConcept.value.trim() || '尚未填寫核心概念。';
            const audience = categoryFormAudience.value.trim() || '尚未指定目標受眾。';
            const revenue = categoryFormRevenue.value.trim() || '尚未指定營收來源。';

            if (!name) return;

            if (editKey && appData[editKey]) {
                // 編輯現有分類
                appData[editKey].title = name;
                appData[editKey].concept = concept;
                appData[editKey].target_audience = audience;
                appData[editKey].revenue = revenue;
                categoryModal.style.display = 'none';
                renderScenarioNav();
                selectModel(editKey);
            } else {
                // 新增分類
                const newKey = `proj_${Date.now()}`;
                appData[newKey] = {
                    title: name,
                    concept: concept,
                    target_audience: audience,
                    revenue: revenue,
                    pros: ["具備良好發展潛力與專案優勢。"],
                    cons: ["初期需密切追蹤執行進度與資源分配。"],
                    todos: [
                        {
                            id: `${newKey}-1`,
                            parent: "Phase 1: 初期規劃與啟動",
                            items: [
                                {
                                    id: `${newKey}-1-1`,
                                    task: "確認本專案核心里程碑與執行計畫",
                                    startDate: "2026-09-01",
                                    dueDate: "2026-09-15",
                                    owner: "專案PM",
                                    completed: false
                                }
                            ]
                        }
                    ]
                };
                categoryModal.style.display = 'none';
                renderScenarioNav();
                selectModel(newKey);
            }

            saveData();
        });
    }

    // ── 卡片細項 (受眾 / 收入 / 概念 / Pros / Cons) CRUD ───────────
    function setupCardCRUD() {
        // 目標受眾編輯
        btnEditAudience.addEventListener('click', () => {
            openTextEditModal('audience', '編輯目標受眾 Target Audience', '目標受眾描述', appData[currentModelKey].target_audience);
        });

        // 收入來源編輯
        btnEditRevenue.addEventListener('click', () => {
            openTextEditModal('revenue', '編輯收入來源 / 預期效益 Revenue Stream', '收入來源描述', appData[currentModelKey].revenue);
        });

        // 核心概念編輯
        btnEditConcept.addEventListener('click', () => {
            openTextEditModal('concept', '編輯核心概念 Concept', '核心概念說明', appData[currentModelKey].concept);
        });

        // 新增優勢
        btnAddPro.addEventListener('click', () => {
            const text = prompt('請輸入要新增的優勢 (Pros)：');
            if (text && text.trim()) {
                if (!appData[currentModelKey].pros) appData[currentModelKey].pros = [];
                appData[currentModelKey].pros.push(text.trim());
                renderProsCons();
                saveData();
            }
        });

        // 新增挑戰
        btnAddCon.addEventListener('click', () => {
            const text = prompt('請輸入要新增的挑戰 (Cons)：');
            if (text && text.trim()) {
                if (!appData[currentModelKey].cons) appData[currentModelKey].cons = [];
                appData[currentModelKey].cons.push(text.trim());
                renderProsCons();
                saveData();
            }
        });

        modalTextClose.addEventListener('click', () => textEditModal.style.display = 'none');
        modalTextCancel.addEventListener('click', () => textEditModal.style.display = 'none');

        textEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = textEditType.value;
            const content = modalTextContent.value.trim();
            if (!content) return;

            const model = appData[currentModelKey];
            if (type === 'audience') {
                model.target_audience = content;
                kpiAudience.textContent = content;
            } else if (type === 'revenue') {
                model.revenue = content;
                kpiRevenue.textContent = content;
            } else if (type === 'concept') {
                model.concept = content;
                modelConcept.textContent = content;
            }

            textEditModal.style.display = 'none';
            saveData();
        });
    }

    function openTextEditModal(type, title, label, value) {
        textEditType.value = type;
        modalTextTitle.textContent = title;
        modalTextLabel.textContent = label;
        modalTextContent.value = value || '';
        textEditModal.style.display = 'flex';
        modalTextContent.focus();
    }

    function renderProsCons() {
        const data = appData[currentModelKey];
        if (!data) return;

        renderEditableList(modelPros, data.pros, (newItems) => {
            data.pros = newItems;
            saveData();
        });

        renderEditableList(modelCons, data.cons, (newItems) => {
            data.cons = newItems;
            saveData();
        });
    }

    function renderEditableList(container, items, onUpdate) {
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = `<li style="color:var(--text-muted); font-style:italic;">尚無項目，點擊上方按鈕新增。</li>`;
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'editable-bullet-item';

            li.innerHTML = `
                <span class="editable-bullet-text">${item}</span>
                <div class="editable-bullet-actions">
                    <button class="btn-icon btn-edit-bullet" title="編輯項目">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon btn-del-bullet" title="刪除項目" style="color:var(--red-text);">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;

            li.querySelector('.btn-edit-bullet').addEventListener('click', () => {
                const newText = prompt('編輯項目內容：', item);
                if (newText !== null && newText.trim()) {
                    items[index] = newText.trim();
                    onUpdate(items);
                    renderProsCons();
                }
            });

            li.querySelector('.btn-del-bullet').addEventListener('click', () => {
                if (confirm(`確定要刪除「${item}」嗎？`)) {
                    items.splice(index, 1);
                    onUpdate(items);
                    renderProsCons();
                }
            });

            container.appendChild(li);
        });
    }

    // ── 專案細項與待辦清單渲染 ─────────────────────────────────────
    function renderScenarioNav() {
        scenarioNav.innerHTML = '';
        getModelKeys().forEach(key => {
            const data = appData[key];
            const tabBtn = document.createElement('button');
            tabBtn.className = `scenario-tab ${key === currentModelKey ? 'active' : ''}`;
            tabBtn.textContent = data.title;
            tabBtn.dataset.key = key;
            tabBtn.addEventListener('click', () => selectModel(key));
            scenarioNav.appendChild(tabBtn);
        });
    }

    function selectModel(key) {
        currentModelKey = key;
        const data = appData[key];
        if (!data) return;

        document.querySelectorAll('.scenario-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.key === key);
        });

        modelConcept.textContent = data.concept || '尚未填寫核心概念。';
        kpiAudience.textContent = data.target_audience || '尚未指定目標受眾。';
        kpiRevenue.textContent = data.revenue || '尚未指定營收來源。';

        renderProsCons();
        renderTodos();
        updateProgress();
    }

    let draggedEntity = null; // { type: 'group', groupIndex } 或 { type: 'task', fromGroupIndex, fromItemIndex }

    function renderTodos() {
        todoContainer.innerHTML = '';
        const data = appData[currentModelKey];
        if (!data || !data.todos) return;

        if (data.todos.length === 0) {
            todoContainer.innerHTML = `
                <div style="text-align:center; padding:36px; color:var(--text-muted); font-size:0.9rem;">
                    尚未建立任務階段。請點擊上方「+ 新增階段」開始規劃。
                </div>
            `;
            return;
        }

        data.todos.forEach((group, groupIndex) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'todo-group expanded';
            groupEl.dataset.groupIndex = groupIndex;

            const completedCount = group.items.filter(item => item.completed).length;
            const totalCount = group.items.length;

            groupEl.innerHTML = `
                <div class="todo-group-header">
                    <div class="group-title-container">
                        <span class="drag-handle group-drag-handle" title="按住拖曳以調整階段群組順序">${ICONS.grip}</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span>${group.parent}</span>
                    </div>
                    <div class="group-header-right">
                        <span class="group-progress">${completedCount}/${totalCount}</span>
                        <button class="btn btn-outline-primary btn-sm btn-add-item-to-group" title="在此階段新增待辦" style="padding:2px 8px; font-size:0.72rem;">+ 任務</button>
                        <button class="btn-danger-ghost btn-del-group" title="刪除此階段" style="font-size:0.72rem;">刪除</button>
                    </div>
                </div>
                <div class="todo-items" data-group-index="${groupIndex}"></div>
            `;

            const titleContainer = groupEl.querySelector('.group-title-container');
            const itemsContainer = groupEl.querySelector('.todo-items');
            const addBtn = groupEl.querySelector('.btn-add-item-to-group');
            const delGroupBtn = groupEl.querySelector('.btn-del-group');

            // 展開/收合
            titleContainer.addEventListener('click', (e) => {
                if (e.target.closest('.group-drag-handle')) return;
                e.stopPropagation();
                groupEl.classList.toggle('expanded');
            });

            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskModal(currentModelKey, group.id);
            });

            delGroupBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`確定要刪除「${group.parent}」及其包含的所有待辦任務嗎？`)) {
                    data.todos.splice(groupIndex, 1);
                    renderTodos();
                    updateProgress();
                    saveData();
                }
            });

            // ── 階段 (Group) 拖曳排序事件 ──
            groupEl.setAttribute('draggable', 'true');

            groupEl.addEventListener('dragstart', (e) => {
                if (e.target.closest('.todo-item')) return; // 避免任務拖曳冒泡為階段拖曳
                draggedEntity = { type: 'group', groupIndex };
                e.dataTransfer.setData('text/plain', JSON.stringify(draggedEntity));
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => groupEl.classList.add('is-dragging'), 0);
            });

            groupEl.addEventListener('dragend', () => {
                draggedEntity = null;
                document.querySelectorAll('.todo-group').forEach(el => {
                    el.classList.remove('is-dragging', 'drag-over-top', 'drag-over-bottom');
                });
                document.querySelectorAll('.todo-item').forEach(el => {
                    el.classList.remove('is-dragging', 'drag-over-top', 'drag-over-bottom');
                });
                document.querySelectorAll('.todo-items').forEach(el => {
                    el.classList.remove('drag-over-container');
                });
            });

            groupEl.addEventListener('dragover', (e) => {
                if (!draggedEntity || draggedEntity.type !== 'group') return;
                if (draggedEntity.groupIndex === groupIndex) return;

                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const rect = groupEl.getBoundingClientRect();
                const isTop = (e.clientY - rect.top) < (rect.height / 2);
                groupEl.classList.toggle('drag-over-top', isTop);
                groupEl.classList.toggle('drag-over-bottom', !isTop);
            });

            groupEl.addEventListener('dragleave', () => {
                groupEl.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            groupEl.addEventListener('drop', (e) => {
                if (!draggedEntity || draggedEntity.type !== 'group') return;
                e.preventDefault();
                e.stopPropagation();

                const fromIdx = draggedEntity.groupIndex;
                const rect = groupEl.getBoundingClientRect();
                const isTop = (e.clientY - rect.top) < (rect.height / 2);
                let toIdx = isTop ? groupIndex : groupIndex + 1;

                groupEl.classList.remove('drag-over-top', 'drag-over-bottom');

                if (fromIdx !== toIdx) {
                    const [moved] = data.todos.splice(fromIdx, 1);
                    const finalIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
                    data.todos.splice(finalIdx, 0, moved);
                    draggedEntity = null;
                    renderTodos();
                    updateProgress();
                    saveData();
                }
            });

            // ── 容器拖放 (接受跨階段拖入末端) ──
            itemsContainer.addEventListener('dragover', (e) => {
                if (!draggedEntity || draggedEntity.type !== 'task') return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                itemsContainer.classList.add('drag-over-container');
            });

            itemsContainer.addEventListener('dragleave', (e) => {
                if (!itemsContainer.contains(e.relatedTarget)) {
                    itemsContainer.classList.remove('drag-over-container');
                }
            });

            itemsContainer.addEventListener('drop', (e) => {
                if (!draggedEntity || draggedEntity.type !== 'task') return;
                if (e.target.closest('.todo-item')) return; // 若在具體 item 上由 item 處理

                e.preventDefault();
                e.stopPropagation();
                itemsContainer.classList.remove('drag-over-container');

                const fromG = draggedEntity.fromGroupIndex;
                const fromI = draggedEntity.fromItemIndex;
                const toG = groupIndex;

                const [movedTask] = data.todos[fromG].items.splice(fromI, 1);
                data.todos[toG].items.push(movedTask);

                draggedEntity = null;
                renderTodos();
                updateProgress();
                saveData();
            });

            if (group.items.length === 0) {
                itemsContainer.innerHTML = `<div style="padding:10px 16px; color:var(--text-muted); font-size:0.8rem; font-style:italic;">此階段尚無待辦事項，可點擊「+ 任務」或直接拖曳任務至此。</div>`;
            }

            group.items.forEach((item, itemIndex) => {
                const itemEl = document.createElement('div');
                itemEl.className = `todo-item ${item.completed ? 'completed' : ''}`;
                itemEl.dataset.groupIndex = groupIndex;
                itemEl.dataset.itemIndex = itemIndex;
                itemEl.setAttribute('draggable', 'true');
                
                const checkboxId = `todo-${currentModelKey}-${groupIndex}-${itemIndex}`;
                const notesHtml = item.notes && item.notes.trim() 
                    ? `<div class="todo-item-notes">${ICONS.note}${item.notes}</div>` 
                    : '';

                itemEl.innerHTML = `
                    <div class="todo-item-left">
                        <span class="drag-handle task-drag-handle" title="按住拖曳以調整任務順序或移動至其他階段">${ICONS.grip}</span>
                        <input type="checkbox" id="${checkboxId}" ${item.completed ? 'checked' : ''}>
                        <div class="todo-item-info">
                            <label for="${checkboxId}">${item.task}</label>
                            ${notesHtml}
                            <div class="todo-item-meta">
                                <span class="badge badge-owner">${ICONS.user}${item.owner || '未指派'}</span>
                                <span class="badge badge-date">${ICONS.calendar}${item.startDate} ~ ${item.dueDate}</span>
                            </div>
                        </div>
                    </div>
                    <div class="todo-item-actions">
                        <button class="btn-icon btn-edit-task" title="編輯任務">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon btn-del-task" title="刪除任務" style="color:var(--red-text);">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;

                // ── 任務 (Task) 拖曳排序事件 ──
                itemEl.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    draggedEntity = { type: 'task', fromGroupIndex: groupIndex, fromItemIndex: itemIndex };
                    e.dataTransfer.setData('text/plain', JSON.stringify(draggedEntity));
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => itemEl.classList.add('is-dragging'), 0);
                });

                itemEl.addEventListener('dragend', (e) => {
                    e.stopPropagation();
                    draggedEntity = null;
                    document.querySelectorAll('.todo-item').forEach(el => {
                        el.classList.remove('is-dragging', 'drag-over-top', 'drag-over-bottom');
                    });
                    document.querySelectorAll('.todo-items').forEach(el => {
                        el.classList.remove('drag-over-container');
                    });
                });

                itemEl.addEventListener('dragover', (e) => {
                    if (!draggedEntity || draggedEntity.type !== 'task') return;
                    if (draggedEntity.fromGroupIndex === groupIndex && draggedEntity.fromItemIndex === itemIndex) return;

                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';

                    const rect = itemEl.getBoundingClientRect();
                    const isTop = (e.clientY - rect.top) < (rect.height / 2);
                    itemEl.classList.toggle('drag-over-top', isTop);
                    itemEl.classList.toggle('drag-over-bottom', !isTop);
                });

                itemEl.addEventListener('dragleave', (e) => {
                    e.stopPropagation();
                    itemEl.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                itemEl.addEventListener('drop', (e) => {
                    if (!draggedEntity || draggedEntity.type !== 'task') return;
                    e.preventDefault();
                    e.stopPropagation();

                    itemEl.classList.remove('drag-over-top', 'drag-over-bottom');

                    const fromG = draggedEntity.fromGroupIndex;
                    const fromI = draggedEntity.fromItemIndex;
                    const toG = groupIndex;

                    const rect = itemEl.getBoundingClientRect();
                    const isTop = (e.clientY - rect.top) < (rect.height / 2);
                    let toI = isTop ? itemIndex : itemIndex + 1;

                    if (fromG === toG && (fromI === toI || fromI === toI - 1)) {
                        draggedEntity = null;
                        return;
                    }

                    const [movedTask] = data.todos[fromG].items.splice(fromI, 1);
                    if (fromG === toG) {
                        const finalI = fromI < toI ? toI - 1 : toI;
                        data.todos[toG].items.splice(finalI, 0, movedTask);
                    } else {
                        data.todos[toG].items.splice(toI, 0, movedTask);
                    }

                    draggedEntity = null;
                    renderTodos();
                    updateProgress();
                    saveData();
                });

                const checkbox = itemEl.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', (e) => {
                    item.completed = e.target.checked;
                    itemEl.classList.toggle('completed', item.completed);
                    
                    const newCompleted = group.items.filter(i => i.completed).length;
                    groupEl.querySelector('.group-progress').textContent = `${newCompleted}/${totalCount}`;
                    
                    updateProgress();
                    saveData();
                });

                itemEl.querySelector('.btn-edit-task').addEventListener('click', () => {
                    openTaskModal(currentModelKey, group.id, item.id);
                });

                itemEl.querySelector('.btn-del-task').addEventListener('click', () => {
                    if (confirm(`確定要刪除待辦事項「${item.task}」？`)) {
                        group.items.splice(itemIndex, 1);
                        renderTodos();
                        updateProgress();
                        saveData();
                    }
                });

                itemsContainer.appendChild(itemEl);
            });

            todoContainer.appendChild(groupEl);
        });
    }

    function updateProgress() {
        if (!currentModelKey || !appData[currentModelKey]) return;
        
        const data = appData[currentModelKey];
        let total = 0;
        let completed = 0;

        (data.todos || []).forEach(group => {
            total += group.items.length;
            completed += group.items.filter(item => item.completed).length;
        });

        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        progressBarFill.style.width = `${percentage}%`;
        kpiProgress.textContent = `${percentage}%`;
    }

    // ── 待辦事項 Modal 彈窗 CRUD ─────────────────────────────────────
    function setupModals() {
        addPhaseBtn.addEventListener('click', () => {
            phaseForm.reset();
            phaseModal.style.display = 'flex';
            phaseFormName.focus();
        });

        modalPhaseClose.addEventListener('click', () => phaseModal.style.display = 'none');
        modalPhaseCancel.addEventListener('click', () => phaseModal.style.display = 'none');

        phaseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phaseName = phaseFormName.value.trim();
            if (!phaseName) return;

            const model = appData[currentModelKey];
            const newPhaseId = `${currentModelKey}-${(model.todos.length || 0) + 1}`;
            model.todos.push({
                id: newPhaseId,
                parent: phaseName,
                items: []
            });

            phaseModal.style.display = 'none';
            renderTodos();
            saveData();
        });

        addTaskBtn.addEventListener('click', () => {
            openTaskModal(currentModelKey);
        });

        modalTaskClose.addEventListener('click', () => taskModal.style.display = 'none');
        modalTaskCancel.addEventListener('click', () => taskModal.style.display = 'none');

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const modelKey = taskEditModel.value;
            const targetPhaseId = taskFormPhase.value;
            const itemId = taskEditItemId.value;

            const taskData = {
                task: taskFormName.value.trim(),
                startDate: taskFormStart.value,
                dueDate: taskFormDue.value,
                owner: taskFormOwner.value.trim() || '負責人',
                notes: taskFormNotes.value.trim()
            };

            const model = appData[modelKey];
            const phase = model.todos.find(p => p.id === targetPhaseId);
            if (!phase) {
                alert('找不到所選的階段群組！');
                return;
            }

            if (itemId) {
                const oldPhaseId = taskEditPhaseId.value;
                if (oldPhaseId === targetPhaseId) {
                    const item = phase.items.find(i => i.id === itemId);
                    if (item) {
                        item.task = taskData.task;
                        item.startDate = taskData.startDate;
                        item.dueDate = taskData.dueDate;
                        item.owner = taskData.owner;
                        item.notes = taskData.notes;
                    }
                } else {
                    const oldPhase = model.todos.find(p => p.id === oldPhaseId);
                    let oldItem = { id: itemId, completed: false };
                    if (oldPhase) {
                        const idx = oldPhase.items.findIndex(i => i.id === itemId);
                        if (idx !== -1) {
                            oldItem = oldPhase.items.splice(idx, 1)[0];
                        }
                    }
                    phase.items.push({
                        ...oldItem,
                        ...taskData
                    });
                }
            } else {
                const newItemId = `${targetPhaseId}-${phase.items.length + 1}`;
                phase.items.push({
                    id: newItemId,
                    task: taskData.task,
                    startDate: taskData.startDate,
                    dueDate: taskData.dueDate,
                    owner: taskData.owner,
                    notes: taskData.notes,
                    completed: false
                });
            }

            taskModal.style.display = 'none';
            renderTodos();
            updateProgress();
            saveData();
        });
    }

    function openTaskModal(modelKey, defaultPhaseId = null, itemId = null) {
        const model = appData[modelKey];
        if (!model || !model.todos || model.todos.length === 0) {
            alert('請先點擊「+ 新增階段」建立任務階段群組！');
            return;
        }

        taskForm.reset();
        taskEditModel.value = modelKey;
        taskEditPhaseId.value = defaultPhaseId || model.todos[0].id;
        taskEditItemId.value = itemId || '';

        taskFormPhase.innerHTML = '';
        model.todos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.parent;
            taskFormPhase.appendChild(opt);
        });

        if (itemId) {
            modalTaskTitle.textContent = '編輯待辦事項';
            let targetItem = null;
            let currentPhase = null;

            for (const p of model.todos) {
                const found = p.items.find(i => i.id === itemId);
                if (found) {
                    targetItem = found;
                    currentPhase = p;
                    break;
                }
            }

            if (targetItem) {
                taskFormPhase.value = currentPhase.id;
                taskEditPhaseId.value = currentPhase.id;
                taskFormName.value = targetItem.task;
                taskFormStart.value = targetItem.startDate;
                taskFormDue.value = targetItem.dueDate;
                taskFormOwner.value = targetItem.owner;
                taskFormNotes.value = targetItem.notes || '';
            }
        } else {
            modalTaskTitle.textContent = '新增待辦事項';
            if (defaultPhaseId) {
                taskFormPhase.value = defaultPhaseId;
            }
            taskFormStart.value = '2026-09-01';
            taskFormDue.value = '2026-09-20';
            taskFormOwner.value = '負責人';
            taskFormNotes.value = '';
        }

        taskModal.style.display = 'flex';
        taskFormName.focus();
    }

    // ── 甘特圖時程 (Gantt Chart Engine - 精緻重構) ─────────────────
    function renderGanttLegendAndFilters() {
        ganttModelPills.innerHTML = '';
        
        const allBtn = document.createElement('button');
        allBtn.className = `gantt-pill ${currentGanttModel === 'all' ? 'active' : ''}`;
        allBtn.textContent = '全部專案';
        allBtn.dataset.model = 'all';
        allBtn.addEventListener('click', () => {
            currentGanttModel = 'all';
            renderGanttChart();
        });
        ganttModelPills.appendChild(allBtn);

        getModelKeys().forEach(key => {
            const pill = document.createElement('button');
            pill.className = `gantt-pill ${currentGanttModel === key ? 'active' : ''}`;
            pill.textContent = appData[key].title;
            pill.dataset.model = key;
            pill.addEventListener('click', () => {
                currentGanttModel = key;
                renderGanttChart();
            });
            ganttModelPills.appendChild(pill);
        });

        // 渲染圖例
        ganttDynamicLegend.innerHTML = '';
        getModelKeys().forEach(key => {
            const meta = getModelMeta(key);
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `<span class="legend-dot ${meta.dotClass}"></span>${meta.name}`;
            ganttDynamicLegend.appendChild(item);
        });
        const todayLegend = document.createElement('div');
        todayLegend.className = 'legend-item';
        todayLegend.innerHTML = `<span class="today-line-legend"></span>今日 (2026/08/23)`;
        ganttDynamicLegend.appendChild(todayLegend);
    }

    function renderGanttChart() {
        renderGanttLegendAndFilters();
        ganttChartWrapper.innerHTML = '';

        let tasks = [];
        const modelKeys = currentGanttModel === 'all' ? getModelKeys() : [currentGanttModel];

        modelKeys.forEach(mKey => {
            const model = appData[mKey];
            if (!model) return;
            (model.todos || []).forEach(group => {
                (group.items || []).forEach(item => {
                    tasks.push({
                        modelKey: mKey,
                        modelTitle: model.title,
                        phase: group.parent,
                        task: item
                    });
                });
            });
        });

        if (tasks.length === 0) {
            ganttChartWrapper.innerHTML = `
                <div style="padding:48px; text-align:center; color:var(--text-muted);">
                    目前沒有可繪製甘特圖的待辦事項。
                </div>
            `;
            return;
        }

        // 時間邊界計算
        let minTime = new Date('2026-08-20').getTime();
        let maxTime = new Date('2027-01-31').getTime();

        tasks.forEach(t => {
            if (t.task.startDate) {
                const s = new Date(t.task.startDate).getTime();
                if (!isNaN(s) && s < minTime) minTime = s;
            }
            if (t.task.dueDate) {
                const d = new Date(t.task.dueDate).getTime();
                if (!isNaN(d) && d > maxTime) maxTime = d;
            }
        });

        const startDateObj = new Date(minTime);
        startDateObj.setDate(1);
        startDateObj.setHours(0,0,0,0);
        const timelineStart = startDateObj.getTime();

        const endDateObj = new Date(maxTime);
        endDateObj.setMonth(endDateObj.getMonth() + 1);
        endDateObj.setDate(0);
        endDateObj.setHours(23,59,59,999);
        const timelineEnd = endDateObj.getTime();

        const totalDuration = timelineEnd - timelineStart;

        const monthColumns = [];
        let curMonth = new Date(timelineStart);
        while (curMonth.getTime() < timelineEnd) {
            const y = curMonth.getFullYear();
            const m = curMonth.getMonth() + 1;
            monthColumns.push(`${y}年${m}月`);
            curMonth.setMonth(curMonth.getMonth() + 1);
        }

        // 今日時間標記線 (基準日期: 2026-08-23)
        const todayTime = new Date('2026-08-23').getTime();
        let todayLeftPercent = ((todayTime - timelineStart) / totalDuration) * 100;
        if (todayLeftPercent < 0) todayLeftPercent = 0;
        if (todayLeftPercent > 100) todayLeftPercent = 100;

        const container = document.createElement('div');
        container.className = 'gantt-table';

        // 1. 表頭 (Header Row - 包含單一優雅 TODAY 膠囊)
        const headerRow = document.createElement('div');
        headerRow.className = 'gantt-row gantt-row-header';

        const taskHeaderCol = document.createElement('div');
        taskHeaderCol.className = 'gantt-col-task';
        taskHeaderCol.textContent = '任務與負責人 (Task & Assignee)';

        const timelineHeaderCol = document.createElement('div');
        timelineHeaderCol.className = 'gantt-col-timeline';
        
        const monthHeaderContainer = document.createElement('div');
        monthHeaderContainer.className = 'gantt-timeline-header';
        monthColumns.forEach(mName => {
            const mCell = document.createElement('div');
            mCell.className = 'gantt-month-cell';
            mCell.textContent = mName;
            monthHeaderContainer.appendChild(mCell);
        });

        // 頂部單一 TODAY 膠囊
        const todayPin = document.createElement('div');
        todayPin.className = 'gantt-header-today-pin';
        todayPin.style.left = `${todayLeftPercent}%`;
        todayPin.textContent = '今日 08/23';
        monthHeaderContainer.appendChild(todayPin);

        timelineHeaderCol.appendChild(monthHeaderContainer);

        headerRow.appendChild(taskHeaderCol);
        headerRow.appendChild(timelineHeaderCol);
        container.appendChild(headerRow);

        // 2. 任務資料列 (Task Rows)
        tasks.forEach(({ modelKey, modelTitle, phase, task }) => {
            const row = document.createElement('div');
            row.className = 'gantt-row';

            const taskCol = document.createElement('div');
            taskCol.className = 'gantt-col-task';

            const meta = getModelMeta(modelKey);

            taskCol.innerHTML = `
                <div class="gantt-task-info">
                    <div class="gantt-task-name" title="${task.task}">
                        ${task.completed ? ICONS.check + ' ' : ''}${task.task}
                    </div>
                    <div class="gantt-task-sub">
                        <span class="badge badge-phase" title="所屬階段：${phase}">${ICONS.folder}${phase}</span>
                        <span class="badge ${meta.badgeClass}">${meta.name}</span>
                        <span class="badge badge-owner">${ICONS.user}${task.owner}</span>
                    </div>
                </div>
            `;

            const timelineCol = document.createElement('div');
            timelineCol.className = 'gantt-col-timeline';

            // 背景網格線
            const gridLines = document.createElement('div');
            gridLines.className = 'gantt-grid-lines';
            monthColumns.forEach(() => {
                const col = document.createElement('div');
                col.className = 'gantt-grid-col';
                gridLines.appendChild(col);
            });
            timelineCol.appendChild(gridLines);

            // 乾淨優雅的 TODAY 導引細虛線
            const todayLine = document.createElement('div');
            todayLine.className = 'gantt-today-guideline';
            todayLine.style.left = `${todayLeftPercent}%`;
            timelineCol.appendChild(todayLine);

            // 計算 Gantt Bar 位置
            const sTime = new Date(task.startDate).getTime();
            const dTime = new Date(task.dueDate).getTime();

            let leftPercent = ((sTime - timelineStart) / totalDuration) * 100;
            let widthPercent = ((dTime - sTime) / totalDuration) * 100;

            if (leftPercent < 0) leftPercent = 0;
            if (widthPercent < 2.5) widthPercent = 2.5;

            const bar = document.createElement('div');
            bar.className = `gantt-bar-container ${meta.barClass} ${task.completed ? 'gantt-bar-completed' : ''}`;
            bar.style.left = `${leftPercent}%`;
            bar.style.width = `${widthPercent}%`;
            const noteText = task.notes && task.notes.trim() ? `\n備註：${task.notes}` : '';
            bar.title = `任務：${task.task}\n專案：${meta.name}\n階段：${phase}\n負責人：${task.owner}\n時程：${task.startDate} ~ ${task.dueDate}\n狀態：${task.completed ? '已完成 (100%)' : '執行中'}${noteText}`;
            
            // 拔除內部文字，維持極簡純淨膠囊長條，已完成則顯示精美向量小打勾
            bar.innerHTML = task.completed ? `<span class="gantt-bar-check">${ICONS.check}</span>` : ``;

            bar.addEventListener('click', () => {
                openTaskModal(modelKey, null, task.id);
            });

            timelineCol.appendChild(bar);

            row.appendChild(taskCol);
            row.appendChild(timelineCol);
            container.appendChild(row);
        });

        ganttChartWrapper.appendChild(container);
    }

    // ── 雲端同步與備份邏輯 ──────────────────────────────────────────
    async function saveData(isManualTrigger = false) {
        // 1. Firebase 雲端即時同步
        if (dbDataRef) {
            isLocalUpdate = true;
            updateSyncStatus('saving', '☁️ 雲端同步中...');

            dbDataRef.set(appData).then(() => {
                updateSyncStatus('online', '🟢 已即時同步至雲端');
            }).catch((err) => {
                console.error("Firebase 寫入失敗:", err);
                isLocalUpdate = false;
                updateSyncStatus('error', '🔴 雲端儲存受限 (請確認權限)');
            });
        }

        // 2. 如果使用者手動點擊頂部按鈕，提供本機下載/備份
        if (isManualTrigger) {
            if (confirm('是否要將目前的專案資料下載備份為本機 data.js 檔案？')) {
                fallbackDownload();
            }
        }
    }

    function fallbackDownload() {
        savingStatus.textContent = '下載檔案中...';
        const dataString = JSON.stringify(appData, null, 4);
        const jsContent = `const dashboardData = ${dataString};\n\n// 讓瀏覽器可以直接載入這個檔案並將資料掛在 window 物件下\nwindow.dashboardData = dashboardData;\n`;
        
        const blob = new Blob([jsContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        savingStatus.textContent = '已觸發下載';
    }

    savingStatus.addEventListener('click', () => saveData(true));

    init();
});
