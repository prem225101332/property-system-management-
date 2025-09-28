const socket = io(); // connect to server

// --- Helpers ---
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

document.addEventListener('DOMContentLoaded', function () {
    // loadTenants();

    // Register admin as "admin" user
    socket.emit("registerUser", "admin");

    socket.on("receiveMessage", (message) => {
        renderSingleMessage(message, message.senderType === "admin" ? "sent" : "received");
    });    

    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});

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

// async function loadMessagesForTenant(tenantId) {
//     const res = await fetch(`/api/messages/${tenantId}`);
//     const messages = await res.json();
//     renderMessages(messages); // you already have renderMessages()
// }

// document.querySelectorAll(".tenant-list-item").forEach(item => {
//     item.addEventListener("click", () => {
//       const tenantId = item.dataset.tenantId;
//       loadMessagesForTenant(tenantId);
//     });
// });
  
// async function loadTenants() {
//     try {
//         const res = await fetch("/api/tenants");
//         const tenants = await res.json();
//         const userSelect = document.getElementById("userSelect");

//         tenants.forEach(t => {
//             const option = document.createElement("option");
//             option.value = t._id;
//             option.textContent = `${t.name} (${t.email})`;
//             userSelect.appendChild(option);
//         });
//     } catch (err) {
//         console.error("Error loading tenants:", err);
//     }
// }

function sendMessage() {
    const input = document.getElementById('messageInput');
    //const userSelect = document.getElementById('userSelect');
    const message = input.value.trim();
    //const selectedUserId = userSelect.value;

    if (!message) return;

    // For now, just target a fixed tenantId (replace with real tenant._id you want to test with)
    const tenantId = "68d626fe2bb5f9794fd92b15"; 

   // if (!message || !selectedUserId) return;

    socket.emit("sendMessage", {
        senderId: "admin",
        senderType: "admin",
        receiverId: tenantId,
        receiverType: "tenant",
        message
      });      

    input.value = "";
}
