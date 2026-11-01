const Database = require('better-sqlite3');
const path = require('path');

let db;

function setupDatabase() {
  const dbPath = path.join(__dirname, '../../../db/email_client.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      imap_host TEXT NOT NULL,
      imap_port INTEGER DEFAULT 993,
      imap_ssl BOOLEAN DEFAULT 1,
      imap_username TEXT NOT NULL,
      imap_password TEXT NOT NULL,
      smtp_host TEXT NOT NULL,
      smtp_port INTEGER DEFAULT 465,
      smtp_ssl BOOLEAN DEFAULT 1,
      smtp_username TEXT NOT NULL,
      smtp_password TEXT NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      message_id TEXT UNIQUE,
      thread_id TEXT,
      subject TEXT,
      from_address TEXT,
      to_address TEXT,
      body TEXT,
      html_body TEXT,
      is_read BOOLEAN DEFAULT 0,
      is_starred BOOLEAN DEFAULT 0,
      is_important BOOLEAN DEFAULT 0,
      has_attachment BOOLEAN DEFAULT 0,
      date DATETIME,
      labels TEXT,
      folder TEXT DEFAULT 'INBOX',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      path TEXT,
      type TEXT DEFAULT 'folder',
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      UNIQUE(account_id, name)
    );

    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      UNIQUE(account_id, name)
    );
  `);

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase() first.');
  }
  return db;
}

function addAccount(accountData) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO accounts (email, imap_host, imap_port, imap_ssl, imap_username, imap_password,
                          smtp_host, smtp_port, smtp_ssl, smtp_username, smtp_password, display_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    accountData.email,
    accountData.imapHost,
    accountData.imapPort || 993,
    accountData.imapSsl !== false,
    accountData.imapUsername,
    accountData.imapPassword,
    accountData.smtpHost,
    accountData.smtpPort || 465,
    accountData.smtpSsl !== false,
    accountData.smtpUsername,
    accountData.smtpPassword,
    accountData.displayName || accountData.email
  );
  
  return result;
}

function getAccounts() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM accounts');
  return stmt.all();
}

function getAccountById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
  return stmt.get(id);
}

function deleteAccount(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
  return stmt.run(id);
}

function saveEmail(emailData) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO emails 
    (id, account_id, message_id, thread_id, subject, from_address, to_address, body, html_body,
     is_read, is_starred, is_important, has_attachment, date, labels, folder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    emailData.id || null,
    emailData.accountId,
    emailData.messageId,
    emailData.threadId || null,
    emailData.subject || '',
    emailData.from || '',
    emailData.to || '',
    emailData.body || '',
    emailData.htmlBody || null,
    emailData.isRead || 0,
    emailData.isStarred || 0,
    emailData.isImportant || 0,
    emailData.hasAttachment || 0,
    emailData.date || new Date().toISOString(),
    emailData.labels || '',
    emailData.folder || 'INBOX'
  );
}

function getEmails(accountId, folder = 'INBOX', limit = 50) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM emails 
    WHERE account_id = ? AND folder = ? 
    ORDER BY date DESC 
    LIMIT ?
  `);
  return stmt.all(accountId, folder, limit);
}

function getEmailById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM emails WHERE id = ?');
  return stmt.get(id);
}

function markEmailAsRead(id, isRead = true) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE emails SET is_read = ? WHERE id = ?');
  return stmt.run(isRead ? 1 : 0, id);
}

function starEmail(id, isStarred = true) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE emails SET is_starred = ? WHERE id = ?');
  return stmt.run(isStarred ? 1 : 0, id);
}

function deleteEmail(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM emails WHERE id = ?');
  return stmt.run(id);
}

function searchEmails(accountId, query) {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  const stmt = db.prepare(`
    SELECT * FROM emails 
    WHERE account_id = ? AND (subject LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR body LIKE ?)
    ORDER BY date DESC
  `);
  return stmt.all(accountId, searchTerm, searchTerm, searchTerm, searchTerm);
}

module.exports = {
  setupDatabase,
  getDatabase,
  addAccount,
  getAccounts,
  getAccountById,
  deleteAccount,
  saveEmail,
  getEmails,
  getEmailById,
  markEmailAsRead,
  starEmail,
  deleteEmail,
  searchEmails
};