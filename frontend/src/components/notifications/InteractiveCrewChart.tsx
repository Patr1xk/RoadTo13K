import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight,
  Crown,
  Star
} from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'online' | 'busy' | 'offline';
  phone: string;
  email: string;
  level: 'lead' | 'senior' | 'junior';
  assignedZones: string[];
}

interface InteractiveCrewChartProps {
  className?: string;
}

const mockCrewData: CrewMember[] = [
  { id: '1', name: 'Sarah Chen', role: 'Security Lead', department: 'Security', status: 'online', phone: '+1-555-0101', email: 'sarah.chen@venue.com', level: 'lead', assignedZones: ['Gate A', 'Main Entrance'] },
  { id: '2', name: 'Mike Rodriguez', role: 'Senior Guard', department: 'Security', status: 'online', phone: '+1-555-0102', email: 'mike.r@venue.com', level: 'senior', assignedZones: ['Concourse'] },
  { id: '3', name: 'Alex Kim', role: 'Security Officer', department: 'Security', status: 'busy', phone: '+1-555-0103', email: 'alex.kim@venue.com', level: 'junior', assignedZones: ['Exit Gates'] },
  { id: '4', name: 'Emma Wilson', role: 'Operations Manager', department: 'Operations', status: 'online', phone: '+1-555-0201', email: 'emma.w@venue.com', level: 'lead', assignedZones: ['All Areas'] },
  { id: '5', name: 'David Park', role: 'Crowd Control', department: 'Operations', status: 'online', phone: '+1-555-0202', email: 'david.park@venue.com', level: 'senior', assignedZones: ['Seating Area'] },
  { id: '6', name: 'Lisa Johnson', role: 'Medical Lead', department: 'Medical', status: 'online', phone: '+1-555-0301', email: 'lisa.j@venue.com', level: 'lead', assignedZones: ['Medical Bay'] }
];

export const InteractiveCrewChart: React.FC<InteractiveCrewChartProps> = ({ className = '' }) => {
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>(['Security', 'Operations']);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const departments = Array.from(new Set(mockCrewData.map(member => member.department)));

  const toggleDepartment = (dept: string) => {
    setExpandedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'lead': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'senior': return <Star className="w-4 h-4 text-blue-400" />;
      case 'junior': return <UserCheck className="w-4 h-4 text-gray-400" />;
      default: return <UserCheck className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'Security': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'Operations': return <Users className="w-5 h-5 text-green-400" />;
      case 'Medical': return <UserCheck className="w-5 h-5 text-red-400" />;
      default: return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Interactive Crew Chart</h3>
        <div className="ml-auto text-sm text-gray-400">
          {mockCrewData.filter(m => m.status === 'online').length} online
        </div>
      </div>

      <div className="space-y-3">
        {departments.map(department => {
          const departmentMembers = mockCrewData.filter(member => member.department === department);
          const isExpanded = expandedDepartments.includes(department);
          const onlineCount = departmentMembers.filter(m => m.status === 'online').length;

          return (
            <motion.div
              key={department}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              {/* Department Header */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleDepartment(department)}
                className="w-full p-3 flex items-center justify-between bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getDepartmentIcon(department)}
                  <span className="font-semibold text-white">{department}</span>
                  <span className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded">
                    {departmentMembers.length} members
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-400">{onlineCount} online</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>
              </motion.button>

              {/* Department Members */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-2">
                      {departmentMembers.map((member, index) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedMember === member.id
                              ? 'border-blue-500 bg-blue-500/20 shadow-lg'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-gray-800`}></div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white text-sm">{member.name}</span>
                                  {getLevelIcon(member.level)}
                                </div>
                                <div className="text-xs text-gray-400">{member.role}</div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-xs px-2 py-1 rounded capitalize ${
                                member.status === 'online' ? 'bg-green-500/20 text-green-300' :
                                member.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {member.status}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Member Details */}
                          <AnimatePresence>
                            {selectedMember === member.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 pt-3 border-t border-white/10"
                              >
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-400">Assigned Zones:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {member.assignedZones.map(zone => (
                                      <span key={zone} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                        {zone}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-3">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/30 transition-colors"
                                    >
                                      <Phone className="w-3 h-3" />
                                      Call
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      Message
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                      Email
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};