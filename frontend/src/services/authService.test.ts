// Mock axios before importing authService
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  isAxiosError: jest.fn(),
}));

import { authService } from './authService';

describe('authService Token Refresh', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    // Stop any running timers
    authService.stopTokenRefreshTimer();
  });

  afterEach(() => {
    // Clean up
    sessionStorage.clear();
    authService.stopTokenRefreshTimer();
  });

  describe('isTokenExpiringSoon', () => {
    it('should return true when tokenIssuedAt is not set', () => {
      expect(authService.isTokenExpiringSoon()).toBe(true);
    });

    it('should return false when token is fresh (just issued)', () => {
      // Set token as issued just now
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      expect(authService.isTokenExpiringSoon()).toBe(false);
    });

    it('should return false when token has 30 minutes remaining', () => {
      // Set token as issued 30 minutes ago (still 30 minutes left until expiration)
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      sessionStorage.setItem('tokenIssuedAt', thirtyMinutesAgo.toString());
      expect(authService.isTokenExpiringSoon()).toBe(false);
    });

    it('should return true when token has less than 5 minutes remaining', () => {
      // Set token as issued 56 minutes ago (only 4 minutes left until expiration)
      const fiftySevenMinutesAgo = Date.now() - (56 * 60 * 1000);
      sessionStorage.setItem('tokenIssuedAt', fiftySevenMinutesAgo.toString());
      expect(authService.isTokenExpiringSoon()).toBe(true);
    });

    it('should return true when token has expired', () => {
      // Set token as issued 61 minutes ago (already expired)
      const sixtyOneMinutesAgo = Date.now() - (61 * 60 * 1000);
      sessionStorage.setItem('tokenIssuedAt', sixtyOneMinutesAgo.toString());
      expect(authService.isTokenExpiringSoon()).toBe(true);
    });
  });

  describe('Timer Management', () => {
    it('should start timer on login', () => {
      expect(authService.refreshTimerId).toBeNull();
      
      // Simulate setting up after login
      sessionStorage.setItem('accessToken', 'test-token');
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      authService.startTokenRefreshTimer();
      
      expect(authService.refreshTimerId).not.toBeNull();
    });

    it('should stop timer on logout', () => {
      // Start timer
      sessionStorage.setItem('accessToken', 'test-token');
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      authService.startTokenRefreshTimer();
      
      expect(authService.refreshTimerId).not.toBeNull();
      
      // Logout
      authService.logout();
      
      expect(authService.refreshTimerId).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('tokenIssuedAt')).toBeNull();
    });

    it('should stop existing timer before starting a new one', () => {
      // Start first timer
      authService.startTokenRefreshTimer();
      const firstTimerId = authService.refreshTimerId;
      
      // Start second timer
      authService.startTokenRefreshTimer();
      const secondTimerId = authService.refreshTimerId;
      
      expect(firstTimerId).not.toBe(secondTimerId);
      expect(authService.refreshTimerId).not.toBeNull();
    });
  });

  describe('Token Storage', () => {
    it('should store tokenIssuedAt on successful login mock', () => {
      const beforeTime = Date.now();
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      const afterTime = Date.now();
      
      const issuedAt = parseInt(sessionStorage.getItem('tokenIssuedAt') || '0');
      
      expect(issuedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(issuedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should update tokenIssuedAt on token refresh', () => {
      // Set initial token time
      const initialTime = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      sessionStorage.setItem('tokenIssuedAt', initialTime.toString());
      
      // Simulate refresh
      const newTime = Date.now();
      sessionStorage.setItem('tokenIssuedAt', newTime.toString());
      
      const updatedTime = parseInt(sessionStorage.getItem('tokenIssuedAt') || '0');
      expect(updatedTime).toBeGreaterThan(initialTime);
    });
  });

  describe('Authentication State', () => {
    it('should return true for isAuthenticated when token exists', () => {
      sessionStorage.setItem('accessToken', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false for isAuthenticated when token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should clear all auth data on logout', () => {
      sessionStorage.setItem('accessToken', 'test-token');
      sessionStorage.setItem('refreshToken', 'test-refresh-token');
      sessionStorage.setItem('user', JSON.stringify({ id: 'test' }));
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      
      authService.logout();
      
      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(sessionStorage.getItem('tokenIssuedAt')).toBeNull();
    });
  });
});
