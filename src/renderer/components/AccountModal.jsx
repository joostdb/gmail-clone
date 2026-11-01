import React, { useState } from 'react';

function AccountModal({ onClose, onAddAccount, testConnection, existingEmails = [] }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSsl: true,
    imapUsername: '',
    imapPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSsl: true,
    smtpUsername: '',
    smtpPassword: ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const emailProviders = {
    gmail: {
      imapHost: 'imap.gmail.com',
      imapPort: 993,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 465
    },
    outlook: {
      imapHost: 'outlook.office365.com',
      imapPort: 993,
      smtpHost: 'smtp.office365.com',
      smtpPort: 587
    },
    yahoo: {
      imapHost: 'imap.mail.yahoo.com',
      imapPort: 993,
      smtpHost: 'smtp.mail.yahoo.com',
      smtpPort: 465
    },
    custom: {
      imapHost: '',
      imapPort: 993,
      smtpHost: '',
      smtpPort: 465
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProviderSelect = (provider) => {
    const providerData = emailProviders[provider];
    setFormData(prev => ({
      ...prev,
      imapHost: providerData.imapHost,
      imapPort: providerData.imapPort,
      smtpHost: providerData.smtpHost,
      smtpPort: providerData.smtpPort
    }));
  };

  const handleTestConnection = async () => {
    if (!formData.email || !formData.imapPassword || !formData.smtpPassword) {
      setError('Vul alle verplichte velden in');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      setError(null);
      
      const result = await testConnection({
        ...formData,
        imapUsername: formData.imapUsername || formData.email,
        smtpUsername: formData.smtpUsername || formData.email
      });
      
      setTestResult(result);
      
      if (result.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = () => {
    if (existingEmails.includes(formData.email)) {
      setError('Dit e-mailadres is al toegevoegd');
      return;
    }
    
    if (!formData.email || !formData.imapPassword || !formData.smtpPassword) {
      setError('Vul alle verplichte velden in');
      return;
    }
    
    onAddAccount({
      ...formData,
      imapUsername: formData.imapUsername || formData.email,
      smtpUsername: formData.smtpUsername || formData.email
    });
  };

  const getProviderFromEmail = () => {
    if (formData.email.includes('gmail.com')) return 'gmail';
    if (formData.email.includes('outlook.com') || formData.email.includes('hotmail.com')) return 'outlook';
    if (formData.email.includes('yahoo.com')) return 'yahoo';
    return 'custom';
  };

  const detectProvider = () => {
    const provider = getProviderFromEmail();
    handleProviderSelect(provider);
  };

  return (
    <div className="account-modal">
      <div className="account-modal-header">
        <h2>{step === 1 ? 'Account toevoegen' : 'Account bevestigen'}</h2>
        <button className="compose-close" onClick={onClose}>×</button>
      </div>

      <div className="account-modal-body">
        {step === 1 && (
          <form className="account-form">
            <div className="account-form-group">
              <label>Weergavenaam (optioneel)</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Mijn Naam"
              />
            </div>

            <div className="account-form-group">
              <label>E-mailadres *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  detectProvider();
                }}
                placeholder="jouw@email.com"
                required
              />
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>IMAP Host</label>
                <input
                  type="text"
                  name="imapHost"
                  value={formData.imapHost}
                  onChange={handleChange}
                  placeholder="imap.example.com"
                />
              </div>
              <div className="account-form-group">
                <label>IMAP Poort</label>
                <input
                  type="number"
                  name="imapPort"
                  value={formData.imapPort}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>IMAP Gebruikersnaam</label>
                <input
                  type="text"
                  name="imapUsername"
                  value={formData.imapUsername}
                  onChange={handleChange}
                  placeholder={formData.email || 'gebruikersnaam'}
                />
              </div>
              <div className="account-form-group">
                <label>IMAP Wachtwoord *</label>
                <input
                  type="password"
                  name="imapPassword"
                  value={formData.imapPassword}
                  onChange={handleChange}
                  placeholder="wachtwoord"
                  required
                />
              </div>
            </div>

            <div className="account-form-group">
              <label>
                <input
                  type="checkbox"
                  name="imapSsl"
                  checked={formData.imapSsl}
                  onChange={handleChange}
                />
                IMAP SSL/TLS gebruiken
              </label>
            </div>

            <div style={{ 
              margin: '16px 0', 
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              SMTP Instellingen
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleChange}
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="account-form-group">
                <label>SMTP Poort</label>
                <input
                  type="number"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>SMTP Gebruikersnaam</label>
                <input
                  type="text"
                  name="smtpUsername"
                  value={formData.smtpUsername}
                  onChange={handleChange}
                  placeholder={formData.email || 'gebruikersnaam'}
                />
              </div>
              <div className="account-form-group">
                <label>SMTP Wachtwoord *</label>
                <input
                  type="password"
                  name="smtpPassword"
                  value={formData.smtpPassword}
                  onChange={handleChange}
                  placeholder="wachtwoord"
                  required
                />
              </div>
            </div>

            <div className="account-form-group">
              <label>
                <input
                  type="checkbox"
                  name="smtpSsl"
                  checked={formData.smtpSsl}
                  onChange={handleChange}
                />
                SMTP SSL/TLS gebruiken
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}
            {testResult && !testResult.success && (
              <div className="error-message">{testResult.error}</div>
            )}
            {testResult?.success && (
              <div className="success-message">Verbinding succesvol getest!</div>
            )}

            <div className="account-form-actions">
              <button 
                type="button"
                className="account-button secondary"
                onClick={onClose}
              >
                Annuleren
              </button>
              <button 
                type="button"
                className="account-button primary"
                onClick={handleTestConnection}
                disabled={testing || !formData.email || !formData.imapPassword}
              >
                {testing ? 'Testen...' : 'Verbinding testen'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="account-form">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h3>Verbinding succesvol!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Je account is klaar om toegevoegd te worden.
              </p>
            </div>

            <div style={{ 
              backgroundColor: 'var(--background-hover)', 
              padding: '16px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <div><strong>E-mail:</strong> {formData.email}</div>
              <div><strong>IMAP:</strong> {formData.imapHost}:{formData.imapPort}</div>
              <div><strong>SMTP:</strong> {formData.smtpHost}:{formData.smtpPort}</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="account-form-actions">
              <button 
                type="button"
                className="account-button secondary"
                onClick={() => setStep(1)}
              >
                Terug
              </button>
              <button 
                type="button"
                className="account-button primary"
                onClick={handleSubmit}
              >
                Account toevoegen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountModal;