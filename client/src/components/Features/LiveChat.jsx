import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { FaMicrophone, FaStop, FaPaperclip, FaSmile, FaReply, FaEdit, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { BsEmojiSmile, BsThreeDotsVertical } from 'react-icons/bs';
import './LiveChat.css';

const LiveChat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('chatUsername') || `User${Math.floor(Math.random() * 1000)}`);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('chatTheme') || 'light');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  

  // Refs
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);

  // Connect to socket server
  useEffect(() => {
    localStorage.setItem('chatUsername', username);
    
    const newSocket = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: true
    });
  
    setSocket(newSocket);
  
    const handleConnect = () => {
      setIsConnected(true);
      newSocket.emit('get-message-history');
      console.log('✅ Connected to server with ID:', newSocket.id);
    };
  
    const handleConnectError = (error) => {
      setIsConnected(false);
      console.error('❌ Connection error:', error);
    };
  
    const handleDisconnect = (reason) => {
      setIsConnected(false);
      console.log('⚠️ Disconnected:', reason);
    };
  
    const handleChatMessage = (message) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        return exists ? prev : [...prev, message];
      });
    };
  
    const handleMessageHistory = (history) => {
      setMessages(prev => {
        const newMessages = history.filter(
          newMsg => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        return [...prev, ...newMessages];
      });
    };
  
    const handleMessageReaction = ({ messageId, reaction, username }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
          reactions.push(`${reaction} ${username}`);
          return { ...msg, reactions };
        }
        return msg;
      }));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleMessageEdited = (updatedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    };

    const handleMessageRead = ({ messageId, reader }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const readBy = Array.isArray(msg.readBy) ? [...msg.readBy] : [];
          if (!readBy.includes(reader)) {
            readBy.push(reader);
          }
          return { ...msg, readBy };
        }
        return msg;
      }));
    };
  
    const handleUserTyping = (user) => {
      if (user.username !== username) {
        setTypingUsers(prev => [...new Set([...prev, user.username])]);
      }
    };
  
    const handleUserStoppedTyping = (user) => {
      setTypingUsers(prev => prev.filter(u => u !== user.username));
    };
  
    newSocket.on('connect', handleConnect);
    newSocket.on('connect_error', handleConnectError);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('chat-message', handleChatMessage);
    newSocket.on('message-history', handleMessageHistory);
    newSocket.on('user-typing', handleUserTyping);
    newSocket.on('user-stopped-typing', handleUserStoppedTyping);
    newSocket.on('online-users', setOnlineUsers);
    newSocket.on('file-shared', handleChatMessage);
    newSocket.on('audio-shared', handleChatMessage);
    newSocket.on('message-reaction', handleMessageReaction);
    newSocket.on('message-deleted', handleMessageDeleted);
    newSocket.on('message-edited', handleMessageEdited);
    newSocket.on('message-read', handleMessageRead);
  
    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('chat-message', handleChatMessage);
      newSocket.off('message-history', handleMessageHistory);
      newSocket.off('user-typing', handleUserTyping);
      newSocket.off('user-stopped-typing', handleUserStoppedTyping);
      newSocket.off('online-users', setOnlineUsers);
      newSocket.off('file-shared', handleChatMessage);
      newSocket.off('audio-shared', handleChatMessage);
      newSocket.off('message-reaction', handleMessageReaction);
      newSocket.off('message-deleted', handleMessageDeleted);
      newSocket.off('message-edited', handleMessageEdited);
      newSocket.off('message-read', handleMessageRead);
  
      if (newSocket.connected) {
        newSocket.disconnect();
      }
  
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
    };
  }, [username]);

  // Apply theme
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('chatTheme', theme);
  }, [theme]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuButton = document.querySelector('.message-menu-button');
      const menu = document.querySelector('.message-menu');
      
      if (showMessageMenu && 
          !event.target.closest('.message-menu') && 
          !event.target.closest('.message-menu-button')) {
        setShowMessageMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMessageMenu]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (socket && isConnected) {
      socket.emit('typing', { username });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { username });
      }, 2000);
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    if ((inputMessage.trim() || fileToUpload) && socket && isConnected) {
      if (fileToUpload) {
        handleFileUpload();
        return;
      }

      const messageData = {
        id: editingMessage ? editingMessage.id : Date.now().toString(),
        type: 'text',
        text: inputMessage.trim(),
        timestamp: new Date(),
        sender: username,
        replyTo: replyingTo,
      };

      if (editingMessage) {
        socket.emit('edit-message', messageData);
        setMessages(prev => prev.map(msg => msg.id === editingMessage.id ? messageData : msg));
        setEditingMessage(null);
      } else {
        socket.emit('send-message', messageData);
        setMessages(prev => [...prev, messageData]);
      }

      setInputMessage('');
      setReplyingTo(null);
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stop-typing', { username });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };


  // File handling
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Maximum file size is 10MB.');
        fileInputRef.current.value = '';
        return;
      }
      
      setFileToUpload(file);
    }
  };
  
  const handleFileUpload = () => {
    if (fileToUpload && socket && isConnected) {
      const reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = () => {
        const fileData = {
          id: Date.now().toString(),
          type: 'file',
          name: fileToUpload.name,
          size: fileToUpload.size,
          data: reader.result,
          mimeType: fileToUpload.type,
          timestamp: new Date(),
          sender: username,
          replyTo: replyingTo
        };
        
        socket.emit('send-file', fileData);
        setMessages(prev => [...prev, fileData]);
        
        setFileToUpload(null);
        setReplyingTo(null);
        fileInputRef.current.value = '';
      };
    }
  };

  const cancelFileUpload = () => {
    setFileToUpload(null);
    fileInputRef.current.value = '';
  };

  // Message actions
  const reactToMessage = (messageId, reaction) => {
    if (socket && isConnected) {
      const reactionData = { messageId, reaction, username };
      socket.emit('react-to-message', reactionData);
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
          reactions.push(`${reaction} ${username}`);
          return { ...msg, reactions };
        }
        return msg;
      }));
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && isConnected) {
      const readData = { messageId, reader: username };
      socket.emit('mark-as-read', readData);
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const readBy = Array.isArray(msg.readBy) ? [...msg.readBy] : [];
          if (!readBy.includes(username)) {
            readBy.push(username);
          }
          return { ...msg, readBy };
        }
        return msg;
      }));
    }
  };

  const deleteMessage = (messageId) => {
    if (socket && isConnected) {
      socket.emit('delete-message', { messageId });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setShowMessageMenu(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isOwnMessage = (sender) => sender === username;
  
  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'text':
        return (
          <div className="message-body">
            {msg.replyTo && (
              <div className="reply-preview">
                <div className="reply-sender">
                  Replying to {msg.replyTo.sender === username ? 'yourself' : msg.replyTo.sender}
                </div>
                <div className="reply-content">
                  {msg.replyTo.text || 'Unsupported message type'}
                </div>
              </div>
            )}
            {msg.text}
          </div>
        );
      
      case 'file':
        const isImage = msg.mimeType?.startsWith('image/');
        const isPDF = msg.mimeType === 'application/pdf';
        const isVideo = msg.mimeType?.startsWith('video/');
        
        return (
          <div className="message-body file-message">
            {isImage ? (
              <div className="file-preview image">
                <img src={msg.data} alt={msg.name} />
              </div>
            ) : isVideo ? (
              <div className="file-preview video">
                <video controls>
                  <source src={msg.data} type={msg.mimeType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : isPDF ? (
              <div className="file-preview pdf">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <span className="file-name">{msg.name}</span>
                  <span className="file-size">{formatFileSize(msg.size)}</span>
                </div>
              </div>
            ) : (
              <div className="file-preview generic">
                <div className="file-icon">📁</div>
                <div className="file-info">
                  <span className="file-name">{msg.name}</span>
                  <span className="file-size">{formatFileSize(msg.size)}</span>
                </div>
              </div>
            )}
            <a href={msg.data} download={msg.name} className="download-button">
              Download
            </a>
          </div>
        );
      
      default:
        return <div className="message-body">Unsupported message type</div>;
    }
  };

  const renderReactions = (reactions) => {
    if (!reactions || reactions.length === 0) return null;
    
    const grouped = {};
    reactions.forEach(reaction => {
      const [emoji, user] = reaction.split(' ');
      if (!grouped[emoji]) grouped[emoji] = [];
      grouped[emoji].push(user);
    });
    
    return (
      <div className="message-reactions">
        {Object.entries(grouped).map(([emoji, users]) => (
          <span key={emoji} className="reaction" title={`${users.join(', ')}`}>
            {emoji} {users.length}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`chat-containe ${theme}`}>
      <div className="chat-header">
        <h2>Live Chat</h2>
        <div className="header-actions">
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
      
      <div className="chat-main">
        <div className="sidebar">
          <div className="user-profile">
            <input
              type="text"
              id="username-input"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              className="username-input"
              maxLength="20"
              autoComplete="username"
            />
          </div>
          
          <div className="online-users">
            <h3>Online Users ({onlineUsers.length})</h3>
            <ul>
              {onlineUsers.map((user, index) => (
                <li key={index} className={user === username ? 'current-user' : ''}>
                  <span className="user-status"></span>
                  {user} {user === username ? '(you)' : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="message-area">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`message ${isOwnMessage(msg.sender) ? 'own-message' : 'other-message'}`}
                  onMouseEnter={() => !isOwnMessage(msg.sender) && markMessageAsRead(msg.id)}
                >
                  <div className="message-header">
                    <span className="sender">{isOwnMessage(msg.sender) ? 'You' : msg.sender}</span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwnMessage(msg.sender) && (
                      <div className="message-status">
                        {msg.readBy?.length > 0 ? (
                          <span className="read-receipt" title={`Read by ${msg.readBy.join(', ')}`}>
                            <FaCheckDouble className="read" />
                          </span>
                        ) : (
                          <span className="sent-receipt">
                            <FaCheckDouble className="sent" />
                          </span>
                        )}
                      </div>
                    )}
                    <div className="message-actions-container">
                      <button 
                        className="message-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id);
                        }}
                      >
                        <BsThreeDotsVertical />
                      </button>
                      {showMessageMenu === msg.id && (
                        <div className="message-menu">
                          <button onClick={() => {
                            setReplyingTo(msg);
                            setShowMessageMenu(null);
                            messageInputRef.current.focus();
                          }}>
                            <FaReply /> Reply
                          </button>
                          {isOwnMessage(msg.sender) && (
                            <>
                              <button onClick={() => {
                                setEditingMessage(msg);
                                setInputMessage(msg.text || '');
                                setShowMessageMenu(null);
                                messageInputRef.current.focus();
                              }}>
                                <FaEdit /> Edit
                              </button>
                              <button onClick={() => deleteMessage(msg.id)}>
                                <FaTrash /> Delete
                              </button>
                            </>
                          )}
                          <div className="reaction-options">
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                              <button 
                                key={emoji} 
                                className="reaction-option"
                                onClick={() => {
                                  reactToMessage(msg.id, emoji);
                                  setShowMessageMenu(null);
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderMessageContent(msg)}
                  {renderReactions(msg.reactions)}
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="message-controls">
            {replyingTo && (
              <div className="reply-preview-container">
                <div className="reply-preview-header">
                  <span>Replying to {replyingTo.sender === username ? 'yourself' : replyingTo.sender}</span>
                  <button onClick={() => setReplyingTo(null)}>x</button>
                </div>
                <div className="reply-preview-content">
                  {replyingTo.text || 'Unsupported message type'}
                </div>
              </div>
            )}
            
            {editingMessage && (
              <div className="editing-indicator">
                <span>Editing message</span>
                <button onClick={() => {
                  setEditingMessage(null);
                  setInputMessage('');
                }}>Cancel</button>
              </div>
            )}
            
            {fileToUpload && (
              <div className="file-upload-preview">
                <div className="file-preview-info">
                  <span className="file-icon">
                    {fileToUpload.type.startsWith('image/') ? '🖼️' : 
                     fileToUpload.type.startsWith('video/') ? '🎬' : 
                     fileToUpload.type === 'application/pdf' ? '📄' : '📁'}
                  </span>
                  <span className="file-name">{fileToUpload.name}</span>
                  <span className="file-size">{formatFileSize(fileToUpload.size)}</span>
                </div>
                <div className="file-actions">
                  <button onClick={cancelFileUpload} className="cancel-file">
                    Cancel
                  </button>
                  <button onClick={handleFileUpload} className="upload-file">
                    Send
                  </button>
                </div>
              </div>
            )}            
            
            <form className="message-form" onSubmit={sendMessage}>
              <div className="message-input-container">
                <textarea
                  ref={messageInputRef}
                  id="message-input"
                  name="message"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                  className="message-input"
                  disabled={!isConnected || !!fileToUpload }
                  rows="1"
                  autoComplete="on"
                  aria-label={editingMessage ? "Edit your message" : "Type a message"}
                />
                
                <div className="message-actions">
                  <button 
                    type="button" 
                    className="emoji-button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <BsEmojiSmile />
                  </button>  
                  
                  <button
                    type="button"
                    className="attachment-button"
                    onClick={() => fileInputRef.current.click()}                   
                  >
                    <FaPaperclip />
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="send-button">
                {editingMessage ? 'Update' : 'Send'}
              </button>
            </form>

            {showEmojiPicker && (
              <div className="emoji-picker-container" ref={emojiPickerRef}>
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setInputMessage(prev => prev + emojiData.emoji);
                    messageInputRef.current.focus();
                  }}
                  width="100%"
                  height={350}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;