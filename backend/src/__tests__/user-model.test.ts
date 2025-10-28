import { UserModel } from '../models/User';
import { auth, firestore } from '../config/firebase';
import './setup';

describe('User Model Tests', () => {
  // Track created users for cleanup
  const testUsers: string[] = [];

  afterEach(async () => {
    // Clean up test users from Firebase Auth and Firestore
    for (const uid of testUsers) {
      try {
        await auth.deleteUser(uid);
      } catch (error) {
        // User might not exist
      }
      try {
        await firestore.collection('users').doc(uid).delete();
      } catch (error) {
        // Document might not exist
      }
    }
    testUsers.length = 0;
  });

  describe('User Creation', () => {
    it('should create a new user with all required fields', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        role: 'candidate' as const,
      };

      const user = await UserModel.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      testUsers.push(user.id);

      // Verify user exists in Firebase Auth
      const authUser = await auth.getUser(user.id);
      expect(authUser.email).toBe(userData.email);
      expect(authUser.displayName).toBe(userData.name);

      // Verify custom claims are set
      expect(authUser.customClaims).toHaveProperty('role', userData.role);

      // Verify user document exists in Firestore
      const userDoc = await firestore.collection('users').doc(user.id).get();
      expect(userDoc.exists).toBe(true);
      const firestoreData = userDoc.data();
      expect(firestoreData?.email).toBe(userData.email);
      expect(firestoreData?.name).toBe(userData.name);
      expect(firestoreData?.role).toBe(userData.role);
    });

    it('should create a user with optional avatarUrl', async () => {
      const userData = {
        email: 'avatar-user@example.com',
        password: 'SecurePass123!',
        name: 'Avatar User',
        role: 'candidate' as const,
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const user = await UserModel.create(userData);

      expect(user.avatarUrl).toBe(userData.avatarUrl);
      testUsers.push(user.id);

      // Verify in Firebase Auth
      const authUser = await auth.getUser(user.id);
      expect(authUser.photoURL).toBe(userData.avatarUrl);

      // Verify in Firestore
      const userDoc = await firestore.collection('users').doc(user.id).get();
      expect(userDoc.data()?.avatarUrl).toBe(userData.avatarUrl);
    });

    it('should create a recruiter user with correct role', async () => {
      const userData = {
        email: 'recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Recruiter User',
        role: 'recruiter' as const,
      };

      const user = await UserModel.create(userData);

      expect(user.role).toBe('recruiter');
      testUsers.push(user.id);

      // Verify custom claims
      const authUser = await auth.getUser(user.id);
      expect(authUser.customClaims?.role).toBe('recruiter');
    });

    it('should create an admin user with correct role', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'SecurePass123!',
        name: 'Admin User',
        role: 'admin' as const,
      };

      const user = await UserModel.create(userData);

      expect(user.role).toBe('admin');
      testUsers.push(user.id);

      // Verify custom claims
      const authUser = await auth.getUser(user.id);
      expect(authUser.customClaims?.role).toBe('admin');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        name: 'First User',
        role: 'candidate' as const,
      };

      const firstUser = await UserModel.create(userData);
      testUsers.push(firstUser.id);

      // Try to create second user with same email
      await expect(
        UserModel.create({
          email: 'duplicate@example.com',
          password: 'DifferentPass456!',
          name: 'Second User',
          role: 'candidate',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid email format', async () => {
      const userData = {
        email: 'invalid-email-format',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'candidate' as const,
      };

      await expect(UserModel.create(userData)).rejects.toThrow();
    });
  });

  describe('User Retrieval by ID', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'findbyid@example.com',
        password: 'SecurePass123!',
        name: 'Find By ID User',
        role: 'candidate',
      });
      testUserId = user.id;
      testUsers.push(testUserId);
    });

    it('should find user by valid ID', async () => {
      const user = await UserModel.findById(testUserId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
      expect(user?.email).toBe('findbyid@example.com');
      expect(user?.name).toBe('Find By ID User');
      expect(user?.role).toBe('candidate');
      expect(user?.createdAt).toBeInstanceOf(Date);
      expect(user?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent ID', async () => {
      const user = await UserModel.findById('non-existent-id-12345');

      expect(user).toBeNull();
    });

    it('should retrieve user with avatarUrl if present', async () => {
      const userWithAvatar = await UserModel.create({
        email: 'avatar-find@example.com',
        password: 'SecurePass123!',
        name: 'Avatar Find User',
        role: 'candidate',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      testUsers.push(userWithAvatar.id);

      const foundUser = await UserModel.findById(userWithAvatar.id);

      expect(foundUser?.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('User Retrieval by Email', () => {
    let testUserEmail: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'findbyemail@example.com',
        password: 'SecurePass123!',
        name: 'Find By Email User',
        role: 'candidate',
      });
      testUserEmail = user.email;
      testUsers.push(user.id);
    });

    it('should find user by valid email', async () => {
      const user = await UserModel.findByEmail(testUserEmail);

      expect(user).toBeDefined();
      expect(user?.email).toBe(testUserEmail);
      expect(user?.name).toBe('Find By Email User');
      expect(user?.role).toBe('candidate');
      expect(user?.id).toBeDefined();
    });

    it('should return null for non-existent email', async () => {
      const user = await UserModel.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should be case-sensitive for email search', async () => {
      const user = await UserModel.findByEmail('FINDBYEMAIL@EXAMPLE.COM');

      // Firebase email queries are case-sensitive
      expect(user).toBeNull();
    });

    it('should find user with all fields populated', async () => {
      const createdUser = await UserModel.create({
        email: 'complete@example.com',
        password: 'SecurePass123!',
        name: 'Complete User',
        role: 'recruiter',
        avatarUrl: 'https://example.com/complete.jpg',
      });
      testUsers.push(createdUser.id);

      const foundUser = await UserModel.findByEmail('complete@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe('complete@example.com');
      expect(foundUser?.name).toBe('Complete User');
      expect(foundUser?.role).toBe('recruiter');
      expect(foundUser?.avatarUrl).toBe('https://example.com/complete.jpg');
    });
  });

  describe('User Updates', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'update@example.com',
        password: 'SecurePass123!',
        name: 'Original Name',
        role: 'candidate',
      });
      testUserId = user.id;
      testUsers.push(testUserId);
    });

    it('should update user name', async () => {
      const updatedUser = await UserModel.update(testUserId, {
        name: 'Updated Name',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.email).toBe('update@example.com');

      // Verify in Firestore
      const userDoc = await firestore.collection('users').doc(testUserId).get();
      expect(userDoc.data()?.name).toBe('Updated Name');

      // Verify in Firebase Auth
      const authUser = await auth.getUser(testUserId);
      expect(authUser.displayName).toBe('Updated Name');
    });

    it('should update user avatarUrl', async () => {
      const updatedUser = await UserModel.update(testUserId, {
        avatarUrl: 'https://example.com/new-avatar.jpg',
      });

      expect(updatedUser?.avatarUrl).toBe('https://example.com/new-avatar.jpg');

      // Verify in Firestore
      const userDoc = await firestore.collection('users').doc(testUserId).get();
      expect(userDoc.data()?.avatarUrl).toBe('https://example.com/new-avatar.jpg');

      // Verify in Firebase Auth
      const authUser = await auth.getUser(testUserId);
      expect(authUser.photoURL).toBe('https://example.com/new-avatar.jpg');
    });

    it('should update both name and avatarUrl', async () => {
      const updatedUser = await UserModel.update(testUserId, {
        name: 'New Name',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(updatedUser?.name).toBe('New Name');
      expect(updatedUser?.avatarUrl).toBe('https://example.com/avatar.jpg');

      // Verify in Firestore
      const userDoc = await firestore.collection('users').doc(testUserId).get();
      expect(userDoc.data()?.name).toBe('New Name');
      expect(userDoc.data()?.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should update updatedAt timestamp', async () => {
      const originalUser = await UserModel.findById(testUserId);
      const originalUpdatedAt = originalUser?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedUser = await UserModel.update(testUserId, {
        name: 'Updated Name',
      });

      expect(updatedUser?.updatedAt).toBeDefined();
      expect(updatedUser?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt?.getTime() || 0);
    });

    it('should return null when updating non-existent user', async () => {
      const result = await UserModel.update('non-existent-id', {
        name: 'New Name',
      });

      expect(result).toBeNull();
    });

    it('should preserve other fields when updating', async () => {
      const updatedUser = await UserModel.update(testUserId, {
        name: 'Updated Name',
      });

      expect(updatedUser?.email).toBe('update@example.com');
      expect(updatedUser?.role).toBe('candidate');
      expect(updatedUser?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Email Existence Check', () => {
    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'exists@example.com',
        password: 'SecurePass123!',
        name: 'Exists User',
        role: 'candidate',
      });
      testUsers.push(user.id);
    });

    it('should return true for existing email', async () => {
      const exists = await UserModel.emailExists('exists@example.com');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      const exists = await UserModel.emailExists('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });
});
