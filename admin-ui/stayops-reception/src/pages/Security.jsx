import React, { useState } from 'react';

const Security = ({ securityLogs = [] }) => {
  const [activeTab, setActiveTab] = useState('access');

  const secureCount = securityLogs.filter(log => log.status === 'success').length;
  const alertCount = securityLogs.filter(log => log.status === 'blocked').length;
  const activeKeyCards = 15; // This could be passed as a prop

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Security
          </h1>
          <p className="text-sm text-gray-500">
            Monitor access control and security systems
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">System Status</div>
            <div className="text-3xl font-light">Secure</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Active Key Cards</div>
            <div className="text-3xl font-light">{activeKeyCards}</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Security Alerts</div>
            <div className="text-3xl font-light">{alertCount}</div>
          </div>
        </div>

        {/* Security Logs */}
        <div className="border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-light tracking-tight">Security Logs</h2>
          </div>
          
          <div className="p-6">
            {securityLogs.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-sm">No security logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {securityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="border border-gray-200 hover:border-black transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-light tracking-tight mb-2">
                            {log.action}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>User: {log.user}</div>
                            <div>Location: {log.location}</div>
                            <div className="text-xs text-gray-400">{log.timestamp}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs ${
                          log.status === 'success' 
                            ? 'bg-black text-white' 
                            : 'bg-gray-900 text-white'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo with sample data
const mockSecurityLogs = [
  {
    id: 'SEC001',
    type: 'access',
    user: 'John Smith',
    action: 'Room Entry',
    location: 'Room 101',
    timestamp: '2024-01-15 14:30:00',
    status: 'success'
  },
  {
    id: 'SEC002',
    type: 'alert',
    user: 'System',
    action: 'Unauthorized Access Attempt',
    location: 'Staff Area',
    timestamp: '2024-01-15 15:45:00',
    status: 'blocked'
  },
  {
    id: 'SEC003',
    type: 'access',
    user: 'Emily Johnson',
    action: 'Room Entry',
    location: 'Room 205',
    timestamp: '2024-01-15 16:15:00',
    status: 'success'
  },
  {
    id: 'SEC004',
    type: 'access',
    user: 'Michael Brown',
    action: 'Staff Area Access',
    location: 'Back Office',
    timestamp: '2024-01-15 17:00:00',
    status: 'success'
  }
];

export default () => <Security securityLogs={mockSecurityLogs} />;