import React from 'react';
import './Dashboard.css'; // Reuse Dashboard styles

const RecentActivities = ({ activities }) => {
  return (
    <div className="activities-card">
      <h3>Recent Activities</h3>
      {activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
        <ul className="activities-list">
          {activities.map((activity, index) => (
            <li key={index} className="activity-item">
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
              <span className="activity-message">
                {activity.user} {activity.action} "{activity.document}"
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivities;
