import React from 'react';

function EmailView({ email, onStarToggle }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="email-view">
      <div className="email-header">
        <div>
          <div className="email-subject-header">{email.subject}</div>
          <div className="email-sender-header">
            Van: {email.from} | Naar: {email.to}
          </div>
        </div>
        <div className="email-actions">
          <button 
            className="email-action-button"
            onClick={() => onStarToggle()}
            title={email.isStarred ? 'Verwijder ster' : 'Voeg ster toe'}
          >
            {email.isStarred ? '⭐' : '☆'}
          </button>
          <button className="email-action-button" title="Verwijderen">🗑️</button>
          <button className="email-action-button" title="Doorsturen">📤</button>
          <button className="email-action-button" title="Vernieuwen">🔄</button>
        </div>
      </div>

      <div className="email-body">
        <div className="email-meta">
          <span>{formatDate(email.date)}</span>
          {email.hasAttachment && (
            <span>📎 Bijlagen</span>
          )}
        </div>
        
        <div className="email-content">
          {email.htmlBody ? (
            <div 
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
              style={{ 
                maxWidth: '100%',
                overflow: 'auto',
                lineHeight: '1.6'
              }}
            />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
              {email.body}
            </pre>
          )}
        </div>
      </div>

      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--white)'
      }}>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Beantwoorden
        </button>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Doorsturen
        </button>
      </div>
    </div>
  );
}

export default EmailView;