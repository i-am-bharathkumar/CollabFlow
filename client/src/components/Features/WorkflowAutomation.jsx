import React, { useState, useEffect } from 'react';
import './WorkflowAutomation.css';

const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Daily Report Generation',
      status: 'active',
      trigger: 'Daily at 8:00 AM',
      lastRun: 'March 28, 2025 08:00 AM',
      frequency: 'daily',
      action: 'report'
    },
    {
      id: 2,
      name: 'Customer Data Sync',
      status: 'active',
      trigger: 'On new customer',
      lastRun: 'March 28, 2025 09:15 AM',
      frequency: 'on-demand',
      action: 'data'
    },
    {
      id: 3,
      name: 'Inventory Update',
      status: 'paused',
      trigger: 'Weekly on Monday',
      lastRun: 'March 27, 2025 11:30 PM',
      frequency: 'weekly',
      action: 'data'
    },
    {
      id: 4,
      name: 'Email Campaign',
      status: 'error',
      trigger: 'Manual trigger',
      lastRun: 'March 28, 2025 06:45 AM',
      frequency: 'on-demand',
      action: 'email'
    }
  ]);
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: '',
    action: '',
    frequency: 'daily'
  });
  
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Templates data
  const templates = [
    {
      id: 1,
      name: 'New User Onboarding',
      description: 'Automatically send welcome emails and set up accounts',
      trigger: 'event',
      action: 'email',
      frequency: 'on-demand'
    },
    {
      id: 2,
      name: 'Monthly Reporting',
      description: 'Generate and distribute reports at month-end',
      trigger: 'time',
      action: 'report',
      frequency: 'monthly'
    },
    {
      id: 3,
      name: 'Data Backup',
      description: 'Automatically backup critical data weekly',
      trigger: 'time',
      action: 'data',
      frequency: 'weekly'
    },
    {
      id: 4,
      name: 'Customer Follow-up',
      description: 'Send follow-up emails after customer interactions',
      trigger: 'event',
      action: 'email',
      frequency: 'on-demand'
    }
  ];

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingWorkflow) {
      setEditingWorkflow(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewWorkflow(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create new workflow
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingWorkflow) {
      // Update existing workflow
      setWorkflows(prev => 
        prev.map(wf => wf.id === editingWorkflow.id ? editingWorkflow : wf)
      );
      setEditingWorkflow(null);
      showNotification('Workflow updated successfully', 'success');
    } else {
      // Create new workflow
      const newId = Math.max(...workflows.map(wf => wf.id), 0) + 1;
      const triggerLabel = getTriggerLabel(newWorkflow.trigger, newWorkflow.frequency);
      
      const workflowToAdd = {
        ...newWorkflow,
        id: newId,
        status: 'active',
        trigger: triggerLabel,
        lastRun: 'Never run'
      };
      
      setWorkflows(prev => [...prev, workflowToAdd]);
      showNotification('New workflow created successfully', 'success');
    }
    
    resetForm();
  };

  // Get human-readable trigger label
  const getTriggerLabel = (trigger, frequency) => {
    switch (trigger) {
      case 'time':
        switch (frequency) {
          case 'daily': return 'Daily at 8:00 AM';
          case 'weekly': return 'Weekly on Monday';
          case 'monthly': return 'Monthly on the 1st';
          default: return 'Scheduled';
        }
      case 'event': return 'On system event';
      case 'api': return 'API Call trigger';
      default: return 'Custom trigger';
    }
  };

  // Reset form state
  const resetForm = () => {
    setShowCreateForm(false);
    setNewWorkflow({
      name: '',
      trigger: '',
      action: '',
      frequency: 'daily'
    });
  };

  // Edit workflow
  const handleEdit = (workflow) => {
    setEditingWorkflow({...workflow});
    setShowCreateForm(true);
  };

  // Change workflow status
  const handleStatusChange = (id, newStatus) => {
    setWorkflows(prev => 
      prev.map(wf => {
        if (wf.id === id) {
          return {...wf, status: newStatus};
        }
        return wf;
      })
    );
    
    const actionName = newStatus === 'active' ? 'resumed' : newStatus === 'paused' ? 'paused' : 'retried';
    showNotification(`Workflow ${actionName} successfully`, 'success');
  };

  // Delete workflow
  const handleDelete = (id) => {
    if (confirmDelete === id) {
      setWorkflows(prev => prev.filter(wf => wf.id !== id));
      setConfirmDelete(null);
      showNotification('Workflow deleted successfully', 'success');
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000); // Reset after 3 seconds
    }
  };

  // Apply template
  const handleUseTemplate = (template) => {
    setNewWorkflow({
      name: template.name,
      trigger: template.trigger,
      action: template.action,
      frequency: template.frequency
    });
    
    setActiveTab('workflows');
    setShowCreateForm(true);
    showNotification('Template loaded successfully', 'success');
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter(wf => {
    const matchesStatus = filterStatus === 'all' || wf.status === filterStatus;
    const matchesSearch = wf.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    // Reset editing state when changing tabs
    if (activeTab !== 'workflows') {
      setEditingWorkflow(null);
      setShowCreateForm(false);
    }
  }, [activeTab]);

  return (
    <div className="workflow-automation-page">
      <div className="workflow-container">
        {/* Notification component */}
        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="workflow-header-container">
          <h2 className="workflow-header">Workflow Automation</h2>
          <div className="workflow-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'workflows' ? 'active' : ''}`}
              onClick={() => setActiveTab('workflows')}
            >
              My Workflows
            </button>
            <button 
              className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div className="workflow-content">
            <div className="workflow-section feature-highlights">
              <h3 className="section-header">Automate Your Workflows</h3>
              <p className="section-description">Streamline repetitive tasks and increase productivity with intelligent automation.</p>
              
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">⏱️</div>
                  <h4>Time Savings</h4>
                  <p>Reduce manual work by up to 80% with automated processes</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🤖</div>
                  <h4>Smart Triggers</h4>
                  <p>Set up triggers based on events, schedules, or conditions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔄</div>
                  <h4>Multi-step Flows</h4>
                  <p>Chain multiple actions together in complex workflows</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h4>Analytics</h4>
                  <p>Track performance and optimize your automations</p>
                </div>
              </div>
              
              <div className="cta-container">
                <button 
                  className="primary-button"
                  onClick={() => {
                    setActiveTab('workflows');
                    setShowCreateForm(true);
                  }}
                >
                  Create Your First Workflow
                </button>
                <button 
                  className="secondary-button"
                  onClick={() => setActiveTab('templates')}
                >
                  Explore Templates
                </button>
              </div>
            </div>

            {workflows.length > 0 && (
              <div className="workflow-section stats-section">
                <h3 className="section-header">Your Automation Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{workflows.length}</div>
                    <div className="stat-label">Active Workflows</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">24</div>
                    <div className="stat-label">Runs Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">98%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">12h</div>
                    <div className="stat-label">Time Saved</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'workflows' && (
          <div className="workflow-content">
            <div className="workflow-section">
              <div className="section-header-container">
                <h3 className="section-header">
                  {editingWorkflow ? 'Edit Workflow' : 'Current Workflows'}
                </h3>
                <button 
                  className="create-button"
                  onClick={() => {
                    if (editingWorkflow) {
                      setEditingWorkflow(null);
                    }
                    setShowCreateForm(!showCreateForm);
                  }}
                >
                  {showCreateForm ? 'Cancel' : '+ Create New Workflow'}
                </button>
              </div>
              
              {showCreateForm && (
                <div className="create-form-container">
                  <form onSubmit={handleSubmit} className="workflow-form">
                    <div className="form-group">
                      <label>Workflow Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editingWorkflow ? editingWorkflow.name : newWorkflow.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Trigger</label>
                      <select
                        name="trigger"
                        value={editingWorkflow ? editingWorkflow.trigger.split(' ')[0].toLowerCase() : newWorkflow.trigger}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a trigger</option>
                        <option value="time">Scheduled Time</option>
                        <option value="event">System Event</option>
                        <option value="api">API Call</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Action</label>
                      <select
                        name="action"
                        value={editingWorkflow ? editingWorkflow.action : newWorkflow.action}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select an action</option>
                        <option value="email">Send Email</option>
                        <option value="notification">Send Notification</option>
                        <option value="data">Process Data</option>
                        <option value="report">Generate Report</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Frequency</label>
                      <select
                        name="frequency"
                        value={editingWorkflow ? editingWorkflow.frequency : newWorkflow.frequency}
                        onChange={handleInputChange}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="on-demand">On Demand</option>
                      </select>
                    </div>
                    
                    {/* Advanced options - collapsible */}
                    <div className="form-advanced">
                      <details>
                        <summary>Advanced Options</summary>
                        <div className="form-group">
                          <label>Error Handling</label>
                          <select
                            name="errorHandling"
                            defaultValue="retry"
                          >
                            <option value="retry">Retry 3 times</option>
                            <option value="ignore">Ignore errors</option>
                            <option value="notify">Notify admin</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Priority</label>
                          <select
                            name="priority"
                            defaultValue="normal"
                          >
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </details>
                    </div>
                    
                    <button type="submit" className="submit-button">
                      {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                    </button>
                  </form>
                </div>
              )}
              
              {!showCreateForm && (
                <>
                  <div className="filters-container">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="status-filter">
                      <label>Filter by status:</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="table-container">
                    {filteredWorkflows.length === 0 ? (
                      <div className="empty-state">
                        <p>No workflows found. Create your first workflow to get started!</p>
                      </div>
                    ) : (
                      <table className="workflow-table">
                        <thead>
                          <tr>
                            <th>Workflow Name</th>
                            <th>Status</th>
                            <th>Trigger</th>
                            <th>Last Run</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWorkflows.map(workflow => (
                            <tr key={workflow.id}>
                              <td>{workflow.name}</td>
                              <td className={`status-column status-${workflow.status}`}>
                                <span className="status-bubble"></span>
                                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                              </td>
                              <td>{workflow.trigger}</td>
                              <td className="date-column">{workflow.lastRun}</td>
                              <td className="actions-column">
                                <button 
                                  className="action-button edit"
                                  onClick={() => handleEdit(workflow)}
                                >
                                  Edit
                                </button>
                                
                                {workflow.status === 'active' && (
                                  <button 
                                    className="action-button pause"
                                    onClick={() => handleStatusChange(workflow.id, 'paused')}
                                  >
                                    Pause
                                  </button>
                                )}
                                
                                {workflow.status === 'paused' && (
                                  <button 
                                    className="action-button resume"
                                    onClick={() => handleStatusChange(workflow.id, 'active')}
                                  >
                                    Resume
                                  </button>
                                )}
                                
                                {workflow.status === 'error' && (
                                  <button 
                                    className="action-button retry"
                                    onClick={() => handleStatusChange(workflow.id, 'active')}
                                  >
                                    Retry
                                  </button>
                                )}
                                
                                <button 
                                  className={`action-button delete ${confirmDelete === workflow.id ? 'confirm' : ''}`}
                                  onClick={() => handleDelete(workflow.id)}
                                >
                                  {confirmDelete === workflow.id ? 'Confirm' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div className="workflow-content">
            <div className="workflow-section">
              <h3 className="section-header">Workflow Templates</h3>
              <p className="section-description">Get started quickly with these pre-built templates</p>
              
              <div className="template-grid">
                {templates.map(template => (
                  <div className="template-card" key={template.id}>
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <div className="template-details">
                      <span className="template-detail">
                        Trigger: {template.trigger === 'time' ? 'Scheduled' : 'Event-based'}
                      </span>
                      <span className="template-detail">
                        Action: {template.action.charAt(0).toUpperCase() + template.action.slice(1)}
                      </span>
                    </div>
                    <button 
                      className="use-template-button"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="workflow-section custom-template-section">
              <h3 className="section-header">Ready for More?</h3>
              <p className="section-description">
                Save any of your own workflows as templates to reuse later.
                Simply create a workflow, then click "Save as Template" in the actions menu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowAutomation;