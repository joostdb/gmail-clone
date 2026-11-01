import React from 'react';

function Sidebar({ 
  accounts, 
  selectedAccountId, 
  onSelectAccount, 
  selectedFolder, 
  onSelectFolder,
  onAddAccount
}) {
  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: '📧' },
    { id: 'STARRED', label: 'Met ster', icon: '⭐' },
    { id: 'IMPORTANT', label: 'Belangrijk', icon: '⚠️' },
    { id: 'SENT', label: 'Verzonden', icon: '📤' },
    { id: 'DRAFTS', label: 'Concepten', icon: '📝' },
    { id: 'TRASH', label: 'Prullenbak', icon: '🗑️' },
  ];

  const labels = [
    { id: 'WORK', label: 'Werk', color: '#4285f4' },
    { id: 'PERSONAL', label: 'Persoonlijk', color: '#ea4335' },
    { id: 'FINANCE', label: 'Financieel', color: '#34a853' },
    { id: 'SHOPPING', label: 'Winkelen', color: '#fbbc05' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Gmail Clone</h1>
        <button onClick={onAddAccount} title="Account toevoegen">+</button>
      </div>

      <div className="sidebar-section">
        <button 
          className="sidebar-item"
          onClick={() => onSelectFolder('INBOX')}
          style={{ fontWeight: 500, color: 'var(--primary-color)' }}
        >
          <span className="sidebar-item-icon">✏️</span>
          <span className="sidebar-item-label">Nieuwe mail</span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Mappen</div>
        {folders.map(folder => (
          <div 
            key={folder.id}
            className={`sidebar-item ${selectedFolder === folder.id ? 'active' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="sidebar-item-icon">{folder.icon}</span>
            <span className="sidebar-item-label">{folder.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Labels</div>
        {labels.map(label => (
          <div key={label.id} className="sidebar-item">
            <span 
              className="sidebar-item-icon" 
              style={{ 
                backgroundColor: label.color, 
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10
              }}
            >
              {label.label.charAt(0)}
            </span>
            <span className="sidebar-item-label">{label.label}</span>
          </div>
        ))}
      </div>

      {accounts.length > 0 && (
        <div className="account-switcher">
          <div className="sidebar-section-title">Accounts</div>
          {accounts.map(account => (
            <div 
              key={account.id}
              className={`sidebar-item ${selectedAccountId === account.id ? 'active' : ''}`}
              onClick={() => onSelectAccount(account.id)}
            >
              <div className="account-avatar">
                {account.display_name?.charAt(0) || account.email.charAt(0)}
              </div>
              <div className="account-info">
                <span className="account-name">{account.display_name || account.email}</span>
                <span className="account-email">{account.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;