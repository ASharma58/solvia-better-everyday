import React, { useState, useEffect } from 'react';
import { Users, Shield, AlertTriangle, FileText, TrendingUp, Clock, Eye, UserX } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContexts';

const AdminDashboard: React.FC = () => {
  const { currentAdmin, logAction } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    flaggedContent: 12,
    privacyRequests: 3,
    complianceScore: 98.5,
    dataRetentionAlerts: 5
  });

  const recentActivity = [
    {
      id: 1,
      action: 'User Registration',
      user: 'sarah.johnson@email.com',
      timestamp: '2025-01-15 14:30:00',
      status: 'completed',
      compliance: 'PIPEDA consent obtained'
    },
    {
      id: 2,
      action: 'Content Flagged',
      user: 'user.456@email.com',
      timestamp: '2025-01-15 13:45:00',
      status: 'pending',
      compliance: 'Requires review within 24h'
    },
    {
      id: 3,
      action: 'Data Export Request',
      user: 'john.doe@email.com',
      timestamp: '2025-01-15 12:15:00',
      status: 'processing',
      compliance: 'PIPEDA Article 8 - 30 days'
    },
    {
      id: 4,
      action: 'Account Suspension',
      user: 'suspended.user@email.com',
      timestamp: '2025-01-15 11:00:00',
      status: 'completed',
      compliance: 'Due process followed'
    }
  ];

  const complianceAlerts = [
    {
      id: 1,
      type: 'Data Retention',
      message: '5 user accounts approaching 7-year retention limit',
      severity: 'medium',
      dueDate: '2025-02-01'
    },
    {
      id: 2,
      type: 'Consent Renewal',
      message: '23 users require consent renewal',
      severity: 'high',
      dueDate: '2025-01-20'
    },
    {
      id: 3,
      type: 'Privacy Audit',
      message: 'Quarterly privacy audit due',
      severity: 'low',
      dueDate: '2025-01-31'
    }
  ];

  useEffect(() => {
    logAction('admin_dashboard_view', 'system', 'dashboard', 'Administrator accessed dashboard');
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentAdmin?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Compliance Score</p>
            <p className="text-2xl font-bold text-green-600">{stats.complianceScore}%</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeUsers.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Active Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-red-600 text-sm font-medium">+3</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.flaggedContent}</h3>
          <p className="text-gray-600 text-sm">Flagged Content</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-purple-600 text-sm font-medium">+1</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.privacyRequests}</h3>
          <p className="text-gray-600 text-sm">Privacy Requests</p>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Compliance Alerts</h2>
        <div className="space-y-4">
          {complianceAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 border-red-400' :
              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{alert.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Due: {alert.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100' :
                  activity.status === 'pending' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {activity.action.includes('Registration') && <Users className="w-4 h-4 text-green-600" />}
                  {activity.action.includes('Flagged') && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  {activity.action.includes('Export') && <FileText className="w-4 h-4 text-blue-600" />}
                  {activity.action.includes('Suspension') && <UserX className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{activity.action}</h3>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.compliance}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-xs text-gray-600">View and manage user accounts</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="font-medium text-gray-900">Review Flags</h3>
              <p className="text-xs text-gray-600">Moderate flagged content</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Privacy Requests</h3>
              <p className="text-xs text-gray-600">Handle data requests</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <Shield className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Audit Logs</h3>
              <p className="text-xs text-gray-600">View system audit trail</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;