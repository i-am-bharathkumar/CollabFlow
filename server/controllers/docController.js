const Document = require('../models/Document');

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, isPublic } = req.body;
    const doc = new Document({
      title,
      isPublic,
      owner: req.user.id,
      content: ''
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all documents for a user
const getUserDocuments = async (req, res) => {
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
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

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
const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document.owner.equals(req.user.id) &&
        !document.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    document.versionHistory.push({
      content: document.content,
      timestamp: new Date(),
      userId: req.user.id
    });

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
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only owner can delete document' });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

module.exports = {
  createDocument,
  getUserDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};
