const express = require('express');
const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    priority: req.body.priority || 'medium',
    completed: req.body.completed || false
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.title = req.body.title || task.title;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
    task.priority = req.body.priority || task.priority;
    
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found with that ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // For newer Mongoose versions
    await Task.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found with that ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;