import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertPremiumCodeSchema, insertSupportTicketSchema, insertTicketReplySchema } from "@shared/schema";
import { z } from "zod";
import cookieParser from "cookie-parser";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Secret key for JWT signing (in production, use environment variables)
const JWT_SECRET = "cosmiclink_secret_key";
const JWT_EXPIRES_IN = "7d";
const LOADING_DELAY_NON_PREMIUM = 4000; // 4 seconds delay for non-premium users

// Types for request with authenticated user
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Use cookie parser
  app.use(cookieParser());

  // Middleware to verify JWT token
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const tokenFromCookie = req.cookies && req.cookies.token;
      if (!tokenFromCookie) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    try {
      const tokenToVerify = token || req.cookies.token;
      const decoded = jwt.verify(tokenToVerify, JWT_SECRET) as { id: number; username: string; email: string; role: string };
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  // Admin middleware
  const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Premium user middleware
  const checkPremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isPremium = await storage.isUserPremium(req.user.id);
    if (!isPremium) {
      return res.status(403).json({ error: 'Premium access required' });
    }

    next();
  };

  // ------------------------
  // Health Check Endpoint
  // ------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'CosmicLink proxy service is running',
      timestamp: new Date().toISOString()
    });
  });

  // ------------------------
  // Auth Endpoints
  // ------------------------

  // Register a new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.extend({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }).parse(req.body);

      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with hashed password
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      });

      // Create default settings for the user
      await storage.createUserSettings({
        userId: user.id,
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

      // Create default tab cloaking settings
      await storage.createTabCloaking({
        userId: user.id,
        title: 'Google Classroom',
        iconType: 'classroom',
      });

      // Return success without sensitive data
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Error registering user' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });

      //Check if 2FA is enabled
      if(user.twoFactorEnabled){
        return res.json({message: "2FA enabled, please validate", userId: user.id});
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Set token in cookie
      res.cookie('token', jwtToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      // Check premium status
      const isPremium = await storage.isUserPremium(user.id);

      // Return token and user info
      res.json({
        message: 'Login successful',
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isPremium,
          role: user.role,
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Error during login' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user info
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPremium = await storage.isUserPremium(user.id);
      const settings = await storage.getUserSettings(user.id);
      const tabCloaking = await storage.getTabCloaking(user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isPremium,
          role: user.role,
          settings,
          tabCloaking,
        }
      });
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ error: 'Error fetching user data' });
    }
  });

  // Setup 2FA for a user
  app.post('/api/auth/2fa/setup', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to enable 2FA' });
      }

      // Verify user's password before proceeding with 2FA setup
      const user = await storage.getUserByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `CosmicLink:${user.username}`
      });

      // Generate QR code for the secret
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate recovery codes
      const recoveryCodes = [];
      for (let i = 0; i < 8; i++) {
        recoveryCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      // Save the secret and recovery codes to the database
      await storage.updateUser(user.id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false,
        twoFactorRecoveryCodes: JSON.stringify(recoveryCodes)
      });

      res.json({
        message: '2FA setup initiated',
        secret: secret.base32,
        qrCodeUrl,
        recoveryCodes
      });
    } catch (err) {
      console.error('2FA setup error:', err);
      res.status(500).json({ error: 'Error setting up 2FA' });
    }
  });

  // Verify and enable 2FA
  app.post('/api/auth/2fa/verify', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const user = await storage.getUserByUsername(req.user.username);
      if (!user || !user.twoFactorSecret) {
        return res.status(404).json({ error: '2FA setup not initiated' });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow a variance of 1 step (30 seconds before and after)
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid 2FA token' });
      }

      // Enable 2FA for the user
      await storage.updateUser(user.id, {
        twoFactorEnabled: true
      });

      res.json({
        message: '2FA has been enabled successfully'
      });
    } catch (err) {
      console.error('2FA verification error:', err);
      res.status(500).json({ error: 'Error verifying 2FA token' });
    }
  });

  // Disable 2FA
  app.post('/api/auth/2fa/disable', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { password, token } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to disable 2FA' });
      }

      const user = await storage.getUserByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // If 2FA is enabled, require a valid token to disable it
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        if (!token) {
          return res.status(400).json({ error: '2FA token is required' });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 1
        });

        if (!verified) {
          return res.status(400).json({ error: 'Invalid 2FA token' });
        }
      }

      // Disable 2FA for the user
      await storage.updateUser(user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: null
      });

      res.json({
        message: '2FA has been disabled successfully'
      });
    } catch (err) {
      console.error('2FA disable error:', err);
      res.status(500).json({ error: 'Error disabling 2FA' });
    }
  });

  // Validate 2FA during login
  app.post('/api/auth/2fa/validate', async (req, res) => {
    try {
      const { username, token, recoveryCode } = req.body;

      if (!username || (!token && !recoveryCode)) {
        return res.status(400).json({ error: 'Username and token or recovery code are required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(404).json({ error: 'User not found or 2FA not enabled' });
      }

      let isValid = false;

      // Check if a token was provided
      if (token) {
        isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 1
        });
      }

      // Check if a recovery code was provided
      if (!isValid && recoveryCode) {
        const recoveryCodes = JSON.parse(user.twoFactorRecoveryCodes || '[]');
        const recoveryCodeIndex = recoveryCodes.indexOf(recoveryCode);

        if (recoveryCodeIndex !== -1) {
          // Remove the used recovery code
          recoveryCodes.splice(recoveryCodeIndex, 1);
          await storage.updateUser(user.id, {
            twoFactorRecoveryCodes: JSON.stringify(recoveryCodes)
          });
          isValid = true;
        }
      }

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid 2FA token or recovery code' });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Set token in cookie
      res.cookie('token', jwtToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Check premium status
      const isPremium = await storage.isUserPremium(user.id);

      // Return token and user info
      res.json({
        message: '2FA validation successful',
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isPremium,
          role: user.role,
        }
      });
    } catch (err) {
      console.error('2FA validation error:', err);
      res.status(500).json({ error: 'Error validating 2FA token' });
    }
  });

  // ------------------------
  // Premium Code Endpoints
  // ------------------------

  // Redeem a premium code
  app.post('/api/premium/redeem', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      // Check if the code exists and is valid
      const premiumCode = await storage.getPremiumCode(code);

      if (!premiumCode) {
        return res.status(404).json({ error: 'Invalid code' });
      }

      if (premiumCode.isUsed) {
        return res.status(400).json({ error: 'Code has already been used' });
      }

      const now = new Date();
      if (new Date(premiumCode.expiresAt) < now) {
        return res.status(400).json({ error: 'Code has expired' });
      }

      // Redeem the code
      const redeemedCode = await storage.redeemPremiumCode(code, req.user.id);

      if (!redeemedCode) {
        return res.status(500).json({ error: 'Error redeeming code' });
      }

      // Get updated premium status
      const user = await storage.getUser(req.user.id);
      const isPremium = await storage.isUserPremium(req.user.id);

      res.json({
        message: 'Premium code redeemed successfully',
        premiumStatus: {
          isPremium,
          expiresAt: user?.premiumExpiry,
          duration: redeemedCode.duration,
        }
      });
    } catch (err) {
      console.error('Redeem code error:', err);
      res.status(500).json({ error: 'Error redeeming premium code' });
    }
  });

  // Get premium status
  app.get('/api/premium/status', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPremium = await storage.isUserPremium(user.id);

      res.json({
        isPremium,
        expiresAt: user.premiumExpiry,
      });
    } catch (err) {
      console.error('Premium status error:', err);
      res.status(500).json({ error: 'Error fetching premium status' });
    }
  });

  // (Admin) Generate premium code
  app.post('/api/admin/premium/generate', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { duration, durationHours, notes } = req.body;

      if (!duration || !durationHours) {
        return res.status(400).json({ error: 'Duration and durationHours are required' });
      }

      // Generate a random code
      function generatePremiumCode() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid similar-looking characters
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
      }

      const code = generatePremiumCode();

      // Calculate expiry date (when the code becomes invalid if not used)
      const now = new Date();
      const codeExpiryDate = new Date(now);
      codeExpiryDate.setDate(codeExpiryDate.getDate() + 30); // Code expires in 30 days if not used

      const premiumCode = await storage.createPremiumCode({
        code,
        duration,
        durationHours,
        expiresAt: codeExpiryDate,
        notes: notes || null,
      });

      res.json({
        message: 'Premium code generated successfully',
        code: premiumCode,
      });
    } catch (err) {
      console.error('Generate code error:', err);
      res.status(500).json({ error: 'Error generating premium code' });
    }
  });

  // (Admin) List all premium codes
  app.get('/api/admin/premium/codes', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const codes = await storage.listPremiumCodes();
      res.json({ codes });
    } catch (err) {
      console.error('List codes error:', err);
      res.status(500).json({ error: 'Error listing premium codes' });
    }
  });

  // ------------------------
  // User Settings Endpoints
  // ------------------------

  // Get user settings
  app.get('/api/settings', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        // Create default settings if not found
        const newSettings = await storage.createUserSettings({
          userId: req.user.id,
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

        return res.json({ settings: newSettings });
      }

      res.json({ settings });
    } catch (err) {
      console.error('Get settings error:', err);
      res.status(500).json({ error: 'Error fetching user settings' });
    }
  });

  // Update user settings
  app.patch('/api/settings', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const updatedSettings = await storage.updateUserSettings(req.user.id, req.body);
      if (!updatedSettings) {
        return res.status(404).json({ error: 'Settings not found' });
      }

      res.json({ settings: updatedSettings });
    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({ error: 'Error updating user settings' });
    }
  });

  // ------------------------
  // Tab Cloaking Endpoints
  // ------------------------

  // Get tab cloaking settings
  app.get('/api/tab-cloaking', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const cloaking = await storage.getTabCloaking(req.user.id);
      if (!cloaking) {
        // Create default cloaking settings if not found
        const newCloaking = await storage.createTabCloaking({
          userId: req.user.id,
          title: 'Google Classroom',
          iconType: 'classroom',
        });

        return res.json({ cloaking: newCloaking });
      }

      res.json({ cloaking });
    } catch (err) {
      console.error('Get tab cloaking error:', err);
      res.status(500).json({ error: 'Error fetching tab cloaking settings' });
    }
  });

  // Update tab cloaking settings
  app.patch('/api/tab-cloaking', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const updatedCloaking = await storage.updateTabCloaking(req.user.id, req.body);
      if (!updatedCloaking) {
        return res.status(404).json({ error: 'Cloaking settings not found' });
      }

      res.json({ cloaking: updatedCloaking });
    } catch (err) {
      console.error('Update tab cloaking error:', err);
      res.status(500).json({ error: 'Error updating tab cloaking settings' });
    }
  });

  // ------------------------
  // Support Ticket Endpoints
  // ------------------------

  // Create a support ticket
  app.post('/api/support/tickets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const ticket = await storage.createSupportTicket(validatedData);

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticket,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error('Create ticket error:', err);
      res.status(500).json({ error: 'Error creating support ticket' });
    }
  });

  // Get user's support tickets
  app.get('/api/support/tickets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const tickets = await storage.listSupportTickets(req.user.id);

      res.json({ tickets });
    } catch (err) {
      console.error('Get tickets error:', err);
      res.status(500).json({ error: 'Error fetching support tickets' });
    }
  });

  // Get a specific support ticket
  app.get('/api/support/tickets/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if the ticket belongs to the user or user is admin
      if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const replies = await storage.getTicketReplies(ticketId);

      res.json({
        ticket,
        replies,
      });
    } catch (err) {
      console.error('Get ticket error:', err);
      res.status(500).json({ error: 'Error fetching support ticket' });
    }
  });

  // Add a reply to a support ticket
  app.post('/api/support/tickets/:id/replies', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if the ticket belongs to the user or user is admin
      if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const validatedData = insertTicketReplySchema.parse({
        ticketId,
        userId: req.user.id,
        message: req.body.message,
        isAdmin: req.user.role === 'admin',
      });

      const reply = await storage.createTicketReply(validatedData);

      // If admin replies, update ticket status to 'pending' if it was 'open'
      if (req.user.role === 'admin' && ticket.status === 'open') {
        await storage.updateSupportTicket(ticketId, { status: 'pending' });
      }

      // If user replies and ticket was 'resolved' or 'pending', update to 'open'
      if (req.user.role !== 'admin' && (ticket.status === 'resolved' || ticket.status === 'pending')) {
        await storage.updateSupportTicket(ticketId, { status: 'open' });
      }

      res.status(201).json({
        message: 'Reply added successfully',
        reply,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error('Add reply error:', err);
      res.status(500).json({ error: 'Error adding reply to support ticket' });
    }
  });

  // (Admin) List all support tickets
  app.get('/api/admin/support/tickets', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.listSupportTickets();
      res.json({ tickets });
    } catch (err) {
      console.error('List tickets error:', err);
      res.status(500).json({ error: 'Error listing support tickets' });
    }
  });

  // (Admin) Update ticket status
  app.patch('/api/admin/support/tickets/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const { status } = req.body;
      if (!status || !['open', 'pending', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updatedTicket = await storage.updateSupportTicket(ticketId, { status });
      if (!updatedTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({
        message: 'Ticket status updated successfully',
        ticket: updatedTicket,
      });
    } catch (err) {
      console.error('Update ticket error:', err);
      res.status(500).json({ error: 'Error updating ticket status' });
    }
  });

  // ------------------------
  // Announcement Endpoints
  // ------------------------

  // Get published announcements
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.listAnnouncements(true);
      res.json({ announcements });
    } catch (err) {
      console.error('Get announcements error:', err);
      res.status(500).json({ error: 'Error fetching announcements' });
    }
  });

  // (Admin) Create announcement
  app.post('/api/admin/announcements', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, content, type, isPublished, publishedAt, expiresAt } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const announcement = await storage.createAnnouncement({
        title,
        content,
        type: type || 'general',
        isPublished: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement,
      });
    } catch (err) {
      console.error('Create announcement error:', err);
      res.status(500).json({ error: 'Error creating announcement' });
    }
  });

  // (Admin) Update announcement
  app.patch('/api/admin/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      if (isNaN(announcementId)) {
        return res.status(400).json({ error: 'Invalid announcement ID' });
      }

      const updatedAnnouncement = await storage.updateAnnouncement(announcementId, req.body);
      if (!updatedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      res.json({
        message: 'Announcement updated successfully',
        announcement: updatedAnnouncement,
      });
    } catch (err) {
      console.error('Update announcement error:', err);
      res.status(500).json({ error: 'Error updating announcement' });
    }
  });

  // (Admin) List all announcements
  app.get('/api/admin/announcements', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const announcements = await storage.listAnnouncements(false);
      res.json({ announcements });
    } catch (err) {
      console.error('List announcements error:', err);
      res.status(500).json({ error: 'Error listing announcements' });
    }
  });

  // ------------------------
  // Search History Endpoints
  // ------------------------

  // Add search history
  app.post('/api/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { title, url, icon } = req.body;

      if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required' });
      }

      const history = await storage.addSearchHistory({
        userId: req.user.id,
        title,
        url,
        icon: icon || 'globe',
      });

      res.status(201).json({
        message: 'Search history added successfully',
        history,
      });
    } catch (err) {
      console.error('Add history error:', err);
      res.status(500).json({ error: 'Error adding search history' });
    }
  });

  // Get user search history
  app.get('/api/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const history = await storage.getUserSearchHistory(req.user.id);

      res.json({ history });
    } catch (err) {
      console.error('Get history error:', err);
      res.status(500).json({ error: 'Error fetching search history' });
    }
  });

  // Delete search history item
  app.delete('/api/history/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const historyId = parseInt(req.params.id);
      if (isNaN(historyId)) {
        return res.status(400).json({ error: 'Invalid history ID' });
      }

      const success = await storage.deleteSearchHistory(historyId);
      if (!success) {
        return res.status(404).json({ error: 'History item not found' });
      }

      res.json({
        message: 'History item deleted successfully',
      });
    } catch (err) {
      console.error('Delete history error:', err);
      res.status(500).json({ error: 'Error deleting history item' });
    }
  });

  // Clear all search history
  app.delete('/api/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await storage.clearUserSearchHistory(req.user.id);

      res.json({
        message: 'Search history cleared successfully',
      });
    } catch (err) {
      console.error('Clear history error:', err);
      res.status(500).json({ error: 'Error clearing search history' });
    }
  });

  // ------------------------
  // Proxy Endpoint
  // ------------------------

  // Proxy endpoint with loading delay for non-premium users
  app.get('/api/proxy', async (req: AuthRequest, res) => {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    // If user is authenticated, check their premium status
    const isPremium = req.user ? await storage.isUserPremium(req.user.id) : false;

    // For this example, just redirect to the foreverkyx.lavipet.info proxy
    const proxyUrl = `https://foreverkyx.lavipet.info/${encodeURIComponent(url)}`;

    res.json({
      status: 'success',
      proxyUrl,
      isPremium,
      message: 'Ready to proxy the request',
      loadingDelay: isPremium ? 0 : 3000 // No delay for premium users, 3 seconds for non-premium
    });
  });

  // Helper function to generate a random premium code
  function generatePremiumCode(length = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  }

  // ------------------------
  // Admin Account Creation
  // ------------------------

  // Create the admin account (Kyx) - Used once for setup
  app.post('/api/admin/create-owner', async (req, res) => {
    try {
      // Check if admin account already exists
      const existingAdmin = await storage.getUserByUsername("Kyx");

      if (existingAdmin) {
        return res.status(400).json({ error: "Admin account already exists" });
      }

      // Create the admin user with specified credentials
      const hashedPassword = await bcrypt.hash("Kyx2025###", 10);

      const adminUser = await storage.createUser({
        username: "Kyx",
        email: "admin@cosmiclink.com",
        password: hashedPassword,
        role: "admin"
      });

      // Create default settings for the admin
      await storage.createUserSettings({
        userId: adminUser.id,
        theme: 'dark',
        fontSize: 'medium',
        motionEffects: true,
        saveHistory: true,
        autoClearHistory: 'never',
        preloading: true,
        proxyMethod: 'auto',
        enableNotifications: true,
        advancedSearchTools: true,
        instantResults: true,
        extendedHistory: true,
        priorityProxy: true,
      });

      // Create default tab cloaking settings
      await storage.createTabCloaking({
        userId: adminUser.id,
        title: 'Google Classroom',
        iconType: 'classroom',
      });

      // Log admin creation
      console.log("Admin account created successfully");

      return res.status(201).json({ 
        message: "Admin account created successfully",
        username: adminUser.username,
        role: adminUser.role
      });
    } catch (error) {
      console.error("Error creating admin account:", error);
      return res.status(500).json({ error: "Failed to create admin account" });
    }
  });

  // ------------------------
  // User Badge Endpoints
  // ------------------------

  // Get user badges
  app.get('/api/users/badges', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const badges = await storage.getUserBadges(req.user.id);

      res.json({ badges });
    } catch (err) {
      console.error('Get badges error:', err);
      res.status(500).json({ error: 'Error fetching user badges' });
    }
  });

  // (Admin) Award badge to user
  app.post('/api/admin/users/:userId/badges', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { badgeId, reason } = req.body;
      if (!badgeId) {
        return res.status(400).json({ error: 'Badge ID is required' });
      }

      const badge = await storage.awardUserBadge({
        userId,
        badgeId,
        awardedBy: req.user.id,
        awardedAt: new Date(),
        reason: reason || 'Awarded by admin'
      });

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'award_badge',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `Badge awarded to user ${userId}: Badge ID ${badgeId}, Reason: ${reason || 'Awarded by admin'}`
      });

      res.status(201).json({
        message: 'Badge awarded successfully',
        badge
      });
    } catch (err) {
      console.error('Award badge error:', err);
      res.status(500).json({ error: 'Error awarding badge to user' });
    }
  });

  // ------------------------
  // User Activity Logs
  // ------------------------

  // Get user activity logs
  app.get('/api/users/activity', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { logs, totalCount, totalPages } = await storage.getUserActivityLogs(req.user.id, page, limit);

      res.json({
        logs,
        totalCount,
        totalPages,
        currentPage: page
      });
    } catch (err) {
      console.error('Get activity logs error:', err);
      res.status(500).json({ error: 'Error fetching user activity logs' });
    }
  });

  // Get user device sessions
  app.get('/api/users/devices', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const sessions = await storage.getUserSessions(req.user.id);

      res.json({ sessions });
    } catch (err) {
      console.error('Get device sessions error:', err);
      res.status(500).json({ error: 'Error fetching user device sessions' });
    }
  });

  // Revoke specific device session
  app.delete('/api/users/devices/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const sessionId = req.params.sessionId;

      const success = await storage.revokeUserSession(req.user.id, sessionId);

      if (!success) {
        return res.status(404).json({ error: 'Session not found or already revoked' });
      }

      res.json({ 
        message: 'Device session revoked successfully' 
      });
    } catch (err) {
      console.error('Revoke session error:', err);
      res.status(500).json({ error: 'Error revoking device session' });
    }
  });

  // Revoke all device sessions except current
  app.delete('/api/users/devices', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const currentSessionId = req.cookies.sessionId;

      await storage.revokeAllUserSessions(req.user.id, currentSessionId);

      res.json({ 
        message: 'All other device sessions revoked successfully' 
      });
    } catch (err) {
      console.error('Revoke all sessions error:', err);
      res.status(500).json({ error: 'Error revoking device sessions' });
    }
  });

  // ------------------------
  // Premium Feature Controls
  // ------------------------

  // Get user premium feature settings
  app.get('/api/premium/features', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const premiumSettings = await storage.getUserPremiumSettings(req.user.id);

      res.json({ premiumSettings });
    } catch (err) {
      console.error('Get premium settings error:', err);
      res.status(500).json({ error: 'Error fetching premium feature settings' });
    }
  });

  // Update user premium feature settings
  app.patch('/api/premium/features', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const updatedSettings = await storage.updateUserPremiumSettings(req.user.id, req.body);

      res.json({ 
        message: 'Premium settings updated successfully',
        premiumSettings: updatedSettings 
      });
    } catch (err) {
      console.error('Update premium settings error:', err);
      res.status(500).json({ error: 'Error updating premium feature settings' });
    }
  });
  
  // Get premium speed controls
  app.get('/api/premium/speed-controls', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const speedControls = await storage.getUserSpeedControls(req.user.id);

      res.json({ speedControls });
    } catch (err) {
      console.error('Get speed controls error:', err);
      res.status(500).json({ error: 'Error fetching speed controls' });
    }
  });

  // Update premium speed controls
  app.patch('/api/premium/speed-controls', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const updatedControls = await storage.updateUserSpeedControls(req.user.id, req.body);

      res.json({ 
        message: 'Speed controls updated successfully',
        speedControls: updatedControls 
      });
    } catch (err) {
      console.error('Update speed controls error:', err);
      res.status(500).json({ error: 'Error updating speed controls' });
    }
  });
  
  // Toggle premium feature
  app.post('/api/premium/features/toggle/:feature', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const { feature } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Enabled status must be a boolean' });
      }

      const updatedFeature = await storage.togglePremiumFeature(req.user.id, feature, enabled);

      res.json({ 
        message: `Premium feature ${feature} ${enabled ? 'enabled' : 'disabled'} successfully`,
        feature: updatedFeature
      });
    } catch (err) {
      console.error('Toggle premium feature error:', err);
      res.status(500).json({ error: 'Error toggling premium feature' });
    }
  });
  
  // Get user premium ad settings
  app.get('/api/premium/ad-settings', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const adSettings = await storage.getUserAdSettings(req.user.id);

      res.json({ adSettings });
    } catch (err) {
      console.error('Get ad settings error:', err);
      res.status(500).json({ error: 'Error fetching ad settings' });
    }
  });

  // Update user premium ad settings
  app.patch('/api/premium/ad-settings', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const isPremium = await storage.isUserPremium(req.user.id);

      if (!isPremium) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const updatedSettings = await storage.updateUserAdSettings(req.user.id, req.body);

      res.json({ 
        message: 'Ad settings updated successfully',
        adSettings: updatedSettings 
      });
    } catch (err) {
      console.error('Update ad settings error:', err);
      res.status(500).json({ error: 'Error updating ad settings' });
    }
  });
  
  // Get premium badge settings
  app.get('/api/users/badges', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const badges = await storage.getUserBadges(req.user.id);

      res.json({ badges });
    } catch (err) {
      console.error('Get badges error:', err);
      res.status(500).json({ error: 'Error fetching user badges' });
    }
  });
  
  // Toggle badge visibility
  app.patch('/api/users/badges/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const badgeId = parseInt(req.params.id);
      if (isNaN(badgeId)) {
        return res.status(400).json({ error: 'Invalid badge ID' });
      }

      const { isHidden } = req.body;
      if (typeof isHidden !== 'boolean') {
        return res.status(400).json({ error: 'isHidden must be a boolean' });
      }

      const updatedBadge = await storage.updateUserBadgeVisibility(req.user.id, badgeId, isHidden);

      if (!updatedBadge) {
        return res.status(404).json({ error: 'Badge not found or not owned by the user' });
      }

      res.json({ 
        message: `Badge ${isHidden ? 'hidden' : 'shown'} successfully`,
        badge: updatedBadge
      });
    } catch (err) {
      console.error('Update badge visibility error:', err);
      res.status(500).json({ error: 'Error updating badge visibility' });
    }
  });

  // ------------------------
  // FAQ Management
  // ------------------------

  // Get FAQ categories
  app.get('/api/faq/categories', async (req, res) => {
    try {
      const categories = await storage.getFAQCategories();
      res.json({ categories });
    } catch (err) {
      console.error('Get FAQ categories error:', err);
      res.status(500).json({ error: 'Error fetching FAQ categories' });
    }
  });

  // Get FAQs (can be filtered by category)
  app.get('/api/faq', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string;

      const faqs = await storage.getFAQs(categoryId, search);
      res.json({ faqs });
    } catch (err) {
      console.error('Get FAQs error:', err);
      res.status(500).json({ error: 'Error fetching FAQs' });
    }
  });

  // Submit FAQ rating
  app.post('/api/faq/:id/rating', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const faqId = parseInt(req.params.id);
      if (isNaN(faqId)) {
        return res.status(400).json({ error: 'Invalid FAQ ID' });
      }

      const { helpful } = req.body;
      if (helpful === undefined) {
        return res.status(400).json({ error: 'Helpful rating is required' });
      }

      await storage.rateFAQ(faqId, req.user.id, helpful);

      res.json({ message: 'FAQ rating submitted successfully' });
    } catch (err) {
      console.error('Rate FAQ error:', err);
      res.status(500).json({ error: 'Error rating FAQ' });
    }
  });

  // (Admin) Create FAQ
  app.post('/api/admin/faq', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { question, answer, categoryId, isPublished, tags } = req.body;

      if (!question || !answer || !categoryId) {
        return res.status(400).json({ error: 'Question, answer, and category are required' });
      }

      const faq = await storage.createFAQ({
        question,
        answer,
        categoryId,
        isPublished: isPublished !== undefined ? isPublished : true,
        tags: tags || [],
        createdBy: req.user.id,
        updatedBy: req.user.id
      });

      res.status(201).json({
        message: 'FAQ created successfully',
        faq
      });
    } catch (err) {
      console.error('Create FAQ error:', err);
      res.status(500).json({ error: 'Error creating FAQ' });
    }
  });

  // (Admin) Create FAQ category
  app.post('/api/admin/faq/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, description, parentId } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const category = await storage.createFAQCategory({
        name,
        description: description || '',
        parentId: parentId || null,
        createdBy: req.user.id
      });

      res.status(201).json({
        message: 'FAQ category created successfully',
        category
      });
    } catch (err) {
      console.error('Create FAQ category error:', err);
      res.status(500).json({ error: 'Error creating FAQ category' });
    }
  });

  // ------------------------
  // Security Endpoints
  // ------------------------

  // Block IP address
  app.post('/api/admin/security/block-ip', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { ip, reason } = req.body;

      if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
      }

      await storage.blockIPAddress({
        ip,
        reason: reason || 'Manual block by admin',
        blockedBy: req.user.id,
        blockedAt: new Date()
      });

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'ip_block',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `IP blocked: ${ip}, Reason: ${reason || 'Manual block'}`
      });

      res.json({
        message: 'IP address blocked successfully'
      });
    } catch (err) {
      console.error('Error blocking IP address:', err);
      res.status(500).json({ error: 'Error blocking IP address' });
    }
  });

  // Unblock IP address
  app.post('/api/admin/security/unblock-ip', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { ip } = req.body;

      if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
      }

      await storage.unblockIPAddress(ip);

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'ip_unblock',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `IP unblocked: ${ip}`
      });

      res.json({
        message: 'IP address unblocked successfully'
      });
    } catch (err) {
      console.error('Error unblocking IP address:', err);
      res.status(500).json({ error: 'Error unblocking IP address' });
    }
  });

  // Get blocked IPs
  app.get('/api/admin/security/blocked-ips', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const blockedIPs = await storage.getBlockedIPAddresses();

      res.json({ blockedIPs });
    } catch (err) {
      console.error('Error fetching blocked IPs:', err);
      res.status(500).json({ error: 'Error fetching blocked IP addresses' });
    }
  });

  // Get security alerts
  app.get('/api/admin/security/alerts', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { alerts, totalCount, totalPages } = await storage.getSecurityAlerts(page, limit);

      res.json({
        alerts,
        totalCount,
        totalPages
      });
    } catch (err) {
      console.error('Error fetching security alerts:', err);
      res.status(500).json({ error: 'Error fetching security alerts' });
    }
  });

  // Add custom security rule
  app.post('/api/admin/security/rules', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, pattern, action } = req.body;

      if (!name || !pattern || !action) {
        return res.status(400).json({ error: 'Name, pattern, and action are required' });
      }

      const rule = await storage.addSecurityRule({
        name,
        pattern,
        action,
        enabled: true,
        createdBy: req.user.id,
        createdAt: new Date()
      });

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'security_rule_add',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `Security rule added: ${name}, Pattern: ${pattern}, Action: ${action}`
      });

      res.status(201).json({
        message: 'Security rule added successfully',
        rule
      });
    } catch (err) {
      console.error('Error adding security rule:', err);
      res.status(500).json({ error: 'Error adding security rule' });
    }
  });

  // Delete custom security rule
  app.delete('/api/admin/security/rules/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const ruleId = parseInt(req.params.id);

      if (isNaN(ruleId)) {
        return res.status(400).json({ error: 'Invalid rule ID' });
      }

      await storage.deleteSecurityRule(ruleId);

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'security_rule_delete',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `Security rule deleted: ID ${ruleId}`
      });

      res.json({
        message: 'Security rule deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting security rule:', err);
      res.status(500).json({ error: 'Error deleting security rule' });
    }
  });

  // Toggle security rule
  app.patch('/api/admin/security/rules/:id/toggle', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const ruleId = parseInt(req.params.id);

      if (isNaN(ruleId)) {
        return res.status(400).json({ error: 'Invalid rule ID' });
      }

      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Enabled status is required' });
      }

      await storage.toggleSecurityRule(ruleId, enabled);

      // Log the action
      await storage.addSecurityLog({
        type: 'admin',
        action: 'security_rule_toggle',
        userId: req.user.id,
        username: req.user.username,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        details: `Security rule ${enabled ? 'enabled' : 'disabled'}: ID ${ruleId}`
      });

      res.json({
        message: `Security rule ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (err) {
      console.error('Error toggling security rule:', err);
      res.status(500).json({ error: 'Error toggling security rule' });
    }
  });

  // Return the HTTP server instance
  return httpServer;
}