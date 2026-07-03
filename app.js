// JSONBin.io 設定
const JSONBIN_API_KEY = '$2a$10$fuyJjSPztFHlaKC4O/yQJ.wi1F1JwubQoqjmtOOPg1HiUHTClV9dS';
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = '6a46ffd8f5f4af5e29570be7'; // 空にしておく（テストイベント作成後にBIN IDを設定）→済

// フォルダ識別子（コピー時に変更してください）
// 例: 'work', 'private', 'family' など
const FOLDER_ID = 'work'; // 職場用

// LocalStorage キー（フォルダごとに分離）
const STORAGE_KEY = `event_scheduler_data_${FOLDER_ID}`;
const ADMIN_PASSWORD = 'open';

// 状態管理
let currentView = 'list'; // 'list', 'create', 'detail', 'admin', 'edit'
let currentEventId = null;
let events = [];
let isAdminAuthenticated = false;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 初期表示の確実な設定
    initializeView();
    initEventListeners();
    loadEvents();
});

// 初期表示の設定
function initializeView() {
    // イベント一覧のみ表示
    hideAllSections();
    const section = document.getElementById('event-list-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    document.getElementById('password-modal').classList.add('hidden');
}

// イベントリスナーの初期化
function initEventListeners() {
    document.getElementById('create-event-btn').addEventListener('click', showCreateEventForm);
    document.getElementById('cancel-create-btn').addEventListener('click', showEventList);
    document.getElementById('back-to-list-btn').addEventListener('click', showEventList);
    document.getElementById('add-date-btn').addEventListener('click', addDateCandidate);
    document.getElementById('create-event-form').addEventListener('submit', handleCreateEvent);
    document.getElementById('response-form').addEventListener('submit', handleSubmitResponse);

    // 管理画面関連
    document.getElementById('admin-btn').addEventListener('click', showPasswordModal);
    document.getElementById('password-form').addEventListener('submit', handlePasswordSubmit);
    document.getElementById('cancel-password-btn').addEventListener('click', hidePasswordModal);
    document.getElementById('back-to-list-from-admin-btn').addEventListener('click', showEventList);

    // 編集関連
    document.getElementById('edit-add-date-btn').addEventListener('click', addEditDateCandidate);
    document.getElementById('edit-event-form').addEventListener('submit', handleEditEvent);
    document.getElementById('cancel-edit-btn').addEventListener('click', showAdminPage);
}

// イベント一覧の表示
function showEventList() {
    hideAllSections();
    const section = document.getElementById('event-list-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    currentView = 'list';
    loadEvents();
}

// 全セクションを非表示
function hideAllSections() {
    const sections = [
        'event-list-section',
        'create-event-section',
        'event-detail-section',
        'admin-section',
        'edit-event-section'
    ];
    sections.forEach(id => {
        const section = document.getElementById(id);
        section.style.display = 'none';
        section.classList.add('hidden');
    });
}

// イベント作成フォームの表示
function showCreateEventForm() {
    hideAllSections();
    const section = document.getElementById('create-event-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    currentView = 'create';

    // フォームのリセット
    document.getElementById('create-event-form').reset();
    const dateCandidates = document.getElementById('date-candidates');
    dateCandidates.innerHTML = `
        <div class="date-candidate">
            <input type="datetime-local" required>
            <button type="button" class="btn-remove" onclick="removeDateCandidate(this)">削除</button>
        </div>
    `;
}

// イベント詳細の表示
function showEventDetail(eventId) {
    hideAllSections();
    const section = document.getElementById('event-detail-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    currentView = 'detail';
    currentEventId = eventId;
    loadEventDetail(eventId);
}

// 日程候補の追加
function addDateCandidate() {
    const container = document.getElementById('date-candidates');
    const newCandidate = document.createElement('div');
    newCandidate.className = 'date-candidate';
    newCandidate.innerHTML = `
        <input type="datetime-local" required>
        <button type="button" class="btn-remove" onclick="removeDateCandidate(this)">削除</button>
    `;
    container.appendChild(newCandidate);
}

// 日程候補の削除
function removeDateCandidate(button) {
    const container = document.getElementById('date-candidates');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        showMessage('最低1つの日程候補が必要です', 'error');
    }
}

// イベント一覧の読み込み
async function loadEvents() {
    showLoading(true);
    try {
        // JSONBin.ioから読み込み
        const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        if (response.ok) {
            const data = await response.json();
            events = data.record.events || [];
        } else {
            // エラー時はローカルストレージから読み込み
            const localData = localStorage.getItem(STORAGE_KEY);
            events = localData ? JSON.parse(localData) : [];
        }

        renderEventList();
    } catch (error) {
        console.error('Error loading events:', error);
        // エラー時はローカルストレージから読み込み
        const localData = localStorage.getItem(STORAGE_KEY);
        events = localData ? JSON.parse(localData) : [];
        renderEventList();
    } finally {
        showLoading(false);
    }
}

// データの保存
async function saveEvents() {
    try {
        // ローカルストレージにもバックアップ
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

        let response;

        if (!JSONBIN_BIN_ID) {
            // BIN IDが空の場合は新規作成
            response = await fetch(JSONBIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                    'X-Bin-Name': `event-scheduler-${FOLDER_ID}`
                },
                body: JSON.stringify({ events: events })
            });

            if (response.ok) {
                const data = await response.json();
                const newBinId = data.metadata.id;
                console.log('='.repeat(60));
                console.log('新しいBINが作成されました！');
                console.log('BIN ID:', newBinId);
                console.log('='.repeat(60));
                console.log('');
                console.log('次の手順:');
                console.log('1. app.js を開く');
                console.log('2. 4行目の JSONBIN_BIN_ID を以下に変更:');
                console.log(`   const JSONBIN_BIN_ID = '${newBinId}';`);
                console.log('3. ファイルを保存');
                console.log('='.repeat(60));
            }
        } else {
            // JSONBin.ioに保存（既存のBINを更新）
            response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({ events: events })
            });
        }

        return response.ok;
    } catch (error) {
        console.error('Error saving events:', error);
        showMessage('データの保存に失敗しました', 'error');
        return false;
    }
}

