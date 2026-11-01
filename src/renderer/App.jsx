import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import ComposeModal from './components/ComposeModal';
import AccountModal from './components/AccountModal';

const { electronAPI } = window;

function App() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchEmails(selectedAccountId, selectedFolder);
    }
  }, [selectedAccountId, selectedFolder]);

  const loadAccounts = async () => {
    try {
      const result = await electronAPI.invoke('get-accounts');
      setAccounts(result || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const fetchEmails = async (accountId, folder = 'INBOX') => {
    try {
      setLoading(true);
      const localEmails = await electronAPI.invoke('get-emails', { 
        accountId, 
        folder, 
        limit: 50 
      });
      
      if (localEmails && localEmails.length > 0) {
        setEmails(localEmails);
      }
      
      const freshEmails = await electronAPI.invoke('fetch-emails', { 
        accountId, 
        folder, 
        limit: 50 
      });
      
      if (freshEmails && freshEmails.length > 0) {
        setEmails(freshEmails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (emailData) => {
    try {
      setLoading(true);
      const result = await electronAPI.invoke('send-email', {
        accountId: selectedAccountId,
        ...emailData
      });
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId, isRead = true) => {
    try {
      await electronAPI.invoke('mark-email-read', { emailId, isRead });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, isRead } : email
        )
      );
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const starEmail = async (emailId, isStarred = true) => {
    try {
      await electronAPI.invoke('star-email', { emailId, isStarred });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, isStarred } : email
        )
      );
    } catch (error) {
      console.error('Error starring email:', error);
    }
  };

  const addAccount = async (accountData) => {
    try {
      await electronAPI.invoke('add-account', accountData);
      await loadAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const testAccountConnection = async (accountData) => {
    try {
      const imapResult = await electronAPI.invoke('test-imap-connection', accountData);
      if (!imapResult.success) {
        return { success: false, error: imapResult.error || 'IMAP connection failed' };
      }
      
      const smtpResult = await electronAPI.invoke('test-smtp-connection', accountData);
      if (!smtpResult.success) {
        return { success: false, error: smtpResult.error || 'SMTP connection failed' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      markAsRead(email.id, true);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      await sendEmail(emailData);
      setIsComposeOpen(false);
      fetchEmails(selectedAccountId, 'SENT');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleStarToggle = (emailId, currentState) => {
    starEmail(emailId, !currentState);
    setSelectedEmail(prev => 
      prev?.id === emailId ? { ...prev, isStarred: !currentState } : prev
    );
  };

  const getAccountEmail = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.email : '';
  };

  return (
    <div className="app-container">
      <Sidebar 
        accounts={accounts} 
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        onAddAccount={() => setIsAccountModalOpen(true)}
      />
      
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="menu-button">☰</button>
            <div className="search-container">
              <input
                type="text"
                className="search-box"
                placeholder="Zoeken in mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <button className="header-button">⚙️</button>
            <button className="header-button">🔍</button>
            <button className="header-button">📊</button>
            <button className="header-button">🔔</button>
            <button 
              className="header-button" 
              onClick={() => setIsAccountModalOpen(true)}
            >
              {accounts.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', 
                    backgroundColor: '#1a73e8', color: 'white', 
                    display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                    {accounts.find(a => a.id === selectedAccountId)?.display_name?.charAt(0) || 
                     accounts.find(a => a.id === selectedAccountId)?.email?.charAt(0) || '?'}
                  </div>
                </div>
              ) : '+'}
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', height: 'calc(100% - 64px)' }}>
          <EmailList 
            emails={emails} 
            loading={loading}
            selectedEmail={selectedEmail}
            onSelectEmail={handleSelectEmail}
            onStarToggle={handleStarToggle}
            accountId={selectedAccountId}
          />
          
          {selectedEmail ? (
            <EmailView 
              email={selectedEmail} 
              onStarToggle={() => handleStarToggle(selectedEmail.id, selectedEmail.isStarred)}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📧</div>
              <div className="empty-state-title">Selecteer een e-mail</div>
              <div className="empty-state-subtitle">
                Kies een e-mail uit de lijst om de inhoud te bekijken
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        className="compose-button" 
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px',
          zIndex: 100
        }}
        onClick={() => setIsComposeOpen(true)}
      >
        ✏️ Nieuwe mail
      </button>

      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
          fromEmail={getAccountEmail(selectedAccountId)}
        />
      )}

      {isAccountModalOpen && (
        <AccountModal
          onClose={() => setIsAccountModalOpen(false)}
          onAddAccount={addAccount}
          testConnection={testAccountConnection}
          existingEmails={accounts.map(a => a.email)}
        />
      )}
    </div>
  );
}

export default App;