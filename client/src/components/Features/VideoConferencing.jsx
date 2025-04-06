import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import './VideoConferencing.css';

const VideoConferencing = () => {
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [screenShareError, setScreenShareError] = useState(null);

  const socketRef = useRef();
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const userStreamRef = useRef();
  const screenStreamRef = useRef();
  const chatRef = useRef();

  // Join a room with name and room ID
  const joinRoom = useCallback(() => {
    if (!roomId.trim() || !userName.trim()) {
      alert('Please enter a room ID and your name');
      return;
    }

    setIsJoined(true);
    setConnectionStatus('connecting');

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');
    
    // Socket connection events
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
      
      // Get user media after socket is connected
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        userStreamRef.current = stream;
        userVideoRef.current.srcObject = stream;
        
        // Emit ready to join video conference with room ID and user name
        socketRef.current.emit('join-video-room', { roomId, userName });
        
        setupSocketListeners();
      }).catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera or microphone. Please check your permissions.');
        setConnectionStatus('error');
      });
    });

    socketRef.current.on('connect_error', () => {
      console.error('Connection error');
      setConnectionStatus('error');
      alert('Could not connect to the server. Please try again later.');
    });
  }, [roomId, userName]);

  // Setup all socket event listeners
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;
    
    // Listen for other users already in the room
    socketRef.current.on('other-users', users => {
      console.log('Other users in room:', users);
      const peerConnections = users.map(user => {
        const peer = createPeer(user.id, socketRef.current.id, userStreamRef.current);
        
        peersRef.current.push({
          peerID: user.id,
          userName: user.name,
          peer,
        });
        
        return {
          peer,
          userID: user.id,
          userName: user.name
        };
      });
      
      setPeers(peerConnections);
    });
    
    // Handle incoming signals when a new user joins
    socketRef.current.on('user-joined', payload => {
      console.log('User joined:', payload);
      const peer = addPeer(payload.signal, payload.callerID, payload.userName, userStreamRef.current);
      peersRef.current.push({
        peerID: payload.callerID,
        userName: payload.userName,
        peer,
      });
      
      setPeers(users => [...users, {
        peer,
        userID: payload.callerID,
        userName: payload.userName
      }]);

      // Notify when someone joins
      addSystemMessage(`${payload.userName} has joined the room`);
    });

    // Handle user disconnected
    socketRef.current.on('user-disconnected', userID => {
      console.log('User disconnected:', userID);
      const peerObj = peersRef.current.find(p => p.peerID === userID);
      if (peerObj) {
        peerObj.peer.close();
        // Notify when someone leaves
        addSystemMessage(`${peerObj.userName} has left the room`);
      }
      
      // Remove from peers list
      setPeers(peers => peers.filter(p => p.userID !== userID));
      peersRef.current = peersRef.current.filter(p => p.peerID !== userID);
    });

    // Handle ICE candidate
    socketRef.current.on('ice-candidate', incoming => {
      console.log('Received ICE candidate');
      const peerObj = peersRef.current.find(p => p.peerID === incoming.from);
      if (peerObj) {
        peerObj.peer.addIceCandidate(new RTCIceCandidate(incoming.candidate))
          .catch(e => console.error('Error adding ICE candidate:', e));
      }
    });

    // Handle incoming offer
    socketRef.current.on('offer', handleReceiveOffer);

    // Handle incoming answer
    socketRef.current.on('answer', handleReceiveAnswer);

    // Handle chat messages
    socketRef.current.on('new-message', message => {
      addMessage(message);
      if (!showChat) {
        // Visual notification that a new message arrived
        if (chatRef.current) {
          chatRef.current.classList.add('new-message-notification');
          setTimeout(() => {
            if (chatRef.current) {
              chatRef.current.classList.remove('new-message-notification');
            }
          }, 2000);
        }
      }
    });

    // Room info update (participants, etc)
    socketRef.current.on('room-info', info => {
      console.log('Room info:', info);
      // Could update room information UI here
    });
  }, [showChat]);

  // Handle receiving an offer from another peer
  const handleReceiveOffer = useCallback(incoming => {
    console.log('Received offer');
    const peerObj = peersRef.current.find(p => p.peerID === incoming.from);
    
    if (!peerObj) {
      // Create a new peer if we don't have one
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });
      
      userStreamRef.current.getTracks().forEach(track =>
        peer.addTrack(track, userStreamRef.current)
      );
      
      peer.onicecandidate = event => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            target: incoming.from,
            candidate: event.candidate
          });
        }
      };

      peer.ontrack = event => {
        // Handle incoming tracks
        const peerIndex = peers.findIndex(p => p.userID === incoming.from);
        if (peerIndex !== -1) {
          const peerElements = document.querySelectorAll('.peer-video');
          if (peerElements[peerIndex]) {
            peerElements[peerIndex].srcObject = event.streams[0];
          }
        }
      };
      
      peer.setRemoteDescription(new RTCSessionDescription(incoming.sdp))
        .then(() => peer.createAnswer())
        .then(answer => peer.setLocalDescription(answer))
        .then(() => {
          socketRef.current.emit('answer', {
            target: incoming.from,
            sdp: peer.localDescription
          });
        })
        .catch(e => console.error('Error handling offer:', e));
      
      peersRef.current.push({
        peerID: incoming.from,
        userName: incoming.userName,
        peer,
      });
      
      setPeers(users => [...users, {
        peer,
        userID: incoming.from,
        userName: incoming.userName
      }]);
    } else {
      // If we already have a peer, just set the remote description
      peerObj.peer.setRemoteDescription(new RTCSessionDescription(incoming.sdp))
        .catch(e => console.error('Error setting remote description:', e));
    }
  }, [peers]);

  // Handle receiving an answer from another peer
  const handleReceiveAnswer = useCallback(incoming => {
    console.log('Received answer');
    const peerObj = peersRef.current.find(p => p.peerID === incoming.from);
    if (peerObj) {
      peerObj.peer.setRemoteDescription(new RTCSessionDescription(incoming.sdp))
        .catch(e => console.error('Error setting remote description:', e));
    }
  }, []);

  // Create a new peer connection
  const createPeer = (userToSignal, callerID, stream) => {
    console.log('Creating peer connection to:', userToSignal);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });
    
    stream.getTracks().forEach(track =>
      peer.addTrack(track, stream)
    );
    
    // Handle ICE candidates
    peer.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          target: userToSignal,
          candidate: event.candidate
        });
      }
    };

    // Handle tracks coming from the peer
    peer.ontrack = event => {
      // This will be handled by the Video component
    };
    
    // Create offer
    peer.createOffer()
      .then(offer => peer.setLocalDescription(offer))
      .then(() => {
        socketRef.current.emit('offer', {
          target: userToSignal,
          caller: callerID,
          userName: userName,
          sdp: peer.localDescription
        });
      })
      .catch(e => console.error('Error creating offer:', e));
    
    return peer;
  };

  // Add a peer that initiated a connection to us
  const addPeer = (incomingSignal, callerID, callerName, stream) => {
    console.log('Adding peer:', callerID);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });
    
    stream.getTracks().forEach(track =>
      peer.addTrack(track, stream)
    );
    
    // Handle ICE candidates
    peer.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          target: callerID,
          candidate: event.candidate
        });
      }
    };

    // Handle tracks coming from the peer
    peer.ontrack = event => {
      // This will be handled by the Video component
    };
    
    // Answer the call
    peer.setRemoteDescription(new RTCSessionDescription(incomingSignal))
      .then(() => peer.createAnswer())
      .then(answer => peer.setLocalDescription(answer))
      .then(() => {
        socketRef.current.emit('answer', {
          target: callerID,
          sdp: peer.localDescription
        });
      })
      .catch(e => console.error('Error answering call:', e));
    
    return peer;
  };

  // Toggle audio mute
  const toggleMute = useCallback(() => {
    if (userStreamRef.current) {
      userStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (userStreamRef.current) {
      userStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        setScreenShareError(null);
        
        // Use try-catch with specific screen capture options
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor"
          },
          audio: false
        }).catch(error => {
          console.error('Error getting screen media:', error);
          setScreenShareError("Could not access screen. Please check your browser permissions.");
          throw error;
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace video track with screen track for all peers
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (videoTrack) {
          // Store original video track for later restoration
          const originalVideoTrack = userStreamRef.current.getVideoTracks()[0];
          
          peersRef.current.forEach(({ peer }) => {
            const senders = peer.getSenders();
            const sender = senders.find(s => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack).catch(error => {
                console.error('Error replacing track:', error);
              });
            }
          });
          
          // Show screen share in your video
          userVideoRef.current.srcObject = new MediaStream([videoTrack]);
          
          // When user stops screen sharing via the browser UI
          videoTrack.addEventListener('ended', () => {
            console.log('Screen sharing ended by user');
            
            // Restore original video track
            if (originalVideoTrack) {
              peersRef.current.forEach(({ peer }) => {
                const senders = peer.getSenders();
                const sender = senders.find(s => s.track && s.track.kind === 'video');
                if (sender) {
                  sender.replaceTrack(originalVideoTrack).catch(error => {
                    console.error('Error restoring track:', error);
                  });
                }
              });
              
              // Restore user video
              userVideoRef.current.srcObject = userStreamRef.current;
            }
            
            setIsScreenSharing(false);
          });
          
          setIsScreenSharing(true);
        } else {
          throw new Error("No video track found in screen sharing stream");
        }
      } else {
        // User clicked stop sharing button
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Restore original video track
        if (userStreamRef.current) {
          const videoTrack = userStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            peersRef.current.forEach(({ peer }) => {
              const senders = peer.getSenders();
              const sender = senders.find(s => s.track && s.track.kind === 'video');
              if (sender) {
                sender.replaceTrack(videoTrack).catch(error => {
                  console.error('Error restoring track:', error);
                });
              }
            });
          }
          
          // Show camera in your video
          userVideoRef.current.srcObject = userStreamRef.current;
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      setScreenShareError("Screen sharing failed. This may be due to browser permissions or an unsupported browser.");
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  // Leave the room
  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Stop all tracks
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peersRef.current.forEach(peer => {
      peer.peer.close();
    });
    
    // Reset state
    setPeers([]);
    peersRef.current = [];
    setIsJoined(false);
    setConnectionStatus('disconnected');
    setMessages([]);
    setNewMessage('');
    setShowChat(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setScreenShareError(null);
  }, []);

  // Add a chat message to the list
  const addMessage = useCallback(message => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Add a system message
  const addSystemMessage = useCallback(text => {
    const systemMessage = {
      id: Date.now(),
      sender: 'System',
      text,
      time: new Date().toLocaleTimeString(),
      isSystem: true
    };
    addMessage(systemMessage);
  }, [addMessage]);

  // Send a chat message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !socketRef.current) return;
    
    const message = {
      id: Date.now(),
      sender: userName,
      text: newMessage,
      time: new Date().toLocaleTimeString()
    };
    
    socketRef.current.emit('send-message', {
      roomId,
      message
    });
    
    addMessage(message);
    setNewMessage('');
  }, [newMessage, roomId, userName, addMessage]);

  // Handle message input changes
  const handleMessageChange = useCallback(e => {
    setNewMessage(e.target.value);
  }, []);

  // Handle message input key press (send on Enter)
  const handleMessageKeyPress = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Create a video component for each peer
  const Video = ({ peer, userName }) => {
    const ref = useRef();
    
    useEffect(() => {
      peer.ontrack = event => {
        ref.current.srcObject = event.streams[0];
      };
    }, [peer]);
    
    return <video className="peer-video" ref={ref} autoPlay playsInline />;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up resources
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      peersRef.current.forEach(peer => {
        peer.peer.close();
      });
    };
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (showChat && chatRef.current) {
      const chatContainer = chatRef.current.querySelector('.messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages, showChat]);

  // Render login form if not joined
  if (!isJoined) {
    return (
      <div className="join-room-container">
        <h2>Join Video Conference</h2>
        <div className="join-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="input-field"
          />
          <button onClick={joinRoom} className="join-btn">
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-conference-container">
      <div className="conference-header">
        <h2 className="conference-title">Video Conference: {roomId}</h2>
        <div className="connection-status">
          {connectionStatus === 'connected' ? (
            <span className="status-connected">Connected</span>
          ) : connectionStatus === 'connecting' ? (
            <span className="status-connecting">Connecting...</span>
          ) : (
            <span className="status-error">Connection Error</span>
          )}
        </div>
      </div>

      {screenShareError && (
        <div className="error-banner">
          <span>{screenShareError}</span>
          <button onClick={() => setScreenShareError(null)}>&times;</button>
        </div>
      )}

      <div className="conference-layout">
        <div className="video-grid">
          <div className="video-item user-video-container">
            <video className="user-video" ref={userVideoRef} muted autoPlay playsInline />
            <div className="video-label">
              You {isMuted && <i className="fas fa-microphone-slash"></i>}
              {isScreenSharing && <i className="fas fa-desktop"></i>}
            </div>
          </div>
          
          {peers.map((peerObj, index) => (
            <div key={peerObj.userID || index} className="video-item peer-video-container">
              <Video peer={peerObj.peer} userName={peerObj.userName} />
              <div className="video-label">{peerObj.userName || `Peer ${index + 1}`}</div>
            </div>
          ))}
        </div>

        {showChat && (
          <div className="chat-container" ref={chatRef}>
            <div className="chat-header">
              <h3>Chat</h3>
              <button className="close-chat-btn" onClick={() => setShowChat(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === userName ? 'my-message' : ''} ${message.isSystem ? 'system-message' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{message.sender}</span>
                    <span className="message-time">{message.time}</span>
                  </div>
                  <div className="message-text">{message.text}</div>
                </div>
              ))}
            </div>
            <div className="message-input-container">
              <textarea
                value={newMessage}
                onChange={handleMessageChange}
                onKeyPress={handleMessageKeyPress}
                placeholder="Type a message..."
                className="message-input"
              />
              <button className="send-btn" onClick={sendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <button 
          className={`control-btn ${isMuted ? 'control-btn-off' : ''}`} 
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <i className={`fas fa-${isMuted ? 'microphone-slash' : 'microphone'}`}></i>
        </button>
        <button 
          className={`control-btn ${isVideoOff ? 'control-btn-off' : ''}`} 
          onClick={toggleVideo}
          title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
        >
          <i className={`fas fa-${isVideoOff ? 'video-slash' : 'video'}`}></i>
        </button>
        <button 
          className={`control-btn ${isScreenSharing ? 'control-btn-active' : ''}`} 
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
        >
          <i className="fas fa-desktop"></i>
        </button>
        <button 
          className="control-btn" 
          onClick={() => setShowChat(!showChat)}
          title="Chat"
        >
          <i className="fas fa-comments"></i>
        </button>
        <button 
          className="control-btn leave-btn" 
          onClick={leaveRoom}
          title="Leave Meeting"
        >
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </div>
  );
};

export default VideoConferencing;