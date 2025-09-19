// // Import ws package
// const WebSocket = require("ws");

// // Dummy user data
// const users = [
//   { id: "user_101", name: "Alice Johnson", age: 25, isOnline: false },
//   { id: "user_202", name: "Bob Smith", age: 30, isOnline: false },
//   { id: "user_303", name: "Charlie Brown", age: 28, isOnline: false },
//   { id: "user_404", name: "Diana Prince", age: 27, isOnline: false },
// ];

// // Create WebSocket server on port 3000
// const socket = (server) => {
//   const wss = new WebSocket.Server({ server });

//   // Store online clients in a Set
//   const onlineClients = new Set();

//   // Helper function to broadcast to all clients
//   const broadcast = (data) => {
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(data));
//       }
//     });
//   };

//   wss.on("connection", (ws) => {
//     console.log("New client connected ✅");

//     ws.send("Welcome to WebSocket server! Please send your id.");

//     // Listen for messages from client
//     ws.on("message", (message) => {
//       const msg = message.toString();
//       console.log("Received:", msg);

//       try {
//         const data = JSON.parse(msg);

//         if (data.type === "connect" && data.id) {
//           // Check if this id exists in our dummy array
//           const userData = users.find((u) => u.id === data.id);

//           if (userData) {
//             // Save client id
//             ws.id = data.id;
//             onlineClients.add(ws.id);
//             console.log(`Client registered: ${ws.id}`);
//             console.log("Online clients:", [...onlineClients]);

//             // Update user status
//             userData.isOnline = true;

//             // Confirm registration to this user
//             ws.send(`You are registered as: ${ws.id}`);

//             // 🔥 Broadcast updated user list to everyone
//             broadcast({
//               type: "userData",
//               payload: users,
//             });
//           } else {
//             ws.send(
//               JSON.stringify({
//                 type: "userData",
//                 payload: null,
//                 message: "No matching user found.",
//               })
//             );
//           }
//         } else if (data.type === "check" && data.id) {
//           // Check if the id is online
//           const isOnline = onlineClients.has(data.id);
//           ws.send(`Is ${data.id} online? ${isOnline}`);
//         }
//       } catch (err) {
//         console.error("Invalid message:", msg);
//         ws.send(
//           "Error: Please send JSON like {\"type\":\"connect\",\"id\":\"user_101\"}"
//         );
//       }
//     });

//     // Handle client disconnect
//     ws.on("close", () => {
//       if (ws.id) {
//         onlineClients.delete(ws.id);
//         console.log(`Client disconnected ❌ ${ws.id}`);

//         // Update dummy array
//         users.forEach((u) => {
//           if (u.id === ws.id) u.isOnline = false;
//         });

//         console.log("Online clients:", [...onlineClients]);

//         // 🔥 Broadcast updated list after disconnect
//         broadcast({
//           type: "userData",
//           payload: users,
//         });
//       }
//     });
//   });

//   console.log("WebSocket server running on ws://localhost:3000");
// };

// module.exports = socket;


// Import ws package
const WebSocket = require("ws");

// Dummy user data
const users = [
  { id: "user_101", name: "Alice Johnson", age: 25, isOnline: false },
  { id: "user_202", name: "Bob Smith", age: 30, isOnline: false },
  { id: "user_303", name: "Charlie Brown", age: 28, isOnline: false },
  { id: "user_404", name: "Diana Prince", age: 27, isOnline: false },
];

// Create WebSocket server on port 3000
const socket = (server) => {
  const wss = new WebSocket.Server({ server });

  // Store online clients in a Set
  const onlineClients = new Set();

  // Helper function to broadcast to all clients
  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on("connection", (ws) => {
    console.log("New client connected ✅");

    ws.send("Welcome to WebSocket server! Please send your id.");

    // Listen for messages from client
    ws.on("message", (message) => {
      const msg = message.toString();
      console.log("Received:", msg);

      try {
        const data = JSON.parse(msg);

        if (data.type === "connect" && data.id) {
          // Check if this id exists in our dummy array
          const userData = users.find((u) => u.id === data.id);

          if (userData) {
            // Save client id
            ws.id = data.id;
            onlineClients.add(ws.id);
            console.log(`Client registered: ${ws.id}`);
            console.log("Online clients:", [...onlineClients]);

            // Update user status
            userData.isOnline = true;

            // Confirm registration to this user
            ws.send(`You are registered as: ${ws.id}`);

            // 🔥 Broadcast updated user list to everyone
            broadcast({
              type: "userData",
              payload: users,
            });
          } else {
            ws.send(
              JSON.stringify({
                type: "userData",
                payload: null,
                message: "No matching user found.",
              })
            );
          }
        } else if (data.type === "check" && data.id) {
          // Check if the id is online
          const isOnline = onlineClients.has(data.id);
          ws.send(`Is ${data.id} online? ${isOnline}`);
        } 
        // 🔥 Handle chat messages
        else if (data.type === "chat" && data.text && data.from) {
          broadcast({
            type: "chat",
            from: data.from,
            text: data.text,
          });
        }
      } catch (err) {
        console.error("Invalid message:", msg);
        ws.send(
          "Error: Please send JSON like {\"type\":\"connect\",\"id\":\"user_101\"}"
        );
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      if (ws.id) {
        onlineClients.delete(ws.id);
        console.log(`Client disconnected ❌ ${ws.id}`);

        // Update dummy array
        users.forEach((u) => {
          if (u.id === ws.id) u.isOnline = false;
        });

        console.log("Online clients:", [...onlineClients]);

        // 🔥 Broadcast updated list after disconnect
        broadcast({
          type: "userData",
          payload: users,
        });
      }
    });
  });

  console.log("WebSocket server running on ws://localhost:3000");
};

module.exports = socket;
