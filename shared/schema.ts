import { pgTable, text, serial, integer, boolean, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced users table with email and additional fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  isPremium: boolean("is_premium").default(false),
  premiumExpiry: timestamp("premium_expiry"),
  role: text("role").default("user").notNull(), // user, admin, moderator
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  activeSession: text("active_session"),
  suspended: boolean("suspended").default(false),
  suspensionReason: text("suspension_reason"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Premium codes table for redeeming premium access
export const premiumCodes = pgTable("premium_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  duration: text("duration").notNull(), // "1hour", "1day", "1week", "1month"
  durationHours: integer("duration_hours").notNull(), // Numeric duration in hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  usedBy: integer("used_by").references(() => users.id),
  usedAt: timestamp("used_at"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertPremiumCodeSchema = createInsertSchema(premiumCodes).pick({
  code: true,
  duration: true, 
  durationHours: true,
  expiresAt: true,
  notes: true,
  createdBy: true,
  isActive: true,
});

export type InsertPremiumCode = z.infer<typeof insertPremiumCodeSchema>;
export type PremiumCode = typeof premiumCodes.$inferSelect;

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(), // Format: TKT-12345
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open").notNull(), // open, pending, resolved, closed
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  category: text("category").default("general").notNull(), // general, technical, billing, etc.
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  internalNotes: text("internal_notes"), // Admin-only notes
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  subject: true,
  description: true,
  status: true,
  priority: true,
  category: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Support ticket replies
export const ticketReplies = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  attachments: json("attachments"), // JSON array of attachment URLs
  isInternal: boolean("is_internal").default(false), // Internal notes visible only to staff
});

export const insertTicketReplySchema = createInsertSchema(ticketReplies).pick({
  ticketId: true,
  userId: true,
  message: true,
  isAdmin: true,
  attachments: true,
  isInternal: true,
});

export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;
export type TicketReply = typeof ticketReplies.$inferSelect;

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("general").notNull(), // general, maintenance, update, premium
  audience: text("audience").default("all").notNull(), // all, premium, admin
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  createdBy: integer("created_by").references(() => users.id),
  pinned: boolean("pinned").default(false),
  media: json("media"), // JSON array of media URLs
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  type: true,
  audience: true,
  isPublished: true,
  publishedAt: true,
  expiresAt: true,
  createdBy: true,
  pinned: true,
  media: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// System update logs
export const updateLogs = pgTable("update_logs", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  changes: json("changes").notNull(), // JSON array of change descriptions
  releaseDate: timestamp("release_date").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  isPublished: boolean("is_published").default(false).notNull(),
});

export const insertUpdateLogSchema = createInsertSchema(updateLogs).pick({
  version: true,
  title: true,
  description: true,
  changes: true,
  releaseDate: true,
  createdBy: true,
  isPublished: true,
});

export type InsertUpdateLog = z.infer<typeof insertUpdateLogSchema>;
export type UpdateLog = typeof updateLogs.$inferSelect;

// Custom pages like FAQ, Terms, etc.
export const customPages = pgTable("custom_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // URL path like "about-us"
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  showInMenu: boolean("show_in_menu").default(true).notNull(),
  menuOrder: integer("menu_order").default(0),
  parentId: integer("parent_id"), // For submenus, use separate setter for reference
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const insertCustomPageSchema = createInsertSchema(customPages).pick({
  title: true,
  slug: true,
  content: true,
  isPublished: true,
  showInMenu: true,
  menuOrder: true,
  parentId: true,
  createdBy: true,
  updatedBy: true,
  metaTitle: true,
  metaDescription: true,
});

export type InsertCustomPage = z.infer<typeof insertCustomPageSchema>;
export type CustomPage = typeof customPages.$inferSelect;

// History records for proxy searches
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  icon: text("icon").default("globe"),
  keywords: text("keywords"), // Extracted keywords from search
  category: text("category"), // Categorized search (e.g., videos, images, shopping)
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  title: true,
  url: true,
  icon: true,
  keywords: true,
  category: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// User settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  theme: text("theme").default("dark").notNull(),
  fontSize: text("fontSize").default("medium").notNull(),
  motionEffects: boolean("motion_effects").default(true).notNull(),
  saveHistory: boolean("save_history").default(true).notNull(),
  autoClearHistory: text("auto_clear_history").default("never").notNull(),
  preloading: boolean("preloading").default(true).notNull(),
  proxyMethod: text("proxy_method").default("auto").notNull(),
  enableNotifications: boolean("enable_notifications").default(true).notNull(),
  advancedSearchTools: boolean("advanced_search_tools").default(false).notNull(), // Premium feature
  instantResults: boolean("instant_results").default(false).notNull(), // Premium feature
  extendedHistory: boolean("extended_history").default(false).notNull(), // Premium feature
  customTheme: text("custom_theme"), // Premium feature - JSON string of custom theme colors
  priorityProxy: boolean("priority_proxy").default(false).notNull(), // Premium feature - faster proxy
  customHomepage: text("custom_homepage"), // Premium feature
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  theme: true,
  fontSize: true,
  motionEffects: true,
  saveHistory: true,
  autoClearHistory: true,
  preloading: true,
  proxyMethod: true,
  enableNotifications: true,
  advancedSearchTools: true,
  instantResults: true,
  extendedHistory: true,
  customTheme: true,
  priorityProxy: true,
  customHomepage: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Tab cloaking settings
export const tabCloaking = pgTable("tab_cloaking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").default("Google Classroom").notNull(),
  iconType: text("icon_type").default("classroom").notNull(),
  customIconUrl: text("custom_icon_url"),
  favicon: text("favicon"), // Base64 encoded favicon
  customCSS: text("custom_css"), // Premium feature - custom CSS
});

export const insertTabCloakingSchema = createInsertSchema(tabCloaking).pick({
  userId: true,
  title: true,
  iconType: true,
  customIconUrl: true,
  favicon: true,
  customCSS: true,
});

export type InsertTabCloaking = z.infer<typeof insertTabCloakingSchema>;
export type TabCloaking = typeof tabCloaking.$inferSelect;

// Admin activity logs
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // e.g., "created_premium_code", "suspended_user"
  details: json("details").notNull(), // JSON details of the action
  targetType: text("target_type"), // e.g., "user", "premium_code", "ticket"
  targetId: integer("target_id"), // ID of the target entity
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
});

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).pick({
  adminId: true,
  action: true,
  details: true,
  targetType: true,
  targetId: true,
  ipAddress: true,
});

export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;

// User notifications
export const userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info").notNull(), // info, warning, success, error
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  link: text("link"), // Optional link to redirect to when clicked
  source: text("source").default("system").notNull(), // system, admin, ticket, etc.
  sourceId: integer("source_id"), // ID of the source entity if applicable
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  link: true,
  source: true,
  sourceId: true,
});

export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