// イベント一覧の描画
function renderEventList() {
    const listContainer = document.getElementById('event-list');

    if (events.length === 0) {
        listContainer.innerHTML = '<p style="color: #999; text-align: center;">イベントがありません。新規作成してください。</p>';
        return;
    }

    listContainer.innerHTML = events.map(event => `
        <div class="event-card" onclick="showEventDetail('${event.id}')">
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.description || '説明なし')}</p>
            <p class="event-date">候補日程: ${event.dateCandidates.length}件</p>
            <p class="event-date">回答: ${event.responses ? event.responses.length : 0}件</p>
        </div>
    `).join('');
}

// イベントの作成
async function handleCreateEvent(e) {
    e.preventDefault();

    const title = document.getElementById('event-title').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const dateCandidates = Array.from(document.querySelectorAll('#date-candidates input'))
        .map(input => input.value)
        .filter(date => date);

    if (dateCandidates.length === 0) {
        showMessage('最低1つの日程候補を入力してください', 'error');
        return;
    }

    showLoading(true);
    try {
        const eventId = generateId();
        const event = {
            id: eventId,
            title: title,
            description: description,
            dateCandidates: dateCandidates,
            responses: [],
            createdAt: new Date().toISOString()
        };

        events.push(event);

        if (await saveEvents()) {
            showMessage('イベントを作成しました', 'success');
            showEventList();
        } else {
            showMessage('イベントの作成に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showMessage('イベント作成中にエラーが発生しました', 'error');
    } finally {
        showLoading(false);
    }
}

// イベント詳細の読み込み
function loadEventDetail(eventId) {
    showLoading(true);
    try {
        const event = events.find(e => e.id === eventId);

        if (event) {
            renderEventDetail(event);
        } else {
            showMessage('イベントが見つかりません', 'error');
            showEventList();
        }
    } catch (error) {
        console.error('Error loading event detail:', error);
        showMessage('イベント詳細の読み込み中にエラーが発生しました', 'error');
    } finally {
        showLoading(false);
    }
}

// イベント詳細の描画
function renderEventDetail(event) {
    const detailContainer = document.getElementById('event-detail');
    detailContainer.innerHTML = `
        <div class="event-info">
            <h2>${escapeHtml(event.title)}</h2>
            <p>${escapeHtml(event.description || '説明なし')}</p>
            <h3>日程候補</h3>
            <ul class="date-candidates-list">
                ${event.dateCandidates.map((date, index) => `
                    <li>${formatDateTime(date)}</li>
                `).join('')}
            </ul>
        </div>
    `;

    // 出欠回答フォームの生成
    const availabilityOptions = document.getElementById('availability-options');
    availabilityOptions.innerHTML = event.dateCandidates.map((date, index) => `
        <div class="availability-option">
            <label>${formatDateTime(date)}</label>
            <div class="radio-group">
                <label>
                    <input type="radio" name="date-${index}" value="available" required>
                    参加可能
                </label>
                <label>
                    <input type="radio" name="date-${index}" value="maybe">
                    未定
                </label>
                <label>
                    <input type="radio" name="date-${index}" value="unavailable">
                    不可
                </label>
            </div>
        </div>
    `).join('');

    // 回答状況の表示
    renderResponsesSummary(event);
}

// 回答状況の描画
function renderResponsesSummary(event) {
    const summaryContainer = document.getElementById('responses-summary');

    if (!event.responses || event.responses.length === 0) {
        summaryContainer.innerHTML = '<p style="color: #999;">まだ回答がありません。</p>';
        return;
    }

    // テーブルヘッダー
    let tableHTML = '<div class="responses-table"><table><thead><tr><th>参加者</th>';
    event.dateCandidates.forEach((date, index) => {
        tableHTML += `<th>日程${index + 1}</th>`;
    });
    tableHTML += '<th>コメント</th></tr></thead><tbody>';

    // 各回答の行
    event.responses.forEach(response => {
        tableHTML += `<tr><td>${escapeHtml(response.name)}</td>`;
        response.availability.forEach(status => {
            let statusClass = '';
            let statusText = '';
            if (status === 'available') {
                statusClass = 'status-available';
                statusText = '○';
            } else if (status === 'unavailable') {
                statusClass = 'status-unavailable';
                statusText = '×';
            } else {
                statusClass = 'status-maybe';
                statusText = '△';
            }
            tableHTML += `<td class="${statusClass}">${statusText}</td>`;
        });
        tableHTML += `<td>${response.comment ? `<div class="response-comment">${escapeHtml(response.comment)}</div>` : '-'}</td>`;
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table></div>';

    // 日程別の集計
    tableHTML += '<h4 style="margin-top: 20px;">日程別集計</h4><div class="responses-table"><table><thead><tr><th>日程</th><th>○</th><th>△</th><th>×</th></tr></thead><tbody>';

    event.dateCandidates.forEach((date, index) => {
        let available = 0;
        let maybe = 0;
        let unavailable = 0;

        event.responses.forEach(response => {
            const status = response.availability[index];
            if (status === 'available') available++;
            else if (status === 'maybe') maybe++;
            else if (status === 'unavailable') unavailable++;
        });

        tableHTML += `
            <tr>
                <td>${formatDateTime(date)}</td>
                <td class="status-available">${available}</td>
                <td class="status-maybe">${maybe}</td>
                <td class="status-unavailable">${unavailable}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table></div>';

    summaryContainer.innerHTML = tableHTML;
}

// 回答の送信
async function handleSubmitResponse(e) {
    e.preventDefault();

    const name = document.getElementById('participant-name').value.trim();
    const comment = document.getElementById('participant-comment').value.trim();

    // 各日程の回答を収集
    const availability = [];
    const event = events.find(e => e.id === currentEventId);

    if (!event) {
        showMessage('イベントが見つかりません', 'error');
        return;
    }

    for (let i = 0; i < event.dateCandidates.length; i++) {
        const selected = document.querySelector(`input[name="date-${i}"]:checked`);
        if (!selected) {
            showMessage('すべての日程について回答してください', 'error');
            return;
        }
        availability.push(selected.value);
    }

    showLoading(true);
    try {
        const response = {
            id: generateId(),
            name: name,
            availability: availability,
            comment: comment,
            submittedAt: new Date().toISOString()
        };

        event.responses.push(response);

        if (await saveEvents()) {
            showMessage('回答を送信しました', 'success');
            document.getElementById('response-form').reset();
            loadEventDetail(currentEventId);
        } else {
            showMessage('回答の送信に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error submitting response:', error);
        showMessage('回答送信中にエラーが発生しました', 'error');
    } finally {
        showLoading(false);
    }
}

// ユニークIDの生成
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ユーティリティ関数
function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');

    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${year}年${month}月${day}日(${weekday}) ${hours}:${minutes}`;
}

// ==================== 管理機能 ====================

// パスワードモーダルの表示
function showPasswordModal() {
    document.getElementById('password-modal').classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password').focus();
}

// パスワードモーダルを閉じる
function hidePasswordModal() {
    document.getElementById('password-modal').classList.add('hidden');
}

// パスワード認証
function handlePasswordSubmit(e) {
    e.preventDefault();

    const password = document.getElementById('admin-password').value;

    if (password === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        hidePasswordModal();
        showAdminPage();
    } else {
        showMessage('パスワードが正しくありません', 'error');
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

// 管理ページの表示
function showAdminPage() {
    if (!isAdminAuthenticated) {
        showPasswordModal();
        return;
    }

    hideAllSections();
    const section = document.getElementById('admin-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    currentView = 'admin';

    renderAdminEventList();
}

// 管理画面のイベント一覧を描画
function renderAdminEventList() {
    const listContainer = document.getElementById('admin-event-list');

    if (events.length === 0) {
        listContainer.innerHTML = '<p style="color: #999; text-align: center;">イベントがありません。</p>';
        return;
    }

    listContainer.innerHTML = events.map(event => `
        <div class="admin-event-card">
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.description || '説明なし')}</p>
            <p>候補日程: ${event.dateCandidates.length}件</p>
            <p>回答: ${event.responses ? event.responses.length : 0}件</p>
            <p style="font-size: 0.9em; color: #999;">作成日時: ${formatDateTime(event.createdAt)}</p>
            <div class="admin-event-actions">
                <button class="btn btn-edit" onclick="showEditEventForm('${event.id}')">編集</button>
                <button class="btn btn-delete" onclick="confirmDeleteEvent('${event.id}')">削除</button>
            </div>
        </div>
    `).join('');
}

// イベント編集フォームの表示
function showEditEventForm(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showMessage('イベントが見つかりません', 'error');
        return;
    }

    hideAllSections();
    const section = document.getElementById('edit-event-section');
    section.classList.remove('hidden');
    section.style.display = 'block';
    currentView = 'edit';
    currentEventId = eventId;

    // フォームに既存データを設定
    document.getElementById('edit-event-id').value = event.id;
    document.getElementById('edit-event-title').value = event.title;
    document.getElementById('edit-event-description').value = event.description || '';

    // 日程候補を設定
    const dateCandidatesContainer = document.getElementById('edit-date-candidates');
    dateCandidatesContainer.innerHTML = event.dateCandidates.map(date => `
        <div class="date-candidate">
            <input type="datetime-local" value="${date}" required>
            <button type="button" class="btn-remove" onclick="removeEditDateCandidate(this)">削除</button>
        </div>
    `).join('');
}

// 編集フォームの日程候補を追加
function addEditDateCandidate() {
    const container = document.getElementById('edit-date-candidates');
    const newCandidate = document.createElement('div');
    newCandidate.className = 'date-candidate';
    newCandidate.innerHTML = `
        <input type="datetime-local" required>
        <button type="button" class="btn-remove" onclick="removeEditDateCandidate(this)">削除</button>
    `;
    container.appendChild(newCandidate);
}

// 編集フォームの日程候補を削除
function removeEditDateCandidate(button) {
    const container = document.getElementById('edit-date-candidates');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        showMessage('最低1つの日程候補が必要です', 'error');
    }
}

// イベントの更新
async function handleEditEvent(e) {
    e.preventDefault();

    const eventId = document.getElementById('edit-event-id').value;
    const title = document.getElementById('edit-event-title').value.trim();
    const description = document.getElementById('edit-event-description').value.trim();
    const dateCandidates = Array.from(document.querySelectorAll('#edit-date-candidates input'))
        .map(input => input.value)
        .filter(date => date);

    if (dateCandidates.length === 0) {
        showMessage('最低1つの日程候補を入力してください', 'error');
        return;
    }

    showLoading(true);
    try {
        const eventIndex = events.findIndex(e => e.id === eventId);

        if (eventIndex === -1) {
            showMessage('イベントが見つかりません', 'error');
            return;
        }

        // イベントを更新(responsesは保持)
        events[eventIndex] = {
            ...events[eventIndex],
            title: title,
            description: description,
            dateCandidates: dateCandidates,
            updatedAt: new Date().toISOString()
        };

        if (await saveEvents()) {
            showMessage('イベントを更新しました', 'success');
            showAdminPage();
        } else {
            showMessage('イベントの更新に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        showMessage('イベント更新中にエラーが発生しました', 'error');
    } finally {
        showLoading(false);
    }
}

// イベント削除の確認
function confirmDeleteEvent(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showMessage('イベントが見つかりません', 'error');
        return;
    }

    const confirmed = confirm(`「${event.title}」を削除してもよろしいですか?\n\n※この操作は取り消せません。回答データもすべて削除されます。`);

    if (confirmed) {
        deleteEvent(eventId);
    }
}

// イベントの削除
async function deleteEvent(eventId) {
    showLoading(true);
    try {
        const eventIndex = events.findIndex(e => e.id === eventId);

        if (eventIndex === -1) {
            showMessage('イベントが見つかりません', 'error');
            return;
        }

        events.splice(eventIndex, 1);

        if (await saveEvents()) {
            showMessage('イベントを削除しました', 'success');
            renderAdminEventList();
        } else {
            showMessage('イベントの削除に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('イベント削除中にエラーが発生しました', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== グローバルスコープに関数を公開 ====================
// HTMLのonclick属性で使用する関数をグローバルに公開
window.removeDateCandidate = removeDateCandidate;
window.removeEditDateCandidate = removeEditDateCandidate;
window.showEventDetail = showEventDetail;
window.showEditEventForm = showEditEventForm;
window.confirmDeleteEvent = confirmDeleteEvent;
