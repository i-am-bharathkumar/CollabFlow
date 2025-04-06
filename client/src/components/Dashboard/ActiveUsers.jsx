import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './Dashboard.css'; // Reuse Dashboard styles

const ActiveUsers = ({ users }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="active-users-card">
      <h3>Active Collaborators</h3>
      {users.length === 0 ? (
        <p>No other users online</p>
      ) : (
        <ul className="active-users-list">
          {users.map((u) => (
            <li key={u._id} className="active-user">
              <span className="user-avatar">
                {u.name.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{u.name}</span>
              <span className="online-indicator"></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveUsers;