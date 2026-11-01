import { useState, useEffect } from 'react';

const { electronAPI } = window;

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const result = await electronAPI.invoke('get-accounts');
      setAccounts(result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData) => {
    try {
      setLoading(true);
      const result = await electronAPI.invoke('add-account', accountData);
      await loadAccounts();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      setLoading(true);
      await electronAPI.invoke('delete-account', { id: accountId });
      await loadAccounts();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testAccountConnection = async (accountData) => {
    try {
      setLoading(true);
      const imapResult = await electronAPI.invoke('test-imap-connection', accountData);
      if (!imapResult.success) {
        return { success: false, error: imapResult.error || 'IMAP connection failed' };
      }
      
      const smtpResult = await electronAPI.invoke('test-smtp-connection', accountData);
      if (!smtpResult.success) {
        return { success: false, error: smtpResult.error || 'SMTP connection failed' };
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    error,
    addAccount,
    deleteAccount,
    testAccountConnection,
    refresh: loadAccounts
  };
}
