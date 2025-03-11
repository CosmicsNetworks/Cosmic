import { 
  users, type User, type InsertUser,
  premiumCodes, type PremiumCode, type InsertPremiumCode,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  ticketReplies, type TicketReply, type InsertTicketReply,
  announcements, type Announcement, type InsertAnnouncement,
  searchHistory, type SearchHistory, type InsertSearchHistory,
  userSettings, type UserSettings, type InsertUserSettings,
  tabCloaking, type TabCloaking, type InsertTabCloaking
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  verifyUser(id: number): Promise<User | undefined>;
  setUserPremium(id: number, isPremium: boolean, expiryDate?: Date): Promise<User | undefined>;
  isUserPremium(id: number): Promise<boolean>;
  
  // Premium code management
  createPremiumCode(code: InsertPremiumCode): Promise<PremiumCode>;
  getPremiumCode(code: string): Promise<PremiumCode | undefined>;
  redeemPremiumCode(code: string, userId: number): Promise<PremiumCode | undefined>;
  listPremiumCodes(): Promise<PremiumCode[]>;
  
  // Support ticket management
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  updateSupportTicket(id: number, ticketData: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  listSupportTickets(userId?: number): Promise<SupportTicket[]>;
  
  // Ticket reply management
  createTicketReply(reply: InsertTicketReply): Promise<TicketReply>;
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  
  // Announcement management
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  listAnnouncements(publishedOnly?: boolean): Promise<Announcement[]>;
  updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement | undefined>;
  
  // Search history management
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getUserSearchHistory(userId: number): Promise<SearchHistory[]>;
  deleteSearchHistory(id: number): Promise<boolean>;
  clearUserSearchHistory(userId: number): Promise<boolean>;
  
  // User settings management
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Tab cloaking management
  getTabCloaking(userId: number): Promise<TabCloaking | undefined>;
  createTabCloaking(cloaking: InsertTabCloaking): Promise<TabCloaking>;
  updateTabCloaking(userId: number, cloaking: Partial<TabCloaking>): Promise<TabCloaking | undefined>;
}

export class MemStorage implements IStorage {
  // Maps to store our data
  private users: Map<number, User>;
  private premiumCodes: Map<number, PremiumCode>;
  private supportTickets: Map<number, SupportTicket>;
  private ticketReplies: Map<number, TicketReply>;
  private announcements: Map<number, Announcement>;
  private searchHistories: Map<number, SearchHistory>;
  private userSettings: Map<number, UserSettings>;
  private tabCloakings: Map<number, TabCloaking>;
  
  // Auto-incrementing IDs
  private userIdCounter: number;
  private premiumCodeIdCounter: number;
  private supportTicketIdCounter: number;
  private ticketReplyIdCounter: number;
  private announcementIdCounter: number;
  private searchHistoryIdCounter: number;
  private userSettingsIdCounter: number;
  private tabCloakingIdCounter: number;
  private ticketIdCounter: number; // For custom ticket IDs (TKT-XXXXX)

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.premiumCodes = new Map();
    this.supportTickets = new Map();
    this.ticketReplies = new Map();
    this.announcements = new Map();
    this.searchHistories = new Map();
    this.userSettings = new Map();
    this.tabCloakings = new Map();
    
    // Initialize counters
    this.userIdCounter = 1;
    this.premiumCodeIdCounter = 1;
    this.supportTicketIdCounter = 1;
    this.ticketReplyIdCounter = 1;
    this.announcementIdCounter = 1;
    this.searchHistoryIdCounter = 1;
    this.userSettingsIdCounter = 1;
    this.tabCloakingIdCounter = 1;
    this.ticketIdCounter = 10000; // Start ticket IDs at 10000
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      verificationToken: this.generateRandomToken(),
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: now,
      lastLogin: null,
      isPremium: false,
      premiumExpiry: null,
      role: 'user',
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {...user, ...userData};
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async verifyUser(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const verifiedUser = {...user, isVerified: true, verificationToken: null};
    this.users.set(id, verifiedUser);
    return verifiedUser;
  }
  
  async setUserPremium(id: number, isPremium: boolean, expiryDate?: Date): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user, 
      isPremium, 
      premiumExpiry: expiryDate,
    };
    
    this.users.set(id, updatedUser);
    
    // Also update user settings to enable premium features
    const settings = await this.getUserSettings(id);
    if (settings) {
      await this.updateUserSettings(id, {
        advancedSearchTools: isPremium,
        instantResults: isPremium,
      });
    }
    
    return updatedUser;
  }
  
  async isUserPremium(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    
    // If user is premium and expiry date is in the future (or undefined for unlimited)
    if (user.isPremium && (!user.premiumExpiry || new Date(user.premiumExpiry) > new Date())) {
      return true;
    }
    
    // If premium expired, update user status
    if (user.isPremium && user.premiumExpiry && new Date(user.premiumExpiry) <= new Date()) {
      await this.setUserPremium(id, false);
    }
    
    return false;
  }
  
  // Premium code management
  async createPremiumCode(insertCode: InsertPremiumCode): Promise<PremiumCode> {
    const id = this.premiumCodeIdCounter++;
    const now = new Date();
    
    const code: PremiumCode = {
      ...insertCode,
      id,
      createdAt: now,
      isUsed: false,
    };
    
    this.premiumCodes.set(id, code);
    return code;
  }
  
  async getPremiumCode(codeStr: string): Promise<PremiumCode | undefined> {
    return Array.from(this.premiumCodes.values()).find(
      (code) => code.code === codeStr,
    );
  }
  
  async redeemPremiumCode(codeStr: string, userId: number): Promise<PremiumCode | undefined> {
    const code = await this.getPremiumCode(codeStr);
    if (!code || code.isUsed) return undefined;
    
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const now = new Date();
    
    // Calculate expiry date based on duration hours
    const expiryDate = new Date(now);
    expiryDate.setHours(expiryDate.getHours() + code.durationHours);
    
    // Update code as used
    const updatedCode: PremiumCode = {
      ...code,
      isUsed: true,
      usedBy: userId,
      usedAt: now,
    };
    
    this.premiumCodes.set(code.id, updatedCode);
    
    // Set user as premium
    await this.setUserPremium(userId, true, expiryDate);
    
    return updatedCode;
  }
  
  async listPremiumCodes(): Promise<PremiumCode[]> {
    return Array.from(this.premiumCodes.values());
  }
  
  // Support ticket management
  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketIdCounter++;
    const now = new Date();
    
    // Generate ticket ID in format TKT-12345
    const ticketId = `TKT-${this.ticketIdCounter++}`;
    
    const ticket: SupportTicket = {
      ...insertTicket,
      id,
      ticketId,
      createdAt: now,
      updatedAt: now,
    };
    
    this.supportTickets.set(id, ticket);
    return ticket;
  }
  
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }
  
  async updateSupportTicket(id: number, ticketData: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = await this.getSupportTicket(id);
    if (!ticket) return undefined;
    
    const now = new Date();
    const resolvedAt = ticketData.status === 'resolved' && ticket.status !== 'resolved' 
      ? now 
      : ticket.resolvedAt;
    
    const updatedTicket = {
      ...ticket,
      ...ticketData,
      updatedAt: now,
      resolvedAt,
    };
    
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  async listSupportTickets(userId?: number): Promise<SupportTicket[]> {
    const tickets = Array.from(this.supportTickets.values());
    
    if (userId) {
      return tickets.filter(ticket => ticket.userId === userId);
    }
    
    return tickets;
  }
  
  // Ticket reply management
  async createTicketReply(insertReply: InsertTicketReply): Promise<TicketReply> {
    const id = this.ticketReplyIdCounter++;
    const now = new Date();
    
    const reply: TicketReply = {
      ...insertReply,
      id,
      createdAt: now,
    };
    
    this.ticketReplies.set(id, reply);
    
    // Update ticket's updatedAt timestamp
    const ticket = await this.getSupportTicket(insertReply.ticketId);
    if (ticket) {
      await this.updateSupportTicket(ticket.id, { updatedAt: now });
    }
    
    return reply;
  }
  
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return Array.from(this.ticketReplies.values())
      .filter(reply => reply.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  // Announcement management
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementIdCounter++;
    const now = new Date();
    
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      createdAt: now,
    };
    
    this.announcements.set(id, announcement);
    return announcement;
  }
  
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }
  
  async listAnnouncements(publishedOnly: boolean = false): Promise<Announcement[]> {
    const allAnnouncements = Array.from(this.announcements.values());
    
    if (publishedOnly) {
      const now = new Date();
      return allAnnouncements.filter(a => 
        a.isPublished && 
        (!a.expiresAt || new Date(a.expiresAt) > now)
      );
    }
    
    return allAnnouncements;
  }
  
  async updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = await this.getAnnouncement(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement = {...announcement, ...data};
    
    // If publishing for the first time, set publishedAt
    if (data.isPublished && !announcement.isPublished) {
      updatedAnnouncement.publishedAt = new Date();
    }
    
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  // Search history management
  async addSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchHistoryIdCounter++;
    const now = new Date();
    
    const history: SearchHistory = {
      ...insertHistory,
      id,
      timestamp: now,
    };
    
    this.searchHistories.set(id, history);
    return history;
  }
  
  async getUserSearchHistory(userId: number): Promise<SearchHistory[]> {
    return Array.from(this.searchHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async deleteSearchHistory(id: number): Promise<boolean> {
    return this.searchHistories.delete(id);
  }
  
  async clearUserSearchHistory(userId: number): Promise<boolean> {
    const userHistories = await this.getUserSearchHistory(userId);
    
    for (const history of userHistories) {
      this.searchHistories.delete(history.id);
    }
    
    return true;
  }
  
  // User settings management
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId,
    );
  }
  
  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.userSettingsIdCounter++;
    
    const settings: UserSettings = {
      ...insertSettings,
      id,
    };
    
    this.userSettings.set(id, settings);
    return settings;
  }
  
  async updateUserSettings(userId: number, settingsData: Partial<UserSettings>): Promise<UserSettings | undefined> {
    let settings = await this.getUserSettings(userId);
    
    // If no settings exist for this user, create default settings first
    if (!settings) {
      settings = await this.createUserSettings({
        userId,
        theme: 'dark',
        fontSize: 'medium',
        motionEffects: true,
        saveHistory: true,
        autoClearHistory: 'never',
        preloading: true,
        proxyMethod: 'auto',
        enableNotifications: true,
        advancedSearchTools: false,
        instantResults: false,
      });
    }
    
    const updatedSettings = {...settings, ...settingsData};
    this.userSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
  
  // Tab cloaking management
  async getTabCloaking(userId: number): Promise<TabCloaking | undefined> {
    return Array.from(this.tabCloakings.values()).find(
      (cloaking) => cloaking.userId === userId,
    );
  }
  
  async createTabCloaking(insertCloaking: InsertTabCloaking): Promise<TabCloaking> {
    const id = this.tabCloakingIdCounter++;
    
    const cloaking: TabCloaking = {
      ...insertCloaking,
      id,
    };
    
    this.tabCloakings.set(id, cloaking);
    return cloaking;
  }
  
  async updateTabCloaking(userId: number, cloakingData: Partial<TabCloaking>): Promise<TabCloaking | undefined> {
    let cloaking = await this.getTabCloaking(userId);
    
    // If no cloaking settings exist for this user, create default settings first
    if (!cloaking) {
      cloaking = await this.createTabCloaking({
        userId,
        title: 'Google Classroom',
        iconType: 'classroom',
      });
    }
    
    const updatedCloaking = {...cloaking, ...cloakingData};
    this.tabCloakings.set(cloaking.id, updatedCloaking);
    return updatedCloaking;
  }
  
  // Helper methods
  private generateRandomToken(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }
}

export const storage = new MemStorage();
