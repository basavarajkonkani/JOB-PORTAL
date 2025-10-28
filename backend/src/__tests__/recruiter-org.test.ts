import { RecruiterProfileModel } from '../models/RecruiterProfile';
import { OrgModel } from '../models/Org';
import { UserModel } from '../models/User';
import { auth, firestore } from '../config/firebase';
import './setup';

describe('RecruiterProfile and Organization Model Tests', () => {
  // Track created users, profiles, and orgs for cleanup
  const testUsers: string[] = [];
  const testOrgs: string[] = [];

  afterEach(async () => {
    // Clean up test profiles from Firestore
    for (const uid of testUsers) {
      try {
        await firestore.collection('recruiterProfiles').doc(uid).delete();
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

    // Clean up test organizations from Firestore
    for (const orgId of testOrgs) {
      try {
        await firestore.collection('organizations').doc(orgId).delete();
      } catch (error) {
        // Org might not exist
      }
    }
    testOrgs.length = 0;
  });

  describe('Organization CRUD Operations', () => {
    it('should create an organization', async () => {
      const orgData = {
        name: 'Tech Innovations Inc',
        website: 'https://techinnovations.com',
        logoUrl: 'https://example.com/logo.png',
      };

      const org = await OrgModel.create(orgData);
      testOrgs.push(org.id);

      expect(org).toBeDefined();
      expect(org.id).toBeDefined();
      expect(org.name).toBe('Tech Innovations Inc');
      expect(org.website).toBe('https://techinnovations.com');
      expect(org.logoUrl).toBe('https://example.com/logo.png');
      expect(org.createdAt).toBeInstanceOf(Date);
      expect(org.updatedAt).toBeInstanceOf(Date);

      // Verify in Firestore
      const orgDoc = await firestore.collection('organizations').doc(org.id).get();
      expect(orgDoc.exists).toBe(true);
      expect(orgDoc.data()?.name).toBe('Tech Innovations Inc');
    });

    it('should create organization with minimal data', async () => {
      const org = await OrgModel.create({
        name: 'Minimal Corp',
      });
      testOrgs.push(org.id);

      expect(org.name).toBe('Minimal Corp');
      expect(org.website).toBeUndefined();
      expect(org.logoUrl).toBeUndefined();
    });

    it('should find organization by ID', async () => {
      const created = await OrgModel.create({
        name: 'FindMe Corp',
        website: 'https://findme.com',
      });
      testOrgs.push(created.id);

      const found = await OrgModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('FindMe Corp');
      expect(found?.website).toBe('https://findme.com');
    });

    it('should return null for non-existent organization ID', async () => {
      const org = await OrgModel.findById('non-existent-org-id');
      expect(org).toBeNull();
    });

    it('should find organization by name', async () => {
      const created = await OrgModel.create({
        name: 'Unique Name Corp',
        website: 'https://uniquename.com',
      });
      testOrgs.push(created.id);

      const found = await OrgModel.findByName('Unique Name Corp');

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Unique Name Corp');
    });

    it('should return null for non-existent organization name', async () => {
      const org = await OrgModel.findByName('Non Existent Company');
      expect(org).toBeNull();
    });

    it('should update organization', async () => {
      const org = await OrgModel.create({
        name: 'Update Test Corp',
        website: 'https://oldwebsite.com',
      });
      testOrgs.push(org.id);

      const updated = await OrgModel.update(org.id, {
        name: 'Updated Corp Name',
        website: 'https://newwebsite.com',
        logoUrl: 'https://example.com/newlogo.png',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Corp Name');
      expect(updated?.website).toBe('https://newwebsite.com');
      expect(updated?.logoUrl).toBe('https://example.com/newlogo.png');

      // Verify in Firestore
      const orgDoc = await firestore.collection('organizations').doc(org.id).get();
      expect(orgDoc.data()?.name).toBe('Updated Corp Name');
    });

    it('should update organization partially', async () => {
      const org = await OrgModel.create({
        name: 'Partial Update Corp',
        website: 'https://partial.com',
        logoUrl: 'https://example.com/logo.png',
      });
      testOrgs.push(org.id);

      const updated = await OrgModel.update(org.id, {
        website: 'https://newpartial.com',
      });

      expect(updated?.name).toBe('Partial Update Corp');
      expect(updated?.website).toBe('https://newpartial.com');
      expect(updated?.logoUrl).toBe('https://example.com/logo.png');
    });

    it('should return null when updating non-existent organization', async () => {
      const result = await OrgModel.update('non-existent-id', {
        name: 'Should Not Work',
      });

      expect(result).toBeNull();
    });

    it('should delete organization', async () => {
      const org = await OrgModel.create({
        name: 'Delete Me Corp',
      });
      testOrgs.push(org.id);

      // Verify exists
      let found = await OrgModel.findById(org.id);
      expect(found).toBeDefined();

      // Delete
      const result = await OrgModel.delete(org.id);
      expect(result).toBe(true);

      // Verify deleted
      found = await OrgModel.findById(org.id);
      expect(found).toBeNull();

      // Remove from cleanup list since already deleted
      testOrgs.pop();
    });
  });

  describe('RecruiterProfile Creation and Queries', () => {
    it('should create recruiter profile linked to user', async () => {
      const user = await UserModel.create({
        email: 'recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Test Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      const profile = await RecruiterProfileModel.create({
        userId: user.id,
        title: 'Senior Recruiter',
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(user.id);
      expect(profile.title).toBe('Senior Recruiter');
      expect(profile.orgId).toBeUndefined();
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);

      // Verify in Firestore
      const profileDoc = await firestore.collection('recruiterProfiles').doc(user.id).get();
      expect(profileDoc.exists).toBe(true);
      expect(profileDoc.data()?.userId).toBe(user.id);
    });

    it('should create recruiter profile with organization', async () => {
      const user = await UserModel.create({
        email: 'recruiter-org@example.com',
        password: 'SecurePass123!',
        name: 'Org Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      const org = await OrgModel.create({
        name: 'Hiring Company',
      });
      testOrgs.push(org.id);

      const profile = await RecruiterProfileModel.create({
        userId: user.id,
        orgId: org.id,
        title: 'Talent Acquisition Manager',
      });

      expect(profile.userId).toBe(user.id);
      expect(profile.orgId).toBe(org.id);
      expect(profile.title).toBe('Talent Acquisition Manager');
    });

    it('should create minimal recruiter profile', async () => {
      const user = await UserModel.create({
        email: 'minimal-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Minimal Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      const profile = await RecruiterProfileModel.create({
        userId: user.id,
      });

      expect(profile.userId).toBe(user.id);
      expect(profile.orgId).toBeUndefined();
      expect(profile.title).toBeUndefined();
    });

    it('should use userId as document ID', async () => {
      const user = await UserModel.create({
        email: 'docid-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Doc ID Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      await RecruiterProfileModel.create({
        userId: user.id,
        title: 'Recruiter',
      });

      // Verify document ID matches userId
      const profileDoc = await firestore.collection('recruiterProfiles').doc(user.id).get();
      expect(profileDoc.exists).toBe(true);
      expect(profileDoc.id).toBe(user.id);
    });

    it('should find recruiter profile by userId', async () => {
      const user = await UserModel.create({
        email: 'find-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Find Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      await RecruiterProfileModel.create({
        userId: user.id,
        title: 'HR Manager',
      });

      const profile = await RecruiterProfileModel.findByUserId(user.id);

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(user.id);
      expect(profile?.title).toBe('HR Manager');
    });

    it('should return null for non-existent userId', async () => {
      const profile = await RecruiterProfileModel.findByUserId('non-existent-user-id');
      expect(profile).toBeNull();
    });

    it('should check if profile exists', async () => {
      const user = await UserModel.create({
        email: 'exists-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Exists Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      await RecruiterProfileModel.create({
        userId: user.id,
      });

      const exists = await RecruiterProfileModel.exists(user.id);
      expect(exists).toBe(true);

      const notExists = await RecruiterProfileModel.exists('non-existent-id');
      expect(notExists).toBe(false);
    });
  });

  describe('RecruiterProfile Updates', () => {
    let testUserId: string;
    let testOrgId: string;

    beforeEach(async () => {
      const user = await UserModel.create({
        email: 'update-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Update Recruiter',
        role: 'recruiter',
      });
      testUserId = user.id;
      testUsers.push(testUserId);

      const org = await OrgModel.create({
        name: 'Test Organization',
      });
      testOrgId = org.id;
      testOrgs.push(testOrgId);

      await RecruiterProfileModel.create({
        userId: testUserId,
        title: 'Recruiter',
      });
    });

    it('should update recruiter title', async () => {
      const updated = await RecruiterProfileModel.update(testUserId, {
        title: 'Senior Talent Acquisition Specialist',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Senior Talent Acquisition Specialist');
      expect(updated?.userId).toBe(testUserId);
    });

    it('should update recruiter organization', async () => {
      const updated = await RecruiterProfileModel.update(testUserId, {
        orgId: testOrgId,
      });

      expect(updated?.orgId).toBe(testOrgId);
    });

    it('should update multiple fields', async () => {
      const updated = await RecruiterProfileModel.update(testUserId, {
        orgId: testOrgId,
        title: 'Lead Recruiter',
      });

      expect(updated?.orgId).toBe(testOrgId);
      expect(updated?.title).toBe('Lead Recruiter');
    });

    it('should return null when updating non-existent profile', async () => {
      const result = await RecruiterProfileModel.update('non-existent-id', {
        title: 'Should Not Work',
      });

      expect(result).toBeNull();
    });
  });

  describe('RecruiterProfile Deletion', () => {
    it('should delete recruiter profile', async () => {
      const user = await UserModel.create({
        email: 'delete-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Delete Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      await RecruiterProfileModel.create({
        userId: user.id,
        title: 'Recruiter',
      });

      // Verify exists
      let exists = await RecruiterProfileModel.exists(user.id);
      expect(exists).toBe(true);

      // Delete
      const result = await RecruiterProfileModel.delete(user.id);
      expect(result).toBe(true);

      // Verify deleted
      exists = await RecruiterProfileModel.exists(user.id);
      expect(exists).toBe(false);

      const profile = await RecruiterProfileModel.findByUserId(user.id);
      expect(profile).toBeNull();
    });
  });

  describe('Relationship Queries', () => {
    let org1Id: string;
    let org2Id: string;
    let recruiter1Id: string;
    let recruiter2Id: string;
    let recruiter3Id: string;

    beforeEach(async () => {
      // Create two organizations
      const org1 = await OrgModel.create({
        name: 'Company A',
        website: 'https://companya.com',
      });
      org1Id = org1.id;
      testOrgs.push(org1Id);

      const org2 = await OrgModel.create({
        name: 'Company B',
        website: 'https://companyb.com',
      });
      org2Id = org2.id;
      testOrgs.push(org2Id);

      // Create recruiters for org1
      const user1 = await UserModel.create({
        email: 'recruiter1@companya.com',
        password: 'SecurePass123!',
        name: 'Recruiter One',
        role: 'recruiter',
      });
      recruiter1Id = user1.id;
      testUsers.push(recruiter1Id);

      await RecruiterProfileModel.create({
        userId: recruiter1Id,
        orgId: org1Id,
        title: 'Senior Recruiter',
      });

      const user2 = await UserModel.create({
        email: 'recruiter2@companya.com',
        password: 'SecurePass123!',
        name: 'Recruiter Two',
        role: 'recruiter',
      });
      recruiter2Id = user2.id;
      testUsers.push(recruiter2Id);

      await RecruiterProfileModel.create({
        userId: recruiter2Id,
        orgId: org1Id,
        title: 'Junior Recruiter',
      });

      // Create recruiter for org2
      const user3 = await UserModel.create({
        email: 'recruiter3@companyb.com',
        password: 'SecurePass123!',
        name: 'Recruiter Three',
        role: 'recruiter',
      });
      recruiter3Id = user3.id;
      testUsers.push(recruiter3Id);

      await RecruiterProfileModel.create({
        userId: recruiter3Id,
        orgId: org2Id,
        title: 'Lead Recruiter',
      });
    });

    it('should find all recruiters for an organization', async () => {
      const recruiters = await RecruiterProfileModel.findByOrgId(org1Id);

      expect(recruiters).toHaveLength(2);
      expect(recruiters.every((r) => r.orgId === org1Id)).toBe(true);

      const userIds = recruiters.map((r) => r.userId);
      expect(userIds).toContain(recruiter1Id);
      expect(userIds).toContain(recruiter2Id);
      expect(userIds).not.toContain(recruiter3Id);
    });

    it('should find single recruiter for organization with one recruiter', async () => {
      const recruiters = await RecruiterProfileModel.findByOrgId(org2Id);

      expect(recruiters).toHaveLength(1);
      expect(recruiters[0].userId).toBe(recruiter3Id);
      expect(recruiters[0].orgId).toBe(org2Id);
      expect(recruiters[0].title).toBe('Lead Recruiter');
    });

    it('should return empty array for organization with no recruiters', async () => {
      const org3 = await OrgModel.create({
        name: 'Empty Company',
      });
      testOrgs.push(org3.id);

      const recruiters = await RecruiterProfileModel.findByOrgId(org3.id);

      expect(recruiters).toEqual([]);
    });

    it('should get recruiter user IDs from organization model', async () => {
      const recruiterIds = await OrgModel.getRecruiters(org1Id);

      expect(recruiterIds).toHaveLength(2);
      expect(recruiterIds).toContain(recruiter1Id);
      expect(recruiterIds).toContain(recruiter2Id);
    });

    it('should associate recruiter with organization', async () => {
      const user = await UserModel.create({
        email: 'new-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'New Recruiter',
        role: 'recruiter',
      });
      testUsers.push(user.id);

      await RecruiterProfileModel.create({
        userId: user.id,
        title: 'Recruiter',
      });

      // Initially no organization
      let profile = await RecruiterProfileModel.findByUserId(user.id);
      expect(profile?.orgId).toBeUndefined();

      // Associate with organization
      const updated = await RecruiterProfileModel.setOrganization(user.id, org1Id);

      expect(updated?.orgId).toBe(org1Id);

      // Verify in query
      const org1Recruiters = await RecruiterProfileModel.findByOrgId(org1Id);
      expect(org1Recruiters.some((r) => r.userId === user.id)).toBe(true);
    });

    it('should remove recruiter from organization', async () => {
      // Recruiter1 is in org1
      let profile = await RecruiterProfileModel.findByUserId(recruiter1Id);
      expect(profile?.orgId).toBe(org1Id);

      // Remove from organization
      const updated = await RecruiterProfileModel.removeFromOrganization(recruiter1Id);

      expect(updated?.orgId).toBeUndefined();

      // Verify not in org query
      const org1Recruiters = await RecruiterProfileModel.findByOrgId(org1Id);
      expect(org1Recruiters.some((r) => r.userId === recruiter1Id)).toBe(false);
    });

    it('should move recruiter between organizations', async () => {
      // Recruiter1 starts in org1
      let profile = await RecruiterProfileModel.findByUserId(recruiter1Id);
      expect(profile?.orgId).toBe(org1Id);

      // Move to org2
      await RecruiterProfileModel.setOrganization(recruiter1Id, org2Id);

      // Verify in org2
      const org2Recruiters = await RecruiterProfileModel.findByOrgId(org2Id);
      expect(org2Recruiters.some((r) => r.userId === recruiter1Id)).toBe(true);

      // Verify not in org1
      const org1Recruiters = await RecruiterProfileModel.findByOrgId(org1Id);
      expect(org1Recruiters.some((r) => r.userId === recruiter1Id)).toBe(false);
    });
  });
});
