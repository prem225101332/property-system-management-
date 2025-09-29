const socket = io();

// --- Helpers ---
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

let adminId = null; // Add this variable

// Fetch admin ID
async function fetchAdminId() {
    try {
        const res = await fetch('/api/admin');
        if (!res.ok) throw new Error('Failed to fetch admin');
        const admin = await res.json();
        adminId = admin._id;
        localStorage.setItem('adminId', adminId); // Store admin ID
        return adminId;
    } catch (err) {
        console.error("Error fetching admin ID:", err);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await loadTenants();
    await fetchAdminId(); // Wait for admin ID

    // Register admin with actual MongoDB ID
    if (adminId) {
        socket.emit("registerUser", adminId);
        console.log("Admin registered with ID:", adminId);
    }

    socket.on("receiveMessage", (message) => {
        renderSingleMessage(message, message.senderType === "admin" ? "sent" : "received");
    });    

    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});

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
    } catch (err) {
        console.error("Error loading tenants:", err);
    }
}

function renderSingleMessage(message, direction) {
    const messagesContainer = document.getElementById('chatMessages');
    const now = new Date(message.timestamp || Date.now());

    const div = document.createElement("div");
    div.className = `message ${direction}`;
    div.innerHTML = `
        <p>${escapeHtml(message.message)}</p>
        <span class="message-time">${formatTime(now)}</span>
    `;

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const userSelect = document.getElementById('userSelect');
    const message = input.value.trim();
    const selectedUserId = userSelect.value;

    // Use the fetched adminId instead of localStorage
    if (!message || !selectedUserId) {
        alert("Please select a tenant and type a message.");
        return;
    }

    if (!adminId) {
        alert("Admin ID not loaded. Please refresh the page.");
        return;
    }

    console.log("Sending message from admin:", adminId, "to tenant:", selectedUserId);

    socket.emit("sendMessage", {
        senderId: adminId, // Use the fetched adminId
        senderType: "admin",
        receiverId: selectedUserId,
        receiverType: "tenant",
        message: message
    });

    input.value = "";
}