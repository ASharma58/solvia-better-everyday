import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/admin';

// Define AuditLog type locally
type AuditLog = {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
  ip_address: string;
  compliance_category: string;
};

interface AdminContextType {
  currentAdmin: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  logAction: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
  const adminData = localStorage.getItem('solvia_admin');
  if (adminData) {
    try {
      const raw = JSON.parse(adminData) as Partial<User>;
      const withDefaults: User = {
        id: raw.id ?? 'admin-1',
        email: raw.email ?? 'admin@solvia.ca',
        name: raw.name ?? 'System Administrator',

        joinDate: raw.joinDate ?? new Date().toISOString(),
        timezone: raw.timezone ?? 'UTC-5',
        theme: raw.theme ?? 'light',
        preferences: raw.preferences ?? {
          dailyReminders: true,
          weeklyReports: true,
          emailNotifications: false,
          darkMode: false,
          autoSave: true,
        },

        role: raw.role ?? 'admin',
        status: raw.status ?? 'active',
        last_login: raw.last_login ?? null,

        consent_given: raw.consent_given ?? true,
        consent_date: raw.consent_date ?? null,
        data_retention_expiry: raw.data_retention_expiry ?? null,
        privacy_settings: raw.privacy_settings ?? {
          data_sharing: false,
          analytics: true,
          marketing: false,
        },

        location: raw.location ?? 'Canada',
        age_verified: raw.age_verified ?? true,

        created_at: raw.created_at,
      };

      setCurrentAdmin(withDefaults);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('solvia_admin');
    }
  }
}, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll simulate admin login
      if (email === 'admin@solvia.ca' && password === 'admin123') {
       const adminUser: User = {
  // ids & identity
  id: 'admin-1',
  email: 'admin@solvia.ca',
  name: 'System Administrator',

  // profile (required by your User type)
  joinDate: new Date('2024-01-01T00:00:00Z').toISOString(),
  timezone: 'UTC-5',
  theme: 'light',
  preferences: {
    dailyReminders: true,
    weeklyReports: true,
    emailNotifications: false,
    darkMode: false,
    autoSave: true,
  },

  // admin-facing
  role: 'admin',
  status: 'active',
  last_login: new Date().toISOString(),

  // privacy/compliance
  consent_given: true,
  consent_date: new Date('2024-01-01T00:00:00Z').toISOString(),
  data_retention_expiry: null,
  privacy_settings: {
    data_sharing: false,
    analytics: true,
    marketing: false,
  },

  // misc
  location: 'Canada',
  age_verified: true,

  // optional extras
  created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
};


        setCurrentAdmin(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('solvia_admin', JSON.stringify(adminUser));
        
        await logAction('admin_login', 'system', 'admin-panel', 'Administrator logged in');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (currentAdmin) {
      logAction('admin_logout', 'system', 'admin-panel', 'Administrator logged out');
    }
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('solvia_admin');
  };

  const logAction = async (action: string, targetType: string, targetId: string, details: string) => {
    if (!currentAdmin) return;

    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      admin_id: currentAdmin.id,
      admin_name: currentAdmin.name,
      action,
      target_type: targetType as any,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
      ip_address: '192.168.1.1', // In real app, get actual IP
      compliance_category: 'user_management'
    };

    // In real implementation, save to database
    console.log('Audit Log:', auditLog);
  };

  const checkPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    
    // Admin has all permissions
    if (currentAdmin.role === 'admin') return true;
    
    // Define role-based permissions
    const permissions: Record<string, string[]> = {
      moderator: ['view_users', 'moderate_content', 'view_reports'],
      admin: ['*'] // All permissions
    };

    // Only check permissions for roles defined in the permissions object
    if (permissions.hasOwnProperty(currentAdmin.role)) {
      const rolePermissions = permissions[currentAdmin.role];
      // If '*' is present, grant all permissions
      if (rolePermissions.includes('*')) return true;
      return rolePermissions.includes(permission);
    }
    // If role is not defined, deny permission
    return false;
  };

  return (
    <AdminContext.Provider value={{
      currentAdmin,
      isAuthenticated,
      login,
      logout,
      logAction,
      checkPermission
    }}>
      {children}
    </AdminContext.Provider>
  );
};