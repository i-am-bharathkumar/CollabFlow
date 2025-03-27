// backend/routes/docRoutes.js
const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const authMiddleware = require('../middleware/authMiddleware');

// Document routes
router.post('/', authMiddleware, docController.createDocument);
router.get('/', authMiddleware, docController.getUserDocuments);
router.get('/:id', authMiddleware, docController.getDocumentById);
router.put('/:id', authMiddleware, docController.updateDocument);
router.delete('/:id', authMiddleware, docController.deleteDocument);

module.exports = router;