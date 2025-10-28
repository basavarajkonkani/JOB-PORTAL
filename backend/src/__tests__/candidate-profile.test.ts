import { CandidateProfileModel } from '../models/CandidateProfile';
import { UserModel } from '../models/User';
import { auth, firestore } from '../config/firebase';
import './setup';

describe('CandidateProfile Model Tests', () => {
  // Track created users and profiles for cleanup
  const testUsers: string[] = [];

  afterEach(async () => {
    // Clean up test profiles and users from Firestore and Firebase Auth
    for (const uid of testUsers) {
      try {
        await firestore.collection('candidateProfiles').doc(uid).delete();
      } catch (error) {
        // Profile might not exist
      }
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

  describe('Profile Creation and Linking', () => {
    it('should create a candidate profile linked to a user', async () => {
      // First create a user
      const user = await UserModel.create({
        email: 'candidate@example.com',
        password: 'SecurePass123!',
        name: 'Test Candidate',
        role: 'candidate',
      });
      testUsers.push(user.id);

      // Create candidate profile
      const profileData = {
        userId: user.id,
        location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Software Engineer',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
            description: 'Developed web applications',
          },
        ],
        education: [
          {
            institution: 'University of California',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            graduationDate: '2019-05-15',
          },
        ],
        preferences: {
          roles: ['Software Engineer', 'Full Stack Developer'],
          locations: ['San Francisco', 'Remote'],
          remoteOnly: false,
          minCompensation: 120000,
        },
      };

      const profile = await CandidateProfileModel.create(profileData);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(user.id);
      expect(profile.location).toBe('San Francisco, CA');
      expect(profile.skills).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(profile.experience).toHaveLength(1);
      expect(profile.experience[0].company).toBe('Tech Corp');
      expect(profile.education).toHaveLength(1);
      expect(profile.education[0].institution).toBe('University of California');
      expect(profile.preferences.minCompensation).toBe(120000);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);

      // Verify profile exists in Firestore
      const profileDoc = await firestore.collection('candidateProfiles').doc(user.id).get();
      expect(profileDoc.exists).toBe(true);
      const firestoreData = profileDoc.data();
      expect(firestoreData?.userId).toBe(user.id);
      expect(firestoreData?.location).toBe('San Francisco, CA');
    });

    it('should create a minimal profile with only userId', async () => {
      const user = await UserModel.create({
        email: 'minimal@example.com',
        password: 'SecurePass123!',
        name: 'Minimal User',
        role: 'candidate',
      });
      testUsers.push(user.id);

      const profile = await CandidateProfileModel.create({
        userId: user.id,
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(user.id);
      expect(profile.location).toBe('');
      expect(profile.skills).toEqual([]);
      expect(profile.experience).toEqual([]);
      expect(profile.education).toEqual([]);
      expect(profile.preferences).toEqual({});
    });

    it('should create profile with partial data', async () => {
      const user = await UserModel.create({
        email: 'partial@example.com',
        password: 'SecurePass123!',
        name: 'Partial User',
        role: 'candidate',
      });
      testUsers.push(user.id);

      const profile = await CandidateProfileModel.create({
        userId: user.id,
        skills: ['Python', 'Django'],
        location: 'New York, NY',
      });

      expect(profile.userId).toBe(user.id);
      expect(profile.skills).toEqual(['Python', 'Django']);
      expect(profile.location).toBe('New York, NY');
      expect(profile.experience).toEqual([]);
      expect(profile.education).toEqual([]);
    });

    it('should use userId as document ID for easy lookup', async () => {
      const user = await UserModel.create({
        email: 'docid@example.com',
        password: 'SecurePass123!',
        name: 'Doc ID User',
        role: 'candidate',
      });
      testUsers.push(user.id);

      await CandidateProfileModel.create({
        userId: user.id,
        location: 'Boston, MA',
      });

      // Verify document ID matches userId
      const profileDoc = await firestore.collection('candidateProfiles').doc(user.id).get();
      expect(profileDoc.exists).toBe(true);
      expect(profileDoc.id).toBe(user.id);
    });
  });

  describe('Profile Queries', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'query@example.com',
        password: 'SecurePass123!',
        name: 'Query User',
        role: 'candidate',
      });
      testUserId = user.id;
      testUsers.push(testUserId);

      await CandidateProfileModel.create({
        userId: testUserId,
        location: 'Seattle, WA',
        skills: ['Java', 'Spring Boot', 'AWS'],
        experience: [
          {
            company: 'Amazon',
            title: 'Senior Engineer',
            startDate: '2018-06-01',
            description: 'Built scalable services',
          },
        ],
        education: [
          {
            institution: 'MIT',
            degree: 'Master of Science',
            field: 'Computer Science',
            graduationDate: '2018-05-20',
          },
        ],
      });
    });

    it('should find profile by userId', async () => {
      const profile = await CandidateProfileModel.findByUserId(testUserId);

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUserId);
      expect(profile?.location).toBe('Seattle, WA');
      expect(profile?.skills).toEqual(['Java', 'Spring Boot', 'AWS']);
      expect(profile?.experience).toHaveLength(1);
      expect(profile?.education).toHaveLength(1);
    });

    it('should return null for non-existent userId', async () => {
      const profile = await CandidateProfileModel.findByUserId('non-existent-id');

      expect(profile).toBeNull();
    });

    it('should check if profile exists', async () => {
      const exists = await CandidateProfileModel.exists(testUserId);
      expect(exists).toBe(true);

      const notExists = await CandidateProfileModel.exists('non-existent-id');
      expect(notExists).toBe(false);
    });

    it('should find profiles by skills', async () => {
      // Create additional profiles for testing
      const user2 = await UserModel.create({
        email: 'skills1@example.com',
        password: 'SecurePass123!',
        name: 'Skills User 1',
        role: 'candidate',
      });
      testUsers.push(user2.id);

      await CandidateProfileModel.create({
        userId: user2.id,
        skills: ['JavaScript', 'React', 'TypeScript'],
        location: 'Austin, TX',
      });

      const user3 = await UserModel.create({
        email: 'skills2@example.com',
        password: 'SecurePass123!',
        name: 'Skills User 2',
        role: 'candidate',
      });
      testUsers.push(user3.id);

      await CandidateProfileModel.create({
        userId: user3.id,
        skills: ['Python', 'JavaScript', 'Django'],
        location: 'Denver, CO',
      });

      // Search for profiles with JavaScript
      const profiles = await CandidateProfileModel.findBySkills(['JavaScript']);

      expect(profiles.length).toBeGreaterThanOrEqual(2);
      const jsProfiles = profiles.filter((p) => p.skills.includes('JavaScript'));
      expect(jsProfiles.length).toBeGreaterThanOrEqual(2);
    });

    it('should find profiles by location', async () => {
      // Create additional profile with same location
      const user2 = await UserModel.create({
        email: 'location1@example.com',
        password: 'SecurePass123!',
        name: 'Location User',
        role: 'candidate',
      });
      testUsers.push(user2.id);

      await CandidateProfileModel.create({
        userId: user2.id,
        skills: ['Ruby', 'Rails'],
        location: 'Seattle, WA',
      });

      const profiles = await CandidateProfileModel.findByLocation('Seattle, WA');

      expect(profiles.length).toBeGreaterThanOrEqual(2);
      profiles.forEach((profile) => {
        expect(profile.location).toBe('Seattle, WA');
      });
    });

    it('should find profiles by skills and location', async () => {
      // Create profile matching both criteria
      const user2 = await UserModel.create({
        email: 'both@example.com',
        password: 'SecurePass123!',
        name: 'Both User',
        role: 'candidate',
      });
      testUsers.push(user2.id);

      await CandidateProfileModel.create({
        userId: user2.id,
        skills: ['Java', 'Kotlin'],
        location: 'Seattle, WA',
      });

      const profiles = await CandidateProfileModel.findBySkillsAndLocation(['Java'], 'Seattle, WA');

      expect(profiles.length).toBeGreaterThanOrEqual(2);
      profiles.forEach((profile) => {
        expect(profile.location).toBe('Seattle, WA');
        expect(profile.skills).toContain('Java');
      });
    });

    it('should return empty array when no profiles match skills', async () => {
      const profiles = await CandidateProfileModel.findBySkills(['COBOL', 'Fortran']);

      expect(profiles).toEqual([]);
    });

    it('should return empty array when no profiles match location', async () => {
      const profiles = await CandidateProfileModel.findByLocation('Antarctica');

      expect(profiles).toEqual([]);
    });
  });

  describe('Profile Updates', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'update@example.com',
        password: 'SecurePass123!',
        name: 'Update User',
        role: 'candidate',
      });
      testUserId = user.id;
      testUsers.push(testUserId);

      await CandidateProfileModel.create({
        userId: testUserId,
        location: 'Portland, OR',
        skills: ['Go', 'Docker'],
        experience: [],
        education: [],
      });
    });

    it('should update profile location', async () => {
      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        location: 'Los Angeles, CA',
      });

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile?.location).toBe('Los Angeles, CA');
      expect(updatedProfile?.skills).toEqual(['Go', 'Docker']);

      // Verify in Firestore
      const profileDoc = await firestore.collection('candidateProfiles').doc(testUserId).get();
      expect(profileDoc.data()?.location).toBe('Los Angeles, CA');
    });

    it('should update profile skills', async () => {
      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        skills: ['Go', 'Docker', 'Kubernetes', 'Terraform'],
      });

      expect(updatedProfile?.skills).toEqual(['Go', 'Docker', 'Kubernetes', 'Terraform']);
    });

    it('should update profile experience', async () => {
      const newExperience = [
        {
          company: 'Google',
          title: 'Staff Engineer',
          startDate: '2021-01-01',
          description: 'Led infrastructure team',
        },
      ];

      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        experience: newExperience,
      });

      expect(updatedProfile?.experience).toHaveLength(1);
      expect(updatedProfile?.experience[0].company).toBe('Google');
      expect(updatedProfile?.experience[0].title).toBe('Staff Engineer');
    });

    it('should update profile education', async () => {
      const newEducation = [
        {
          institution: 'Stanford University',
          degree: 'PhD',
          field: 'Distributed Systems',
          graduationDate: '2020-06-15',
        },
      ];

      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        education: newEducation,
      });

      expect(updatedProfile?.education).toHaveLength(1);
      expect(updatedProfile?.education[0].institution).toBe('Stanford University');
      expect(updatedProfile?.education[0].degree).toBe('PhD');
    });

    it('should update profile preferences', async () => {
      const newPreferences = {
        roles: ['DevOps Engineer', 'SRE'],
        locations: ['Remote'],
        remoteOnly: true,
        minCompensation: 150000,
      };

      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        preferences: newPreferences,
      });

      expect(updatedProfile?.preferences).toEqual(newPreferences);
      expect(updatedProfile?.preferences.remoteOnly).toBe(true);
      expect(updatedProfile?.preferences.minCompensation).toBe(150000);
    });

    it('should update multiple fields at once', async () => {
      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        location: 'Chicago, IL',
        skills: ['Rust', 'WebAssembly'],
        preferences: {
          roles: ['Systems Programmer'],
          remoteOnly: true,
        },
      });

      expect(updatedProfile?.location).toBe('Chicago, IL');
      expect(updatedProfile?.skills).toEqual(['Rust', 'WebAssembly']);
      expect(updatedProfile?.preferences.roles).toEqual(['Systems Programmer']);
    });

    it('should update updatedAt timestamp', async () => {
      const originalProfile = await CandidateProfileModel.findByUserId(testUserId);
      const originalUpdatedAt = originalProfile?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        location: 'Miami, FL',
      });

      expect(updatedProfile?.updatedAt).toBeDefined();
      expect(updatedProfile?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt?.getTime() || 0
      );
    });

    it('should return null when updating non-existent profile', async () => {
      const result = await CandidateProfileModel.update('non-existent-id', {
        location: 'Nowhere',
      });

      expect(result).toBeNull();
    });

    it('should preserve other fields when updating', async () => {
      const updatedProfile = await CandidateProfileModel.update(testUserId, {
        location: 'Phoenix, AZ',
      });

      expect(updatedProfile?.userId).toBe(testUserId);
      expect(updatedProfile?.skills).toEqual(['Go', 'Docker']);
      expect(updatedProfile?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Profile Deletion', () => {
    it('should delete a profile', async () => {
      const user = await UserModel.create({
        email: 'delete@example.com',
        password: 'SecurePass123!',
        name: 'Delete User',
        role: 'candidate',
      });
      testUsers.push(user.id);

      await CandidateProfileModel.create({
        userId: user.id,
        location: 'Dallas, TX',
      });

      // Verify profile exists
      let exists = await CandidateProfileModel.exists(user.id);
      expect(exists).toBe(true);

      // Delete profile
      const result = await CandidateProfileModel.delete(user.id);
      expect(result).toBe(true);

      // Verify profile no longer exists
      exists = await CandidateProfileModel.exists(user.id);
      expect(exists).toBe(false);

      const profile = await CandidateProfileModel.findByUserId(user.id);
      expect(profile).toBeNull();
    });
  });
});
