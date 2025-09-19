// let socket;

// document.getElementById("connectBtn").addEventListener("click", () => {
//   const userId = document.getElementById("userId").value.trim();
//   if (!userId) return alert("Please enter a user ID");

//   // Change ws://localhost:3000 → wss://your-app.onrender.com in production
//   socket = new WebSocket("ws://localhost:3000");

//   socket.onopen = () => {
//     console.log("✅ Connected");
//     document.getElementById("login-section").style.display = "none";
//     document.getElementById("chat-section").style.display = "flex";

//     socket.send(JSON.stringify({ type: "join", userId }));
//   };

//   socket.onmessage = (event) => {
//     const data = JSON.parse(event.data);

//     if (data.type === "users") {
//       updateUserList(data.users);
//     }

//     if (data.type === "message") {
//       displayMessage(data.userId, data.message);
//     }
//   };

//   socket.onclose = () => console.log("❌ Disconnected");
// });

// // Send message
// document.getElementById("sendBtn").addEventListener("click", () => {
//   const messageInput = document.getElementById("messageInput");
//   const message = messageInput.value.trim();
//   if (!message) return;

//   socket.send(JSON.stringify({ type: "message", message }));
//   messageInput.value = "";
// });

// function updateUserList(users) {
//   const userList = document.getElementById("userList");
//   userList.innerHTML = "";
//   users.forEach((user) => {
//     const li = document.createElement("li");
//     li.textContent = user;
//     userList.appendChild(li);
//   });
// }

// function displayMessage(userId, message) {
//   const messages = document.getElementById("messages");
//   const div = document.createElement("div");

//   // Style based on who sent it
//   if (userId === socket.userId) {
//     div.className = "message self";
//   } else {
//     div.className = "message other";
//   }

//   div.innerHTML = `<strong>${userId}</strong>: ${message}`;
//   messages.appendChild(div);

//   // Auto-scroll to bottom
//   messages.scrollTop = messages.scrollHeight;
// }

// socket.onopen = () => {
//   console.log("✅ Connected");
//   document.getElementById("login-section").style.display = "none";
//   document.getElementById("chat-section").style.display = "flex";

//   socket.userId = userId; // <-- Save own ID
//   socket.send(JSON.stringify({ type: "join", userId }));
// };

// client.js
let socket;
let currentUser = null;

const connectBtn = document.getElementById("connectBtn");
const userIdInput = document.getElementById("userId");
const loginSection = document.getElementById("login-section");
const chatSection = document.getElementById("chat-section");
const userList = document.getElementById("userList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Connect to WebSocket server
connectBtn.addEventListener("click", () => {
  const userId = userIdInput.value.trim();
  if (!userId) {
    alert("Please enter a user ID");
    return;
  }

  // Use deployed server URL on Render (replace localhost for production!)
  socket = new WebSocket("https://chat-app-cves.onrender.com");

  socket.onopen = () => {
    console.log("✅ Connected to WebSocket server");
    socket.send(JSON.stringify({ type: "connect", id: userId }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 Message from server:", data);

    switch (data.type) {
      case "info":
        console.log("ℹ️", data.message);
        break;

      case "connected":
        currentUser = data.id;
        loginSection.style.display = "none";
        chatSection.style.display = "flex";
        break;

      case "userData":
        renderUserList(data.payload);
        break;

      case "chat":
        renderMessage(data.from, data.text, data.timestamp);
        break;

      case "error":
        alert(data.message);
        break;

      default:
        console.log("⚠️ Unknown message type:", data);
    }
  };

  socket.onclose = () => {
    console.log("❌ Disconnected from server");
  };
});

// Send chat message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  socket.send(JSON.stringify({ type: "chat", from: currentUser, text }));
  messageInput.value = "";
});

// Render user list
function renderUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = `${user.name} (${user.id}) ${user.isOnline ? "🟢" : "⚪"}`;
    if (user.id === currentUser) li.style.fontWeight = "bold";
    userList.appendChild(li);
  });
}

// Render chat messages
// function renderMessage(from, text, timestamp) {
//   const msgDiv = document.createElement("div");
//   msgDiv.classList.add("message");

//   const time = new Date(timestamp).toLocaleTimeString();
//   msgDiv.innerHTML = `<strong>${from}:</strong> ${text} <span style="font-size:0.8em;color:gray">(${time})</span>`;

//   messagesDiv.appendChild(msgDiv);
//   messagesDiv.scrollTop = messagesDiv.scrollHeight; // auto scroll
// }
function renderMessage(from, text, timestamp) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  if (from === currentUser) {
    msgDiv.classList.add("self");
  } else {
    msgDiv.classList.add("other");
  }

  const time = new Date(timestamp).toLocaleTimeString();
  msgDiv.innerHTML = `<strong>${from}</strong> ${text} <br><span>${time}</span>`;

  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // auto scroll
}
