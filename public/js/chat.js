const socket = io();

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

let adminId = null;
let selectedTenantId = null;

// Fetch admin ID
async function fetchAdminId() {
    try {
        const res = await fetch('/api/admin');
        if (!res.ok) throw new Error('Failed to fetch admin');
        const admin = await res.json();
        adminId = admin._id;
        return adminId;
    } catch (err) {
        console.error("Error fetching admin ID:", err);
        return null;
    }
}

// Load tenants into dropdown
async function loadTenants() {
    try {
        const res = await fetch("/api/tenants");
        const tenants = await res.json();
        const userSelect = document.getElementById("userSelect");
        tenants.forEach(t => {
            const option = document.createElement("option");
            option.value = t._id;
            option.textContent = `${t.name} (${t.email})`;
            userSelect.appendChild(option);
        });

        // Listen for tenant selection to load chat history
        userSelect.addEventListener("change", () => {
            selectedTenantId = userSelect.value;
            loadHistory(selectedTenantId);
        });

    } catch (err) {
        console.error("Error loading tenants:", err);
    }
}

// Render messages
function renderSingleMessage(message, direction) {
    const messagesContainer = document.getElementById('chatMessages');
    const now = new Date(message.timestamp || Date.now());

    const div = document.createElement("div");
    div.className = `message ${direction}`;

    // Only show tenant name for tenant messages
    const senderLabel = message.senderType === "tenant" ? `<strong>${escapeHtml(message.senderName || "Tenant")}:</strong>` : "";

    div.innerHTML = `
        ${senderLabel}
        <p>${escapeHtml(message.message)}</p>
        <span class="message-time">${formatTime(now)}</span>
    `;

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !selectedTenantId) {
        alert("Please select a tenant and type a message.");
        return;
    }

    if (!adminId) {
        alert("Admin ID not loaded. Please refresh the page.");
        return;
    }

    socket.emit("sendMessage", {
        senderId: adminId,
        senderType: "admin",
        receiverId: selectedTenantId,
        receiverType: "tenant",
        message
    });

    input.value = "";
}

// Load chat history
async function loadHistory(tenantId) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = ""; // clear old messages

    if (!tenantId) return;

    try {
        const res = await fetch(`/api/messages/${tenantId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const messages = await res.json();
        messages.forEach(msg => {
            const direction = msg.senderType === "admin" ? "sent" : "received";
            renderSingleMessage(msg, direction);
        });
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

// Socket events
socket.on("connect", () => {
    if (adminId) {
        socket.emit("registerUser", adminId);
    }
});


socket.on("receiveMessage", (message) => {
    if (selectedTenantId && (message.senderId === selectedTenantId || message.receiverId === selectedTenantId)) {
        const direction = message.senderType === "admin" ? "sent" : "received";
        renderSingleMessage(message, direction);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadTenants();
    adminId = await fetchAdminId(); // ensure adminId is set

    if (adminId) {
        socket.emit("registerUser", adminId); // <-- register now
    }

    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});
