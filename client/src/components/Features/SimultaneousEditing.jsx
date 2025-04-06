import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import './SimultaneousEditing.css';

const SimultaneousEditing = () => {
  const [document, setDocument] = useState('');
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [currentCursor, setCursorPosition] = useState({ start: 0, end: 0 });
  const [userCursors, setUserCursors] = useState({});
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditTime, setLastEditTime] = useState(null);
  const textareaRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Check if server is available
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Try a simple fetch to see if server responds
        // Ideally your server should have a /health or /status endpoint
        const response = await fetch('http://localhost:5000/socket.io/?EIO=4&transport=polling', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
        });
        
        if (response.ok) {
          console.log('Server appears to be available');
        } else {
          console.warn('Server returned non-200 status:', response.status);
          setConnectionStatus('Server Error - Status: ' + response.status);
        }
      } catch (error) {
        console.error('Server connectivity check failed:', error);
        setConnectionStatus('Server Unavailable - Check if backend is running');
      }
    };
    
    checkServerStatus();
    
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  const initializeSocket = useCallback(() => {
    // Only proceed if component is still mounted
    if (!isComponentMounted.current) return null;
    
    // If we already have a socket that's connected, don't create a new one
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, reusing existing socket');
      return socketRef.current;
    }
    
    // Cleanup any existing socket that might be in a bad state
    if (socketRef.current) {
      console.log('Cleaning up existing socket before creating new one');
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
    }

    console.log('Creating new socket connection...');
    setConnectionStatus('Connecting...');
    
    // Create new socket connection with improved options
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true, // Force new connection to avoid reusing broken ones
      transports: ['websocket', 'polling'], // Try polling as fallback
      autoConnect: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === 'production',
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on('connect', () => {
      if (!isComponentMounted.current) return;
      
      console.log('Socket connected successfully with ID:', newSocket.id);
      setConnectionStatus('Connected');
      setReconnectAttempts(0);
      
      if (isUsernameSet) {
        console.log('Emitting user-connect with username:', username);
        newSocket.emit('user-connect', { username });
      }
    });

    newSocket.on('connect_error', (error) => {
      if (!isComponentMounted.current) return;
      
      console.error('Connection error:', error.message);
      setConnectionStatus(`Connection Failed: ${error.message.substring(0, 50)}`);
      handleReconnect();
    });

    newSocket.on('disconnect', (reason) => {
      if (!isComponentMounted.current) return;
      
      console.log('Socket disconnected:', reason);
      setConnectionStatus(`Disconnected: ${reason}`);
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        handleReconnect();
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      if (!isComponentMounted.current) return;
      
      console.log(`Reconnection attempt ${attemptNumber}`);
      setConnectionStatus(`Reconnecting... (Attempt ${attemptNumber})`);
    });

    newSocket.on('reconnect_failed', () => {
      if (!isComponentMounted.current) return;
      
      console.log('Reconnection failed');
      setConnectionStatus('Reconnection Failed - Please Refresh');
    });

    // Application event handlers
    newSocket.on('document-update', (content) => {
      if (!isComponentMounted.current) return;
      
      console.log('Received document update, length:', content.length);
      setDocument(content);
      const timestamp = new Date().toISOString();
      setDocumentHistory(prev => [...prev, { content, timestamp }]);
    });

    newSocket.on('user-list', (connectedUsers) => {
      if (!isComponentMounted.current) return;
      
      console.log('Received updated user list:', connectedUsers);
      setUsers(connectedUsers);
    });

    newSocket.on('cursor-update', (cursorData) => {
      if (!isComponentMounted.current) return;
      
      setUserCursors(prev => ({
        ...prev,
        [cursorData.userId]: { 
          position: cursorData.position, 
          username: cursorData.username 
        }
      }));
    });

    newSocket.on('document-history', (history) => {
      if (!isComponentMounted.current) return;
      
      console.log('Received document history, entries:', history.length);
      setDocumentHistory(history);
    });

    // Keep track of the socket instance in state for UI access
    setSocket(newSocket);
    return newSocket;
  }, [isUsernameSet, username]);

  const handleReconnect = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    if (reconnectAttempts >= 5) {
      setConnectionStatus('Connection Failed - Please Refresh');
      return;
    }

    setReconnectAttempts(prev => prev + 1);
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const delay = Math.min(1000 * (reconnectAttempts + 1), 5000);
    console.log(`Scheduling reconnect attempt in ${delay}ms`);
    
    reconnectTimerRef.current = setTimeout(() => {
      if (!isComponentMounted.current) return;
      
      console.log(`Executing reconnect attempt ${reconnectAttempts + 1}`);
      initializeSocket();
    }, delay);
  }, [reconnectAttempts, initializeSocket]);

  useEffect(() => {
    isComponentMounted.current = true;
    const socketInstance = initializeSocket();

// In your cleanup function
return () => {
  console.log('Component unmounting, cleaning up resources');
  isComponentMounted.current = false;
  
  // Clear any pending timers
  if (reconnectTimerRef.current) {
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }
  
  // Safely disconnect socket if it exists
  if (socketRef.current) {
    console.log('Disconnecting socket on unmount');
    try {
      // Only attempt to disconnect if connected
      if (socketRef.current.connected) {
        // Remove all listeners first to prevent any callbacks after unmount
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    } catch (error) {
      console.error('Error during socket cleanup:', error);
    } finally {
      socketRef.current = null;
    }
  }
};
  }, [initializeSocket]);

  // Debounced document changes with better error handling
  const debouncedDocumentChange = useCallback((() => {
    let timeout = null;
    return (newContent) => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (!isComponentMounted.current) return;
        
        // Only emit if connected
        if (socketRef.current && socketRef.current.connected) {
          try {
            console.log('Emitting document change, content length:', newContent.length);
            socketRef.current.emit('document-change', newContent);
            setLastEditTime(new Date());
          } catch (error) {
            console.error('Error emitting document change:', error);
            setConnectionStatus('Transmission Error: ' + error.message);
          }
        } else {
          console.warn('Socket not connected. Cannot send changes. Current status:', connectionStatus);
          // Attempt to reconnect if not already in progress
          if (!reconnectTimerRef.current && reconnectAttempts < 5) {
            handleReconnect();
          }
        }
      }, 300); // 300ms debounce
    };
  })(), [connectionStatus, reconnectAttempts, handleReconnect]);

  const handleDocumentChange = (e) => {
    const newContent = e.target.value;
    setDocument(newContent);
    setIsEditing(true);
    
    // Capture cursor position
    const cursorStart = e.target.selectionStart;
    const cursorEnd = e.target.selectionEnd;
    setCursorPosition({ start: cursorStart, end: cursorEnd });
    
    // Emit cursor position if connected
    if (socketRef.current && socketRef.current.connected && isUsernameSet) {
      socketRef.current.emit('cursor-position', { position: { start: cursorStart, end: cursorEnd }, username });
    }
    
    // Use debounced update for document content
    debouncedDocumentChange(newContent);
  };

  // Detect when user stops typing
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        setIsEditing(false);
        
        // Notify server that user stopped typing
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('typing-status', { isTyping: false });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [document, isEditing]);

  // Handle username submission
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== '') {
      setIsUsernameSet(true);
      
      if (socketRef.current && socketRef.current.connected) {
        console.log('Socket already connected, emitting user-connect with username:', username);
        socketRef.current.emit('user-connect', { username });
      } else {
        // If socket isn't connected, initialize it with the username
        console.log('Socket not connected, initializing with username:', username);
        initializeSocket();
      }
    }
  };

  // Function to get user initials
  const getUserInitials = (username) => {
    return username.split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Function to restore a previous version
  const restoreVersion = (index) => {
    const versionToRestore = documentHistory[index].content;
    setDocument(versionToRestore);
    
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('document-change', versionToRestore);
    }
  };

  // Function to format timestamp
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Calculate time since last edit
  const getTimeSinceLastEdit = () => {
    if (!lastEditTime) return 'No edits yet';
    
    const seconds = Math.floor((new Date() - lastEditTime) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  // Function to manually force reconnection
  const forceReconnect = () => {
    console.log('Manually forcing reconnection');
    setConnectionStatus('Reconnecting...');
    setReconnectAttempts(0);
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    setTimeout(() => {
      initializeSocket();
    }, 500);
  };

  

  // If username is not set, show username form
  if (!isUsernameSet) {
    return (
      <div className="username-container">
        <h2>Enter Your Name to Start Collaborating</h2>
        <form onSubmit={handleUsernameSubmit}>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Name"
            className="username-input"
            required
          />
          <button type="submit" className="username-submit">Join Session</button>
        </form>
        <div className="connection-status-login">
          Server Status: 
          <span 
            className={
              connectionStatus.includes('Connected') ? 'status-connected' : 
              connectionStatus.includes('Failed') ? 'status-failed' : 
              'status-connecting'
            }
          >
            {connectionStatus}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="simultaneous-editing-container">
      <div className="simultaneous-editing-header">
        <h2>Simultaneous Editing</h2>
        <div className="connection-status">
          Connection Status: 
          <span 
            className={`status-indicator ${
              connectionStatus === 'Connected' ? 'status-connected' : 
              connectionStatus.includes('Failed') ? 'status-failed' : 
              connectionStatus.includes('Timeout') ? 'status-timeout' :
              'status-connecting'
            }`}
          >
            {connectionStatus}
          </span>
          
          {connectionStatus !== 'Connected' && (
            <button className="reconnect-button" onClick={forceReconnect}>
              Try Reconnecting
            </button>
          )}
          
          {connectionStatus !== 'Connected' && reconnectAttempts > 0 && (
            <span className="reconnect-attempts">
              Reconnect attempts: {reconnectAttempts}/5
            </span>
          )}
        </div>
      </div>
      
      <div className="editing-toolbar">
        <div className="edit-info">
          <span className="last-edit-time">Last edit: {getTimeSinceLastEdit()}</span>
          <span className="current-editors">
            {users.filter(u => u.isTyping).length > 0 ? 
              `${users.filter(u => u.isTyping).map(u => u.username).join(', ')} currently typing...` : 
              'No one is typing'}
          </span>
        </div>
        <div className="toolbar-actions">
          <button 
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button 
            className="save-button"
            onClick={() => {
              if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('save-document', document);
                alert('Document saved!');
              } else {
                alert('Cannot save: disconnected from server');
              }
            }}
            disabled={connectionStatus !== 'Connected'}
          >
            Save Document
          </button>
        </div>
      </div>
      
      <div className="simultaneous-editing-content">
        <div className="document-editor">
          <textarea
            ref={textareaRef}
            className="document-editor-textarea"
            value={document}
            onChange={handleDocumentChange}
            onSelect={(e) => {
              const cursorStart = e.target.selectionStart;
              const cursorEnd = e.target.selectionEnd;
              setCursorPosition({ start: cursorStart, end: cursorEnd });
              
              if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('cursor-position', { position: { start: cursorStart, end: cursorEnd }, username });
              }
            }}
            placeholder="Start collaborating..."
            disabled={connectionStatus !== 'Connected'}
          />
          
          {/* Show cursor positions of other users */}
          {Object.entries(userCursors).map(([userId, cursorData]) => {
            // Don't show own cursor
            if (socketRef.current && userId === socketRef.current.id) return null;
            
            // Calculate cursor position - this is simplified and might need adjustment
            // based on your textarea's content and styling
            const cursorPosition = document.substring(0, cursorData.position.start).split('\n');
            const cursorLine = cursorPosition.length - 1;
            const lineStart = cursorPosition.slice(0, -1).join('\n').length + (cursorLine > 0 ? 1 : 0);
            const cursorCol = cursorData.position.start - lineStart;
            
            // Generate a consistent color based on user ID
            const colorHue = parseInt(userId.substring(0, 6), 16) % 360;
            
            return (
              <div 
                key={userId} 
                className="remote-cursor"
                style={{
                  // This positioning is simplified and would need improvement for a real app
                  position: 'absolute',
                  left: `${(cursorCol % 80) * 8}px`, // Approximate position
                  top: `${cursorLine * 20}px`,       // Assuming 20px line height
                  backgroundColor: `hsl(${colorHue}, 70%, 70%)`,
                }}
              >
                <div className="cursor-label">{cursorData.username}</div>
              </div>
            );
          })}
        </div>
        
        <div className="users-panel">
          <div className="users-header">
            <h3>Connected Users</h3>
            <span className="connected-users-count">{users.length}</span>
          </div>
          
          <div className="user-list">
            {users.length === 0 ? (
              <div className="no-users">No other users connected</div>
            ) : (
              users.map((user, index) => (
                <div key={index} className="user-item">
                  <div 
                    className="user-avatar"
                    style={{
                      backgroundColor: `hsl(${user.username.charCodeAt(0) % 360}, 70%, 70%)`,
                    }}
                  >
                    {getUserInitials(user.username)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.username}</div>
                    <div className="user-status">
                      {user.isTyping ? (
                        <span className="typing-indicator">Typing...</span>
                      ) : (
                        <span className="online-status">Online</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {showHistory && (
        <div className="document-history-panel">
          <h3>Document History</h3>
          <div className="history-entries">
            {documentHistory.length === 0 ? (
              <div className="no-history">No history available yet</div>
            ) : (
              documentHistory.map((entry, index) => (
                <div key={index} className="history-entry">
                  <div className="history-timestamp">{formatTimestamp(entry.timestamp)}</div>
                  <div className="history-preview">
                    {entry.content.substring(0, 50)}
                    {entry.content.length > 50 ? '...' : ''}
                  </div>
                  <button 
                    className="restore-button"
                    onClick={() => restoreVersion(index)}
                    disabled={connectionStatus !== 'Connected'}
                  >
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SimultaneousEditing;