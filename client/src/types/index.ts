// History Item type
export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  timestamp: Date;
  keywords?: string;
  category?: string;
}

// User settings type
export interface UserSettings {
  theme: string;
  fontSize: string;
  motionEffects: boolean;
  saveHistory: boolean;
  autoClearHistory: string;
  preloading: boolean;
  proxyMethod: string;
  advancedSearchTools?: boolean;
  instantResults?: boolean;
  enableNotifications?: boolean;
  extendedHistory?: boolean;
  customTheme?: string;
  priorityProxy?: boolean;
  customHomepage?: string;
}

// Default settings
export const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 'medium',
  motionEffects: true,
  saveHistory: true,
  autoClearHistory: 'never',
  preloading: true,
  proxyMethod: 'auto',
  advancedSearchTools: false,
  instantResults: false,
  enableNotifications: true,
  extendedHistory: false,
  priorityProxy: false
};

// Tab cloaking type
export interface TabCloaking {
  title: string;
  iconType: string;
  customIconUrl?: string;
  favicon?: string;
  customCSS?: string;
}

// Default tab cloaking
export const defaultTabCloaking: TabCloaking = {
  title: 'Google Classroom',
  iconType: 'classroom'
};

// Update type for "Latest Updates" section
export interface UpdateLogEntry {
  id: number;
  version: string;
  title: string;
  description: string;
  changes: any[]; // JSON array of change descriptions
  releaseDate: string;
  createdBy: number;
  isPublished: boolean;
}

// Quick links type
export interface QuickLink {
  id: string;
  name: string;
  icon: string;
  url: string;
}

// Feature type for features section
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Help item type for FAQ
export interface HelpItem {
  id: string;
  question: string;
  answer: string;
}

// Custom page
export interface CustomPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  showInMenu: boolean;
  menuOrder: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy?: number;
  metaTitle?: string;
  metaDescription?: string;
}

// Notification type
export interface Notification {
  title: string;
  message: string;
  visible: boolean;
}

// User notification
export interface UserNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  source: string;
  sourceId?: number;
}

// Modal names
export type ModalType = 
  'settings' | 
  'tabCloaker' | 
  'help' | 
  'login' | 
  'signup' | 
  'premium' | 
  'supportTicket' |
  'adminPanel' |
  'announcement' |
  'updateLog' |
  'customPage' |
  null;

// Authentication types
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isPremium: boolean;
  twoFactorEnabled?: boolean;
  isVerified?: boolean;
  suspended?: boolean;
  createdAt: string;
  lastLogin?: string;
  settings?: UserSettings;
  tabCloaking?: TabCloaking;
}

// Premium status
export interface PremiumStatus {
  isPremium: boolean;
  expiresAt?: string;
}

// Premium code
export interface PremiumCode {
  id: number;
  code: string;
  duration: string;
  durationHours: number;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy?: number;
  usedAt?: string;
  notes?: string;
  createdBy?: number;
  isActive: boolean;
}

// Support ticket
export interface SupportTicket {
  id: number;
  ticketId: string;
  userId: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  internalNotes?: string;
}

// Ticket reply
export interface TicketReply {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  attachments?: any[];
  isInternal?: boolean;
}

// Announcement
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  audience: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  createdBy?: number;
  pinned: boolean;
  media?: any[];
}

// Admin activity log
export interface AdminActivityLog {
  id: number;
  adminId: number;
  action: string;
  details: any;
  targetType?: string;
  targetId?: number;
  timestamp: string;
  ipAddress?: string;
}
