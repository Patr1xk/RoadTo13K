import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Contact, NotificationHistory } from '../../types';

interface NotificationDispatchProps {
  contacts: Contact[];
  sections: Array<{ id: string; name: string; type: string }>;
  history: NotificationHistory[];
  onNotificationSent: (history: NotificationHistory) => void;
}

export const NotificationDispatch: React.FC<NotificationDispatchProps> = ({
  contacts,
  sections,
  history,
  onNotificationSent
}) => {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({
    whatsapp: true,
    sms: false,
    email: false
  });
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!selectedSection || selectedContacts.length === 0 || !message.trim()) return;

    setSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const notification: NotificationHistory = {
        id: Date.now().toString(),
        sectionId: selectedSection,
        sectionName: sections.find(s => s.id === selectedSection)?.name || '',
        message: message.trim(),
        recipients: selectedContacts.map(id => {
          const contact = contacts.find(c => c.id === id);
          return {
            contactId: id,
            name: contact?.name || '',
            phone: contact?.phone || '',
            email: contact?.email || '',
            whatsapp: contact?.whatsapp || ''
          };
        }),
        channels: Object.keys(channels).filter(key => channels[key as keyof typeof channels]),
        timestamp: new Date(),
        status: 'sent',
        deliveryStatus: selectedContacts.reduce((acc, id) => {
          acc[id] = Math.random() > 0.1 ? 'delivered' : 'failed';
          return acc;
        }, {} as Record<string, 'delivered' | 'failed' | 'pending'>)
      };
      
      onNotificationSent(notification);
      
      // Reset form
      setSelectedSection('');
      setSelectedContacts([]);
      setMessage('');
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setSending(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredContacts = selectedSection 
    ? contacts.filter(contact => {
        const section = sections.find(s => s.id === selectedSection);
        return section?.type === 'entrance' ? contact.group === 'security' :
               section?.type === 'facility' ? contact.group === 'operations' :
               section?.type === 'exit' ? contact.group === 'security' :
               section?.type === 'seating' ? contact.group === 'management' :
               true;
      })
    : contacts;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Notification Dispatch</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Notification */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Compose Notification</h3>
          
          <div className="space-y-4">
            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select section...</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
            
            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Channels</label>
              <div className="flex gap-4">
                {[
                  { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { key: 'sms', label: 'SMS', icon: Phone },
                  { key: 'email', label: 'Email', icon: Mail }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels[key as keyof typeof channels]}
                      onChange={(e) => setChannels(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
              />
            </div>
            
            {/* Recipients */}
            {selectedSection && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipients ({selectedContacts.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredContacts.map(contact => (
                    <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{contact.name}</div>
                        <div className="text-xs text-gray-400">{contact.role} • {contact.group}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Send Button */}
            <button
              onClick={handleSendNotification}
              disabled={!selectedSection || selectedContacts.length === 0 || !message.trim() || sending}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Notification History */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Notifications</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {history.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white text-sm">{notification.sectionName}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(notification.status)}
                      <span className="text-xs text-gray-400 capitalize">{notification.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{notification.message}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {notification.recipients.length} recipient{notification.recipients.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-1">
                      {notification.channels.map(channel => (
                        <span key={channel} className="px-1 py-0.5 bg-blue-500/20 text-blue-300 rounded capitalize">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {history.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No notifications sent yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};