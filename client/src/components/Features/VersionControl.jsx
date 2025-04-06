import React, { useState, useEffect } from 'react';
import './VersionControl.css';

const VersionControl = () => {
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [versions, setVersions] = useState([
    {
      id: 1,
      project: "Main Project",
      version: "v1.2.3",
      updated: "March 28, 2025",
      changes: ["Added user authentication", "Fixed dashboard layout", "Improved performance"],
      author: "Alex Johnson"
    },
    {
      id: 2,
      project: "Documentation",
      version: "v2.0.1",
      updated: "March 25, 2025",
      changes: ["Updated API references", "Added migration guide", "Fixed typos"],
      author: "Sarah Williams"
    },
    {
      id: 3,
      project: "API Framework",
      version: "v3.5.2",
      updated: "March 27, 2025",
      changes: ["Added new endpoints", "Improved error handling", "Updated documentation"],
      author: "Michael Chen"
    },
    {
      id: 4,
      project: "Mobile App",
      version: "v1.0.0",
      updated: "March 30, 2025",
      changes: ["Initial release", "Basic functionality", "UI improvements"],
      author: "Emma Davis"
    }
  ]);
  
  const [selectedVersionsForCompare, setSelectedVersionsForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [activeProjects, setActiveProjects] = useState(4);
  const [totalVersions, setTotalVersions] = useState(24);
  const [teamMembers, setTeamMembers] = useState(8);
  const [lastUpdated, setLastUpdated] = useState("Today");
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentExportVersion, setCurrentExportVersion] = useState(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [versionToRollback, setVersionToRollback] = useState(null);

  // Filter versions based on search term
  const filteredVersions = versions.filter(version => 
    version.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle version details expansion
  const toggleVersion = (index) => {
    setExpandedVersion(expandedVersion === index ? null : index);
  };

  // Select version for comparison
  const toggleVersionForCompare = (version) => {
    if (selectedVersionsForCompare.some(v => v.id === version.id)) {
      setSelectedVersionsForCompare(selectedVersionsForCompare.filter(v => v.id !== version.id));
    } else {
      if (selectedVersionsForCompare.length < 2) {
        setSelectedVersionsForCompare([...selectedVersionsForCompare, version]);
      } else {
        // Replace the oldest selected version
        setSelectedVersionsForCompare([selectedVersionsForCompare[1], version]);
      }
    }
  };

  // Start comparison of selected versions
  const startCompare = (version) => {
    if (selectedVersionsForCompare.length === 0) {
      // If nothing selected yet, add this version
      setSelectedVersionsForCompare([version]);
    } else if (selectedVersionsForCompare.length === 1) {
      // If one version already selected, add this one and show comparison
      setSelectedVersionsForCompare([...selectedVersionsForCompare, version]);
      setShowCompareModal(true);
    } else {
      // If already have two, replace them and show comparison
      setSelectedVersionsForCompare([selectedVersionsForCompare[0], version]);
      setShowCompareModal(true);
    }
  };

  // Handle rollback confirmation
  const handleRollback = (version) => {
    setVersionToRollback(version);
    setShowRollbackModal(true);
  };

  // Confirm rollback action
  const confirmRollback = () => {
    // In a real app, this would communicate with your backend
    // For demo purposes, we'll just update the UI
    if (versionToRollback) {
      const now = new Date();
      const formattedDate = `${now.toLocaleString('default', { month: 'long' })} ${now.getDate()}, ${now.getFullYear()}`;
      
      // Add a new version that indicates rollback
      const newVersion = {
        id: totalVersions + 1,
        project: versionToRollback.project,
        version: incrementVersion(versionToRollback.version),
        updated: formattedDate,
        changes: [`Rolled back to ${versionToRollback.version}`, "Reverted all changes after this version"],
        author: "Current User" // In a real app, this would be the logged-in user
      };
      
      setVersions([newVersion, ...versions]);
      setTotalVersions(totalVersions + 1);
      setLastUpdated("Now");
      setShowRollbackModal(false);
      setVersionToRollback(null);
    }
  };

  // Handle export functionality
  const handleExport = (version) => {
    setCurrentExportVersion(version);
    setShowExportModal(true);
  };

  // Confirm export action
  const confirmExport = () => {
    // In a real app, this would trigger the download
    // For demo purposes, we'll just close the modal
    setTimeout(() => {
      setShowExportModal(false);
      setCurrentExportVersion(null);
      // Show download success via alert for demo purposes
      alert(`Successfully exported ${currentExportVersion.project} ${currentExportVersion.version} as ZIP`);
    }, 1000);
  };

  // Utility function to increment version number
  const incrementVersion = (version) => {
    const parts = version.replace('v', '').split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return `v${parts.join('.')}`;
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="version-page">
      <div className="version-container">
        <h2 className="version-header">Version Control System</h2>
        
        <div className="version-section search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search projects, versions, or authors..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-button" onClick={clearSearch}>
                <i className="fas fa-times"></i>
              </button>
            )}
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {selectedVersionsForCompare.length > 0 && (
            <div className="compare-bar">
              <p>Selected for comparison: {selectedVersionsForCompare.length}/2</p>
              {selectedVersionsForCompare.map((v) => (
                <span key={v.id} className="compare-item">
                  {v.project} {v.version}
                  <button onClick={() => toggleVersionForCompare(v)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
              {selectedVersionsForCompare.length === 2 && (
                <button className="compare-action" onClick={() => setShowCompareModal(true)}>
                  Compare Versions
                </button>
              )}
              {selectedVersionsForCompare.length > 0 && (
                <button className="compare-clear" onClick={() => setSelectedVersionsForCompare([])}>
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="version-section">
          <h3 className="section-header">Version History Dashboard</h3>
          <p className="section-description">
            Track, compare, and manage all changes to your projects and documents.
            Click on any version to see detailed change logs.
          </p>
        </div>
        
        <div className="version-section features-section">
          <h3 className="section-header">Key Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-history"></i>
              </div>
              <h4>Version Tracking</h4>
              <p>Comprehensive history of all changes with timestamps and authors.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-undo"></i>
              </div>
              <h4>Rollback</h4>
              <p>Revert to any previous version with a single click.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-code-branch"></i>
              </div>
              <h4>Branching</h4>
              <p>Create branches for experimental features without affecting main project.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>Collaboration</h4>
              <p>Multiple team members can work simultaneously with merge tools.</p>
            </div>
          </div>
        </div>
        
        <div className="version-section">
          <h3 className="section-header">Project Versions</h3>
          {filteredVersions.length === 0 ? (
            <div className="no-results">
              <p>No versions match your search. Try a different term or <button onClick={clearSearch}>clear search</button>.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="version-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Version</th>
                    <th>Last Updated</th>
                    <th>Author</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVersions.map((version, index) => (
                    <React.Fragment key={version.id}>
                      <tr 
                        className={`version-row ${selectedVersionsForCompare.some(v => v.id === version.id) ? 'selected-for-compare' : ''}`} 
                        onClick={() => toggleVersion(index)}
                      >
                        <td>{version.project}</td>
                        <td className="version-column">{version.version}</td>
                        <td className="date-column">{version.updated}</td>
                        <td className="author-column">{version.author}</td>
                        <td className="actions-column" onClick={e => e.stopPropagation()}>
                          <button 
                            className={`action-button compare ${selectedVersionsForCompare.some(v => v.id === version.id) ? 'active' : ''}`}
                            onClick={() => startCompare(version)}
                            title="Compare versions"
                          >
                            <i className="fas fa-columns"></i>
                          </button>
                          <button 
                            className="action-button download" 
                            onClick={() => handleExport(version)}
                            title="Download version"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                      {expandedVersion === index && (
                        <tr className="details-row">
                          <td colSpan="5">
                            <div className="version-details">
                              <h4>Changes in this version:</h4>
                              <ul>
                                {version.changes.map((change, i) => (
                                  <li key={i}>{change}</li>
                                ))}
                              </ul>
                              <div className="detail-actions">
                                <button 
                                  className="detail-button rollback"
                                  onClick={() => handleRollback(version)}
                                >
                                  <i className="fas fa-undo"></i> Rollback to this version
                                </button>
                                <button 
                                  className="detail-button export"
                                  onClick={() => handleExport(version)}
                                >
                                  <i className="fas fa-file-export"></i> Export as ZIP
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="version-section stats-section">
          <h3 className="section-header">Version Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Versions</h4>
              <p className="stat-value">{totalVersions}</p>
            </div>
            <div className="stat-card">
              <h4>Active Projects</h4>
              <p className="stat-value">{activeProjects}</p>
            </div>
            <div className="stat-card">
              <h4>Team Members</h4>
              <p className="stat-value">{teamMembers}</p>
            </div>
            <div className="stat-card">
              <h4>Last Updated</h4>
              <p className="stat-value">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version Comparison Modal */}
      {showCompareModal && selectedVersionsForCompare.length === 2 && (
        <div className="modal-overlay">
          <div className="modal compare-modal">
            <div className="modal-header">
              <h3>Compare Versions</h3>
              <button className="close-button" onClick={() => setShowCompareModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="compare-content">
              <div className="compare-column">
                <h4>{selectedVersionsForCompare[0].project} - {selectedVersionsForCompare[0].version}</h4>
                <p>Updated: {selectedVersionsForCompare[0].updated}</p>
                <p>Author: {selectedVersionsForCompare[0].author}</p>
                <h5>Changes:</h5>
                <ul>
                  {selectedVersionsForCompare[0].changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
              <div className="compare-divider"></div>
              <div className="compare-column">
                <h4>{selectedVersionsForCompare[1].project} - {selectedVersionsForCompare[1].version}</h4>
                <p>Updated: {selectedVersionsForCompare[1].updated}</p>
                <p>Author: {selectedVersionsForCompare[1].author}</p>
                <h5>Changes:</h5>
                <ul>
                  {selectedVersionsForCompare[1].changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setShowCompareModal(false)}>
                Close
              </button>
              <button className="modal-button">Generate Difference Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && currentExportVersion && (
        <div className="modal-overlay">
          <div className="modal export-modal">
            <div className="modal-header">
              <h3>Export Version</h3>
              <button className="close-button" onClick={() => setShowExportModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="export-content">
              <p>You are about to export:</p>
              <h4>{currentExportVersion.project} - {currentExportVersion.version}</h4>
              <p>Last updated: {currentExportVersion.updated}</p>
              <p>Author: {currentExportVersion.author}</p>
              
              <div className="export-options">
                <h5>Export Format:</h5>
                <div className="radio-option">
                  <input type="radio" id="zip" name="format" value="zip" defaultChecked />
                  <label htmlFor="zip">ZIP Archive</label>
                </div>
                <div className="radio-option">
                  <input type="radio" id="tar" name="format" value="tar" />
                  <label htmlFor="tar">TAR Archive</label>
                </div>
                
                <h5>Include:</h5>
                <div className="checkbox-option">
                  <input type="checkbox" id="source" name="include" value="source" defaultChecked />
                  <label htmlFor="source">Source Files</label>
                </div>
                <div className="checkbox-option">
                  <input type="checkbox" id="docs" name="include" value="docs" defaultChecked />
                  <label htmlFor="docs">Documentation</label>
                </div>
                <div className="checkbox-option">
                  <input type="checkbox" id="changelog" name="include" value="changelog" defaultChecked />
                  <label htmlFor="changelog">Changelog</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="modal-button" onClick={confirmExport}>
                Export Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && versionToRollback && (
        <div className="modal-overlay">
          <div className="modal rollback-modal">
            <div className="modal-header">
              <h3>Confirm Rollback</h3>
              <button className="close-button" onClick={() => setShowRollbackModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="rollback-content">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>Are you sure you want to roll back to:</p>
              <h4>{versionToRollback.project} - {versionToRollback.version}</h4>
              <p>Last updated: {versionToRollback.updated}</p>
              <p>Author: {versionToRollback.author}</p>
              
              <div className="warning-message">
                <p><strong>Warning:</strong> This action will create a new version that reverts all changes made after this version. This operation cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setShowRollbackModal(false)}>
                Cancel
              </button>
              <button className="modal-button danger" onClick={confirmRollback}>
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;