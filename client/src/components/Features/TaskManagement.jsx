import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCheck, FaTrash, FaEdit, FaPlus, FaSearch, FaFilter, FaInfo } from 'react-icons/fa';
import './TaskManagement.css';

// Create a configured API instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple Tooltip component
const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && <div className="tooltip">{text}</div>}
    </div>
  );
};

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [updatingTasks, setUpdatingTasks] = useState({});
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [statusTooltip, setStatusTooltip] = useState({ id: null, show: false });

  // Simplified task normalizer function
  const normalizeTask = (rawTask) => {
    if (!rawTask) return null;
    
    // Handle different API response structures
    const task = rawTask.task || rawTask.item || rawTask.data || rawTask;
    
    return {
      _id: task._id || task.id || Math.random().toString(36).substring(2, 11),
      title: task.title || task.name || task.description || 'Untitled Task',
      completed: Boolean(task.completed || task.isCompleted || task.done || false),
      priority: ['low', 'medium', 'high'].includes(task.priority?.toLowerCase()) 
        ? task.priority.toLowerCase() 
        : 'medium',
      createdAt: task.createdAt || new Date().toISOString()
    };
  };

  // Simplified response data extractor
  const extractTasksFromResponse = (response) => {
    if (!response) return [];
    
    // Handle direct array response
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    
    // Check for common response structures
    const possibleArrays = [
      response.tasks,
      response.items,
      response.results,
      response.data?.tasks,
      response.data?.items,
      response.data?.results
    ];
    
    // Find the first valid array
    const tasksArray = possibleArrays.find(arr => Array.isArray(arr));
    return tasksArray || [];
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching tasks from:', `${api.defaults.baseURL}/tasks`);
      
      const response = await api.get('/tasks');
      console.log('Task response:', response);
      
      const rawTasks = Array.isArray(response.data) 
        ? response.data 
        : extractTasksFromResponse(response.data || response);
      
      // Normalize all tasks and filter out invalid ones
      const validTasks = rawTasks
        .map(task => normalizeTask(task))
        .filter(task => task !== null);
      
      console.log('Processed tasks:', validTasks);
      setTasks(validTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again later.');
      // Keep existing tasks if there are any
      if (!tasks.length) {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [tasks.length]);

  const createTask = async () => {
    if (!newTask.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      setIsAddingTask(true);
      setError(null);
      
      const taskData = {
        title: newTask.trim(),
        completed: false,
        priority
      };
      
      console.log('Creating task with data:', taskData);
      
      try {
        const response = await api.post('/tasks', taskData);
        console.log('Create task response:', response);
        
        if (response?.data) {
          const newTaskItem = normalizeTask(response.data);
          if (newTaskItem) {
            setTasks(prevTasks => [...prevTasks, newTaskItem]);
          } else {
            throw new Error('Could not process new task data');
          }
        } else {
          throw new Error('No data returned from API');
        }
      } catch (apiError) {
        console.error('API call failed, using local task:', apiError);
        
        // Create a local task with client-generated ID
        const localTask = {
          _id: `local_${Date.now()}`,
          title: newTask.trim(),
          completed: false,
          priority,
          createdAt: new Date().toISOString()
        };
        
        setTasks(prevTasks => [...prevTasks, localTask]);
      }
      
      // Reset form
      setNewTask('');
      setPriority('medium');
      
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsAddingTask(false);
    }
  };

  const updateTask = async (id) => {
    if (!id || !editText.trim()) {
      setError('Invalid task or empty title');
      return;
    }

    try {
      setUpdatingTasks(prev => ({ ...prev, [id]: true }));
      setError(null);
      
      const task = tasks.find(t => t._id === id);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const updateData = {
        title: editText.trim(),
        completed: task.completed,
        priority: task.priority
      };
      
      try {
        // Check if it's a local task (client-generated ID)
        if (id.startsWith('local_')) {
          // Just update local state for client-generated tasks
          setTasks(prev => 
            prev.map(t => t._id === id ? { ...t, title: editText.trim() } : t)
          );
        } else {
          // Try API update for server tasks
          const response = await api.put(`/tasks/${id}`, updateData);
          
          if (response?.data) {
            setTasks(prev => 
              prev.map(t => t._id === id ? normalizeTask(response.data) : t)
            );
          } else {
            throw new Error('Invalid response data');
          }
        }
      } catch (apiError) {
        console.error('API update failed, using local update:', apiError);
        
        // Fallback to client-side update
        setTasks(prev => 
          prev.map(t => t._id === id ? { ...t, title: editText.trim() } : t)
        );
      }
      
      setEditingTask(null);
      setEditText('');
      
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setUpdatingTasks(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteTask = async (id) => {
    if (!id) return;

    try {
      setUpdatingTasks(prev => ({ ...prev, [id]: true }));
      setError(null);
      
      try {
        // Only attempt API delete for non-local tasks
        if (!id.startsWith('local_')) {
          await api.delete(`/tasks/${id}`);
        }
      } catch (apiError) {
        console.error('API deletion failed:', apiError);
        // Continue with UI update even if API fails
      }
      
      // Always update UI state
      setTasks(prev => prev.filter(task => task._id !== id));
      
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setUpdatingTasks(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleComplete = async (id) => {
    if (!id) return;

    try {
      setUpdatingTasks(prev => ({ ...prev, [id]: true }));
      setError(null);
      
      const task = tasks.find(t => t._id === id);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const updateData = {
        title: task.title,
        completed: !task.completed,
        priority: task.priority
      };
      
      try {
        // Check if it's a local task
        if (id.startsWith('local_')) {
          // Just update local state for client-generated tasks
          setTasks(prev => 
            prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t)
          );
        } else {
          // Try API update for server tasks
          const response = await api.put(`/tasks/${id}`, updateData);
          
          if (response?.data) {
            setTasks(prev => 
              prev.map(t => t._id === id ? normalizeTask(response.data) : t)
            );
          } else {
            throw new Error('Invalid response data');
          }
        }
      } catch (apiError) {
        console.error('API toggle failed, using local toggle:', apiError);
        
        // Fallback to client-side toggle
        setTasks(prev => 
          prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t)
        );
      }
      
      // Show status tooltip after toggling
      const updatedTask = tasks.find(t => t._id === id);
      if (updatedTask) {
        const newStatus = !updatedTask.completed;
        setStatusTooltip({ 
          id: id, 
          show: true, 
          status: newStatus ? 'Completed' : 'Pending' 
        });
        
        // Hide tooltip after 2 seconds
        setTimeout(() => {
          setStatusTooltip({ id: null, show: false });
        }, 2000);
      }
      
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setError('Failed to update task status. Please try again.');
    } finally {
      setUpdatingTasks(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingTask) {
        updateTask(editingTask);
      } else {
        createTask();
      }
    }
  };

  const startEditing = (task) => {
    if (task?._id) {
      setEditingTask(task._id);
      setEditText(task.title || '');
    }
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditText('');
  };

  // Function to handle showing status tooltip on task click
  const handleTaskClick = (task) => {
    if (!task || !task._id) return;
    
    setStatusTooltip({ 
      id: task._id, 
      show: true, 
      status: task.completed ? 'Completed' : 'Pending' 
    });
    
    // Hide tooltip after 2 seconds
    setTimeout(() => {
      setStatusTooltip({ id: null, show: false });
    }, 2000);
  };

  // Filtered tasks with error handling
  const filteredTasks = tasks.filter(task => {
    if (!task || typeof task !== 'object') return false;
    
    const taskTitle = (task.title || '').toLowerCase();
    const isCompleted = Boolean(task.completed);
    const matchesSearch = taskTitle.includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'completed' && isCompleted) || 
      (filterStatus === 'pending' && !isCompleted);
    
    return matchesSearch && matchesFilter;
  });

  // Get task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  useEffect(() => {
    fetchTasks();
    
    console.log('TaskManagement component mounted');
    
    return () => {
      console.log('TaskManagement component unmounted');
    };
  }, [fetchTasks]);

  return (
    <div className="task-page">
      <div className="task-container">
        <h1 className="task-header">
          <span className="task-icon"><FaCheck /></span>
          Task Manager
        </h1>
        
        {error && (
          <div className="task-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <div className="task-controls">
          <div className="search-filter">
            <div className="search-container">
              <Tooltip text="Search for tasks">
                <FaSearch className="search-icon" />
              </Tooltip>
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-container">
              <Tooltip text="Filter tasks by status">
                <FaFilter className="filter-icon" />
              </Tooltip>
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="task-input-container">
            <input
              className="task-input"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter new task"
              disabled={loading || isAddingTask}
            />
            
            <Tooltip text="Set task priority">
              <select
                className="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading || isAddingTask}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Tooltip>
            
            <Tooltip text="Add a new task">
              <button 
                className="task-button" 
                onClick={createTask}
                disabled={loading || isAddingTask || !newTask.trim()}
              >
                {isAddingTask ? 'Adding...' : <><FaPlus className="button-icon" /> Add</>}
              </button>
            </Tooltip>
          </div>
        </div>
        
        {loading ? (
          <div className="task-loading">
            <div className="loading-spinner"></div>
            Loading tasks...
          </div>
        ) : filteredTasks.length > 0 ? (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li 
                key={task._id} 
                className={`task-item ${task.completed ? 'completed' : ''} ${task.priority}`}
                onClick={() => handleTaskClick(task)}
              >
                {editingTask === task._id ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <Tooltip text="Save changes">
                        <button 
                          className="save-button" 
                          onClick={() => updateTask(task._id)}
                          disabled={!editText.trim() || updatingTasks[task._id]}
                        >
                          {updatingTasks[task._id] ? 'Saving...' : 'Save'}
                        </button>
                      </Tooltip>
                      <Tooltip text="Cancel editing">
                        <button 
                          className="cancel-button" 
                          onClick={cancelEditing}
                          disabled={updatingTasks[task._id]}
                        >
                          Cancel
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <Tooltip text={task.completed ? "Mark as pending" : "Mark as completed"}>
                        <span 
                          className={`checkbox ${task.completed ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!updatingTasks[task._id]) toggleComplete(task._id);
                          }}
                        >
                          {updatingTasks[task._id] ? (
                            <div className="mini-spinner"></div>
                          ) : (
                            task.completed && <FaCheck className="check-icon" />
                          )}
                        </span>
                      </Tooltip>
                      <span className="task-text">
                        {task.title}
                        {statusTooltip.show && statusTooltip.id === task._id && (
                          <span className="status-tooltip">
                            {statusTooltip.status || (task.completed ? 'Completed' : 'Pending')}
                          </span>
                        )}
                      </span>
                      <span className="priority-badge">{task.priority}</span>
                    </div>
                    <div className="task-actions">
                      <Tooltip text="Edit task">
                        <button 
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!updatingTasks[task._id]) startEditing(task);
                          }}
                          disabled={updatingTasks[task._id]}
                        >
                          <FaEdit />Edit
                        </button>
                      </Tooltip>
                      <Tooltip text="Delete task">
                        <button 
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!updatingTasks[task._id]) deleteTask(task._id);
                          }}
                          disabled={updatingTasks[task._id]}
                        >
                          <FaTrash />
                       Del </button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="task-empty">
            <img 
              src="/empty-state.svg" 
              alt="No tasks" 
              className="empty-image" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f5"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="%23999">No Tasks</text></svg>';
              }}
            />
            <p>No tasks found. Add a new task to get started!</p>
          </div>
        )}
        
        {!loading && (
          <div className="task-stats">
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <p>{taskStats.total}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p>{taskStats.completed}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p>{taskStats.pending}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;