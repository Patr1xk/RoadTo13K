import { useState, useEffect } from 'react';
import { Contact } from '../types';

// Mock API functions
const mockAPI = {
  async getContacts(): Promise<Contact[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(localStorage.getItem('contacts') || '[]');
  },

  async addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    return newContact;
  },

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const index = contacts.findIndex((c: Contact) => c.id === id);
    
    if (index === -1) throw new Error('Contact not found');
    
    contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date() };
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    return contacts[index];
  },

  async deleteContact(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const filtered = contacts.filter((c: Contact) => c.id !== id);
    localStorage.setItem('contacts', JSON.stringify(filtered));
  }
};

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await mockAPI.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContact = await mockAPI.addContact(contact);
      setContacts(prev => [...prev, newContact]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
      throw err;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const updatedContact = await mockAPI.updateContact(id, updates);
      setContacts(prev => prev.map(c => c.id === id ? updatedContact : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await mockAPI.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      throw err;
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refetch: loadContacts
  };
};