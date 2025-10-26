// Revolutionary Authentication System
interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  location: string;
  experience: string;
  primarySkill: string;
  createdAt: string;
}

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthenticationService {
  private readonly STORAGE_KEY = 'jobfinder_auth';
  private readonly USERS_KEY = 'jobfinder_users';

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Demo account
      if (email === 'jmunuswa@gmail.com' && password === 'Closer@82') {
        const demoUser: AuthUser = {
          id: 'demo-user-1',
          fullName: 'Jayakumar M',
          email: 'jmunuswa@gmail.com',
          location: 'Bangalore, Karnataka',
          experience: '12+',
          primarySkill: 'QA Testing',
          createdAt: new Date().toISOString()
        };

        this.setCurrentUser(demoUser);
        return { success: true, user: demoUser };
      }

      // Check registered users
      const users = this.getUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        this.setCurrentUser(user);
        return { success: true, user };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  }

  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    location: string;
    experience: string;
    primarySkill: string;
  }): Promise<AuthResult> {
    try {
      const users = this.getUsers();

      // Check if user already exists
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' };
      }

      const newUser: AuthUser = {
        id: \`user-\${Date.now()}\`,
        fullName: userData.fullName,
        email: userData.email,
        location: userData.location,
        experience: userData.experience,
        primarySkill: userData.primarySkill,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this.setUsers(users);
      this.setCurrentUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  getCurrentUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private setCurrentUser(user: AuthUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private getUsers(): AuthUser[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  private setUsers(users: AuthUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
}

export const authService = new AuthenticationService();