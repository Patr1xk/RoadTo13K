import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContactManager } from '../components/notifications/ContactManager';
import { VenueSelector } from '../components/notifications/VenueSelector';
import { EnhancedInsightsPanel } from '../components/notifications/EnhancedInsightsPanel';
import { VenueProvider } from '../contexts/VenueContext';
import { useContacts } from '../hooks/useContacts';
import { Contact, NotificationHistory } from '../types';

const NotificationManagementContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'contacts'>('insights');
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);

  const { contacts, loading: contactsLoading, addContact, updateContact, deleteContact } = useContacts();



  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Notification Management</h1>
        <p className="text-gray-400 text-lg">Contact management, insights, and notification dispatch</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'insights', label: 'Venue Insights', icon: '📊' },
          { id: 'contacts', label: 'Contact Management', icon: '👥' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <VenueSelector />
            <EnhancedInsightsPanel />
          </div>
        )}

        {activeTab === 'contacts' && (
          <ContactManager
            contacts={contacts}
            loading={contactsLoading}
            onAddContact={addContact}
            onUpdateContact={updateContact}
            onDeleteContact={deleteContact}
          />
        )}
      </motion.div>
    </div>
  );
};

export const NotificationManagementPage: React.FC = () => {
  return (
    <VenueProvider>
      <NotificationManagementContent />
    </VenueProvider>
  );
};