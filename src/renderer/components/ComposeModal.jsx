import React, { useState } from 'react';

function ComposeModal({ onClose, onSend, fromEmail }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!to || !subject) {
      setError('Vul ontvanger en onderwerp in');
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      await onSend({
        to,
        subject,
        body,
        htmlBody: isHtml ? body : null
      });
      
      setTo('');
      setSubject('');
      setBody('');
      onClose();
    } catch (err) {
      setError(err.message || 'Fout bij verzenden');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-modal">
      <div className="compose-modal-header">
        <h2>Nieuwe bericht</h2>
        <button className="compose-close" onClick={onClose}>×</button>
      </div>

      <form 
        className="compose-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div className="compose-field">
          <label>Van:</label>
          <input 
            type="email" 
            value={fromEmail}
            readOnly
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        <div className="compose-field">
          <label>Naar:</label>
          <input 
            type="email" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="ontvanger@example.com"
            multiple
          />
        </div>

        <div className="compose-field">
          <label>Onderwerp:</label>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Onderwerp"
          />
        </div>

        <div className="compose-field">
          <label>
            <select 
              value={isHtml ? 'html' : 'plain'}
              onChange={(e) => setIsHtml(e.target.value === 'html')}
              style={{ 
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                marginRight: '8px'
              }}
            >
              <option value="plain">Platte tekst</option>
              <option value="html">HTML</option>
            </select>
          </label>
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Typ hier je bericht..."
            style={{ minHeight: '200px' }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px',
          marginTop: '8px'
        }}>
          <button 
            type="button"
            className="account-button secondary"
            onClick={onClose}
          >
            Annuleren
          </button>
          <button 
            type="submit"
            className="account-button primary"
            disabled={sending}
          >
            {sending ? 'Verzenden...' : 'Verzenden'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComposeModal;