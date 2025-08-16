// frontend/src/types/admin.ts
export interface User {
  id: string;                     // from toJSON transform
  name: string;
  email: string;
  // profile
  joinDate: string;               // ISO
  timezone: string;
  theme: string;
  preferences: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    emailNotifications: boolean;
    darkMode: boolean;
    autoSave: boolean;
  };

  // admin-facing
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  last_login: string | null;      // ISO or null

  // privacy/compliance
  consent_given: boolean;
  consent_date: string | null;    // ISO or null
  data_retention_expiry: string | null; // ISO or null
  privacy_settings: {
    data_sharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };

  // misc
  location: string;
  age_verified: boolean;

  // added by your toJSON transform
  created_at?: string;
}
