import { useState, useCallback } from 'react';

const { electronAPI } = window;

export function useEmail() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmails = useCallback(async (accountId, folder = 'INBOX', limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const localEmails = await electronAPI.invoke('get-emails', { 
        accountId, 
        folder, 
        limit 
      });
      
      if (localEmails && localEmails.length > 0) {
        setEmails(localEmails);
      }
      
      const freshEmails = await electronAPI.invoke('fetch-emails', { 
        accountId, 
        folder, 
        limit 
      });
      
      if (freshEmails && freshEmails.length > 0) {
        setEmails(freshEmails);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (accountId, emailData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await electronAPI.invoke('send-email', {
        accountId,
        ...emailData
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (emailId, isRead = true) => {
    try {
      await electronAPI.invoke('mark-email-read', { emailId, isRead });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, isRead } : email
        )
      );
    } catch (err) {
      console.error('Error marking email as read:', err);
    }
  }, []);

  const starEmail = useCallback(async (emailId, isStarred = true) => {
    try {
      await electronAPI.invoke('star-email', { emailId, isStarred });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, isStarred } : email
        )
      );
    } catch (err) {
      console.error('Error starring email:', err);
    }
  }, []);

  const deleteEmail = useCallback(async (emailId) => {
    try {
      await electronAPI.invoke('delete-email', { emailId });
      setEmails(prev => prev.filter(email => email.id !== emailId));
    } catch (err) {
      console.error('Error deleting email:', err);
      throw err;
    }
  }, []);

  const searchEmails = useCallback(async (accountId, query) => {
    try {
      setLoading(true);
      const results = await electronAPI.invoke('search-emails', { accountId, query });
      setEmails(results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    emails,
    loading,
    error,
    fetchEmails,
    sendEmail,
    markAsRead,
    starEmail,
    deleteEmail,
    searchEmails
  };
}
