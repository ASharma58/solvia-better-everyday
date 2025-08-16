const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    dailyReminders: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
    autoSave: { type: Boolean, default: true },
  },
  { _id: false }
);

const privacySettingsSchema = new mongoose.Schema(
  {
    data_sharing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Core auth/profile
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value),
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      },
    },
    joinDate: { type: Date, default: Date.now },
    timezone: { type: String, default: "UTC-5" },
    theme: { type: String, default: "light" },
    preferences: { type: preferencesSchema, default: () => ({}) },

    // Admin-facing
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending_verification", "deactivated"],
      default: "active",
    },
    last_login: { type: Date, default: null },

    // Privacy/compliance
    consent_given: { type: Boolean, default: false },
    consent_date: { type: Date, default: null },
    data_retention_expiry: { type: Date, default: null },
    privacy_settings: { type: privacySettingsSchema, default: () => ({}) },

    // Misc (shown in admin UI)
    location: { type: String, default: "" },
    age_verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Clean JSON shape for API
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    if (ret.createdAt) ret.created_at = ret.createdAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
