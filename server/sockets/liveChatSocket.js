module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ New user connected: ${socket.id}`);

    // Handle incoming messages
    socket.on("send-message", (message) => {
      console.log(`📩 Message received from ${socket.id}:`, message);
      io.emit("chat-message", message); // Broadcast to all clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`🚨 WebSocket error on ${socket.id}:`, error);
    });
  });
};
