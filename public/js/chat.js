document.addEventListener('DOMContentLoaded', function () {
    loadTenants();
    loadMessages();

    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});

async function loadTenants() {
    try {
        const res = await fetch('/api/tenants');
        if (!res.ok) throw new Error('Failed to fetch tenants');
        const tenants = await res.json();

        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '<option value="" disabled selected>Select User</option>';

        tenants.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t._id; // Tenant ID
            opt.textContent = `${t.name} (${t.email})`;
            userSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('Error loading tenants:', err);
        alert('Failed to load tenants.');
    }
}

async function loadMessages() {
    try {
        const messages = await api('/api/messages');
        renderMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
    }
}

function renderMessages(messages) {
    const messagesContainer = document.getElementById('chatMessages');

    if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
        return;
    }

    messagesContainer.innerHTML = messages
        .map(
            (msg) => `
        <div class="message ${msg.direction}">
            <p>${escapeHtml(msg.content)}</p>
            <span class="message-time">${formatTime(msg.timestamp)}</span>
        </div>`
        )
        .join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const userSelect = document.getElementById('userSelect');
    const message = input.value.trim();
    const selectedUserId = userSelect.value;

    if (!message || !selectedUserId) {
        alert('Please select a user and type a message before sending.');
        return;
    }

    try {
        const messagesContainer = document.getElementById('chatMessages');
        const now = new Date();

        // Immediately add message to UI for responsiveness
        messagesContainer.innerHTML += `
            <div class="message sent">
                <p>To ${escapeHtml(userSelect.options[userSelect.selectedIndex].text)}: ${escapeHtml(message)}</p>
                <span class="message-time">${formatTime(now)}</span>
            </div>
        `;

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Clear input
        input.value = '';

        // Send to server with recipient
        await api('/api/messages', 'POST', { content: message, recipient: selectedUserId });

        // Optionally reload messages from server to ensure sync
        await loadMessages();
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message: ' + error.message);
    }
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Simple HTML escaping for safety
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Wrapper for API calls
async function api(endpoint, method = 'GET', data) {
    const options = { method };
    if (data) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
    }
    const res = await fetch(endpoint, options);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'API error');
    }
    return res.json();
}
