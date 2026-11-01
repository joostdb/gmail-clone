const imap = require('imap-simple');
const nodemailer = require('nodemailer');
const { 
  getAccountById, 
  getAccounts,
  addAccount,
  deleteAccount,
  saveEmail, 
  getEmails: getEmailsFromDb,
  markEmailAsRead,
  starEmail,
  searchEmails: searchEmailsDb,
  getEmailById,
  deleteEmail
} = require('./database');

function setupEmailHandlers(ipcMain) {
  // Get all accounts
  ipcMain.handle('get-accounts', async () => {
    try {
      return getAccounts();
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  });

  // Add new account
  ipcMain.handle('add-account', async (event, accountData) => {
    try {
      return addAccount(accountData);
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  });

  // Delete account
  ipcMain.handle('delete-account', async (event, { id }) => {
    try {
      return deleteAccount(id);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  });

  // Fetch emails from IMAP server
  ipcMain.handle('fetch-emails', async (event, { accountId, folder = 'INBOX', limit = 50 }) => {
    try {
      const account = getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const config = {
        imap: {
          user: account.imap_username,
          password: account.imap_password,
          host: account.imap_host,
          port: account.imap_port,
          tls: account.imap_ssl,
          authTimeout: 30000,
          connTimeout: 30000
        }
      };

      const connection = await imap.connect(config);
      await connection.openBox(folder);
      
      const searchCriteria = ['ALL'];
      const fetchOptions = {
        bodies: '',
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      
      const emails = messages.slice(0, limit).map(msg => {
        const parts = msg.parts || [];
        const body = parts.find(p => p.type === 'text/plain')?.body || '';
        const htmlBody = parts.find(p => p.type === 'text/html')?.body || null;
        const hasAttachment = parts.some(p => p.type !== 'text/plain' && p.type !== 'text/html');
        
        return {
          messageId: msg.attributes.uid,
          threadId: msg.attributes.uid,
          subject: msg.attributes.subject || '(No Subject)',
          from: msg.attributes.from ? msg.attributes.from.toString() : '',
          to: msg.attributes.to ? msg.attributes.to.toString() : '',
          date: msg.attributes.date,
          body: body,
          htmlBody: htmlBody,
          hasAttachment: hasAttachment,
          folder: folder,
          accountId: accountId,
          isRead: msg.attributes.flags?.includes('\\Seen') || false,
          isStarred: msg.attributes.flags?.includes('\\Flagged') || false
        };
      });

      emails.forEach(email => {
        saveEmail(email);
      });

      await connection.end();
      
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  });

  // Get emails from local database
  ipcMain.handle('get-emails', async (event, { accountId, folder = 'INBOX', limit = 50 }) => {
    try {
      return getEmailsFromDb(accountId, folder, limit);
    } catch (error) {
      console.error('Error getting emails from DB:', error);
      throw error;
    }
  });

  // Send email via SMTP
  ipcMain.handle('send-email', async (event, { accountId, to, subject, body, htmlBody }) => {
    try {
      const account = getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const transporter = nodemailer.createTransport({
        host: account.smtp_host,
        port: account.smtp_port,
        secure: account.smtp_ssl,
        auth: {
          user: account.smtp_username,
          pass: account.smtp_password
        }
      });

      const mailOptions = {
        from: `"${account.display_name || account.email}" <${account.email}>`, 
        to: to,
        subject: subject,
        text: body,
        html: htmlBody || body
      };

      const info = await transporter.sendMail(mailOptions);
      
      saveEmail({
        accountId: accountId,
        messageId: info.messageId,
        subject: subject,
        from: account.email,
        to: to,
        body: body,
        htmlBody: htmlBody,
        date: new Date().toISOString(),
        folder: 'SENT'
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  });

  // Mark email as read
  ipcMain.handle('mark-email-read', async (event, { emailId, isRead }) => {
    try {
      return markEmailAsRead(emailId, isRead);
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  });

  // Star/unstar email
  ipcMain.handle('star-email', async (event, { emailId, isStarred }) => {
    try {
      return starEmail(emailId, isStarred);
    } catch (error) {
      console.error('Error starring email:', error);
      throw error;
    }
  });

  // Search emails
  ipcMain.handle('search-emails', async (event, { accountId, query }) => {
    try {
      return searchEmailsDb(accountId, query);
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  });

  // Get email by ID
  ipcMain.handle('get-email-by-id', async (event, { emailId }) => {
    try {
      return getEmailById(emailId);
    } catch (error) {
      console.error('Error getting email by ID:', error);
      throw error;
    }
  });

  // Delete email
  ipcMain.handle('delete-email', async (event, { emailId }) => {
    try {
      return deleteEmail(emailId);
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  });

  // Test IMAP connection
  ipcMain.handle('test-imap-connection', async (event, accountData) => {
    try {
      const config = {
        imap: {
          user: accountData.imapUsername,
          password: accountData.imapPassword,
          host: accountData.imapHost,
          port: accountData.imapPort || 993,
          tls: accountData.imapSsl !== false,
          authTimeout: 10000
        }
      };

      const connection = await imap.connect(config);
      await connection.end();
      return { success: true };
    } catch (error) {
      console.error('IMAP connection test failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Test SMTP connection
  ipcMain.handle('test-smtp-connection', async (event, accountData) => {
    try {
      const transporter = nodemailer.createTransport({
        host: accountData.smtpHost,
        port: accountData.smtpPort || 465,
        secure: accountData.smtpSsl !== false,
        auth: {
          user: accountData.smtpUsername,
          pass: accountData.smtpPassword
        }
      });

      await transporter.verify();
      return { success: true };
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupEmailHandlers };