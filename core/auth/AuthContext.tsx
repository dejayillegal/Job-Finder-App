'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthenticationService } from '@/core/auth/AuthenticationService';
import { SessionManager } from '@/core/auth/SessionManager';
import { SecurityValidator } from '@/core/security/SecurityValidator';
import { AuditLogger } from '@/core/logging/AuditLogger';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'enterprise' | 'superadmin';
  organizationId?: string;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  profile: {
    firstName: string;
    lastName: string;
    title?: string;
    department?: string;
    location?: string;
    skills: string[];
    experience: number;
    industry?: string;
  };
  security: {
    mfaEnabled: boolean;
    lastLogin?: string;
    loginCount: number;
    failedAttempts: number;
    lockedUntil?: string;
  };
  subscription: {
    plan: 'free' | 'professional' | 'enterprise' | 'custom';
    status: 'active' | 'inactive' | 'suspended' | 'cancelled';
    expiresAt?: string;
    features: string[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastActive?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  isValid: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Authentication methods
  login: (email: string, password: string, options?: LoginOptions) => Promise<AuthResult>;
  logout: (options?: LogoutOptions) => Promise<void>;
  register: (userData: RegistrationData) => Promise<AuthResult>;

  // Session management
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;

  // Security methods
  enableMFA: (method: MFAMethod) => Promise<boolean>;
  disableMFA: () => Promise<boolean>;
  verifyMFA: (code: string) => Promise<boolean>;

  // Profile management
  updateProfile: (updates: Partial<User['profile']>) => Promise<boolean>;
  updatePreferences: (updates: Partial<User['preferences']>) => Promise<boolean>;

  // Security monitoring
  getSecurityEvents: () => Promise<SecurityEvent[]>;
  reportSuspiciousActivity: (details: string) => Promise<void>;
}

interface LoginOptions {
  rememberMe?: boolean;
  mfaCode?: string;
  deviceTrust?: boolean;
}

interface LogoutOptions {
  allDevices?: boolean;
  reason?: 'user_logout' | 'security' | 'expired';
}

interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
  inviteCode?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  requiresMFA?: boolean;
  mfaMethods?: MFAMethod[];
}

interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'hardware';
  verified: boolean;
  backupCodes?: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'mfa_enabled' | 'password_change';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = new AuthenticationService();
  const sessionManager = new SessionManager();
  const securityValidator = new SecurityValidator();
  const auditLogger = new AuditLogger();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const existingSession = await sessionManager.getCurrentSession();

      if (existingSession && await sessionManager.validateSession(existingSession)) {
        const userData = await authService.getUserData(existingSession.user.id);
        setUser(userData);
        setSession(existingSession);

        // Update last active timestamp
        await auditLogger.logActivity('session_restored', {
          userId: userData.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      await logout({ reason: 'security' });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, options: LoginOptions = {}): Promise<AuthResult> => {
    try {
      // Security validation
      const securityCheck = await securityValidator.validateLoginAttempt(email, {
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
      });

      if (!securityCheck.allowed) {
        return {
          success: false,
          error: securityCheck.reason || 'Login attempt blocked for security reasons',
        };
      }

      const result = await authService.authenticate(email, password, options);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);

        await sessionManager.storeSession(result.session);

        await auditLogger.logActivity('login_success', {
          userId: result.user.id,
          email,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent,
        });
      }

      return result;
    } catch (error) {
      await auditLogger.logActivity('login_error', {
        email,
        error: (error as Error).message,
        ipAddress: await getClientIP(),
      });

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  };

  const logout = async (options: LogoutOptions = {}): Promise<void> => {
    try {
      if (session) {
        await authService.revokeSessions(session.user.id, {
          allDevices: options.allDevices,
        });

        await auditLogger.logActivity('logout', {
          userId: session.user.id,
          reason: options.reason || 'user_logout',
          allDevices: options.allDevices,
        });
      }

      await sessionManager.clearSession();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear local state even if server request fails
      await sessionManager.clearSession();
      setUser(null);
      setSession(null);
    }
  };

  const register = async (userData: RegistrationData): Promise<AuthResult> => {
    try {
      const result = await authService.createAccount(userData);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);

        await sessionManager.storeSession(result.session);

        await auditLogger.logActivity('registration_success', {
          userId: result.user.id,
          email: userData.email,
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const newSession = await sessionManager.refreshSession(session.refreshToken);

      if (newSession) {
        setSession(newSession);
        return true;
      }

      return false;
    } catch (error) {
      await logout({ reason: 'expired' });
      return false;
    }
  };

  const validateSession = async (): Promise<boolean> => {
    if (!session) return false;

    return await sessionManager.validateSession(session);
  };

  // Utility function to get client IP (implementation would depend on your setup)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/client-info');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Placeholder implementations for MFA and other advanced features
  const enableMFA = async (method: MFAMethod): Promise<boolean> => {
    // Implementation would integrate with MFA service
    return false;
  };

  const disableMFA = async (): Promise<boolean> => {
    // Implementation would integrate with MFA service
    return false;
  };

  const verifyMFA = async (code: string): Promise<boolean> => {
    // Implementation would verify MFA code
    return false;
  };

  const updateProfile = async (updates: Partial<User['profile']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = await authService.updateUserProfile(user.id, updates);
      setUser(updatedUser);
      return true;
    } catch {
      return false;
    }
  };

  const updatePreferences = async (updates: Partial<User['preferences']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = await authService.updateUserPreferences(user.id, updates);
      setUser(updatedUser);
      return true;
    } catch {
      return false;
    }
  };

  const getSecurityEvents = async (): Promise<SecurityEvent[]> => {
    if (!user) return [];

    try {
      return await authService.getSecurityEvents(user.id);
    } catch {
      return [];
    }
  };

  const reportSuspiciousActivity = async (details: string): Promise<void> => {
    if (!user) return;

    await auditLogger.logActivity('suspicious_activity_reported', {
      userId: user.id,
      details,
      timestamp: new Date().toISOString(),
    });
  };

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,

    login,
    logout,
    register,

    refreshSession,
    validateSession,

    enableMFA,
    disableMFA,
    verifyMFA,

    updateProfile,
    updatePreferences,

    getSecurityEvents,
    reportSuspiciousActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }

  return context;
}