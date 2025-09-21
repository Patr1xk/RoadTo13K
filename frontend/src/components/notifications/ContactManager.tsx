import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Phone, Mail, MessageSquare, Star } from 'lucide-react';
import { Contact } from '../../types';

interface ContactManagerProps {
  contacts: Contact[];
  loading: boolean;
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  contacts,
  loading,
  onAddContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
    role: '',
    group: 'security' as Contact['group'],
    isPrimary: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await onUpdateContact(editingContact.id, formData);
      } else {
        await onAddContact(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      whatsapp: '',
      role: '',
      group: 'security',
      isPrimary: false
    });
    setShowForm(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      whatsapp: contact.whatsapp || '',
      role: contact.role,
      group: contact.group,
      isPrimary: contact.isPrimary || false
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const group = e.target.value as Contact['group'];
    setFormData(prev => ({ ...prev, group }));
  };

  const groups = ['security', 'management', 'operations', 'medical'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Contact Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Group</label>
                  <select
                    value={formData.group}
                    onChange={handleGroupChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    {groups.map(group => (
                      <option key={group} value={group} className="capitalize">{group}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-300">Primary contact for group</label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                  >
                    {editingContact ? 'Update' : 'Add'} Contact
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contacts ({contacts.length})</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading contacts...</div>
        ) : (
          <div className="space-y-3">
            {contacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{contact.name}</h4>
                      {contact.isPrimary && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded capitalize">
                        {contact.group}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{contact.role}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                      )}
                      {contact.whatsapp && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {contacts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No contacts added yet. Click "Add Contact" to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};