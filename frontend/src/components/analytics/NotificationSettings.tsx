import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, MessageSquare, Mail, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType, Zone } from '../../types';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  zones: Zone[];
  onSettingsChange: (settings: NotificationSettingsType) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  zones,
  onSettingsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSettings = (updates: Partial<NotificationSettingsType>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateThreshold = (key: keyof NotificationSettingsType['thresholds'], value: number) => {
    updateSettings({
      thresholds: { ...settings.thresholds, [key]: value }
    });
  };

  const updateChannel = (channel: keyof NotificationSettingsType['channels'], enabled: boolean) => {
    updateSettings({
      channels: { ...settings.channels, [channel]: enabled }
    });
  };

  const updateZoneSettings = (zoneId: string, enabled: boolean) => {
    updateSettings({
      zoneSpecific: {
        ...settings.zoneSpecific,
        [zoneId]: { ...settings.zoneSpecific[zoneId], enabled }
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Notification Settings</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-4">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-white font-medium">Enable Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Notification Channels */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">WhatsApp</span>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={settings.channels.whatsapp}
                onChange={(e) => updateChannel('whatsapp', e.target.checked)}
                disabled={!settings.enabled}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600 disabled:opacity-50"></div>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Email</span>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={settings.channels.email}
                onChange={(e) => updateChannel('email', e.target.checked)}
                disabled={!settings.enabled}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">SMS</span>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={settings.channels.sms}
                onChange={(e) => updateChannel('sms', e.target.checked)}
                disabled={!settings.enabled}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        {/* Expanded Settings */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-4 border-t border-white/10">
            {/* Thresholds */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Alert Thresholds</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Occupancy Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.thresholds.occupancyRate}
                    onChange={(e) => updateThreshold('occupancyRate', Number(e.target.value))}
                    disabled={!settings.enabled}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Traffic Flow (ppl/min)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.thresholds.trafficFlow}
                    onChange={(e) => updateThreshold('trafficFlow', Number(e.target.value))}
                    disabled={!settings.enabled}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Dwell Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.thresholds.dwellTime}
                    onChange={(e) => updateThreshold('dwellTime', Number(e.target.value))}
                    disabled={!settings.enabled}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Zone-specific Settings */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Zone-Specific Alerts</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {zones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-xs text-gray-300 truncate">{zone.name}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.zoneSpecific[zone.id]?.enabled ?? true}
                        onChange={(e) => updateZoneSettings(zone.id, e.target.checked)}
                        disabled={!settings.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-6 h-3 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};