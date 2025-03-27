// backend/controllers/docController.js
const Document = require('../models/Document');

// Create a new document
exports.createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newDocument = new Document({
      title,
      content,
      owner: req.user.id,
      collaborators: [req.user.id]
    });

    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
};

// Get all documents for a user
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ 
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

// Get a specific document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Check if user has access to the document
    if (!document.owner.equals(req.user.id) && 
        !document.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);

    // Check if user has permission to update
    if (!document.owner.equals(req.user.id) && 
        !document.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add to version history
    document.versionHistory.push({
      content: document.content,
      timestamp: new Date(),
      userId: req.user.id
    });

    // Update document
    document.title = title || document.title;
    document.content = content || document.content;
    document.version += 1;

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    // Check if user is the owner
    if (!document.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only owner can delete document' });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};