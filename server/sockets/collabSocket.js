// backend/sockets/collabSocket.js
const Document = require('../models/Document');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a document room
    socket.on('join-document', async (documentId) => {
      try {
        const document = await Document.findById(documentId);
        if (document) {
          socket.join(documentId);
          console.log(`User joined document room: ${documentId}`);
        }
      } catch (error) {
        console.error('Error joining document room:', error);
      }
    });

    // Handle document changes
    socket.on('document-change', async (data) => {
      try {
        const { documentId, content, userId } = data;
        
        // Update document in database
        const document = await Document.findById(documentId);
        if (document) {
          document.content = content;
          document.version += 1;
          document.versionHistory.push({
            content,
            timestamp: new Date(),
            userId
          });
          await document.save();

          // Broadcast changes to other users in the room
          socket.to(documentId).emit('document-update', {
            content,
            version: document.version
          });
        }
      } catch (error) {
        console.error('Error processing document change:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};