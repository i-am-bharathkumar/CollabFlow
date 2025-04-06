let connectedUsers = [];

module.exports = (io) => {
  io.on('connection', (socket) => {
    // Track user connection
    socket.on('user-connect', (user) => {
      const newUser = { 
        id: socket.id, 
        username: user.username 
      };
      connectedUsers.push(newUser);
      
      // Broadcast updated user list
      io.emit('user-list', connectedUsers);
    });

    // Handle document changes
    socket.on('document-change', (content) => {
      // Broadcast changes to all connected clients
      socket.broadcast.emit('document-update', content);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from connected list
      connectedUsers = connectedUsers.filter(
        user => user.id !== socket.id
      );
      
      // Broadcast updated user list
      io.emit('user-list', connectedUsers);
    });
  });
};