import React from 'react';

function EmailList({ 
  emails, 
  loading, 
  selectedEmail, 
  onSelectEmail,
  onStarToggle,
  accountId
}) {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>E-mails laden...</span>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-title">Geen e-mails</div>
        <div className="empty-state-subtitle">
          Er zijn geen e-mails in deze map
        </div>
      </div>
    );
  }

  return (
    <div className="email-list">
      {emails.map(email => (
        <div 
          key={email.id || email.messageId}
          className={`email-item ${!email.isRead ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
          onClick={() => onSelectEmail(email)}
        >
          <input 
            type="checkbox" 
            className="email-checkbox"
            checked={selectedEmail?.id === email.id}
            onChange={(e) => e.stopPropagation()}
          />
          <button 
            className={`email-star ${email.isStarred ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onStarToggle(email.id, email.isStarred);
            }}
          >
            {email.isStarred ? '⭐' : '☆'}
          </button>
          <div className="email-sender">{email.from}</div>
          <div className="email-subject">{email.subject}</div>
          <div className="email-date">
            {new Date(email.date).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short'
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmailList;