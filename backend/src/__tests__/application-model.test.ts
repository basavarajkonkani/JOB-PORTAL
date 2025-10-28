import './setup';
import { ApplicationModel } from '../models/Application';
import { UserModel } from '../models/User';
import { JobModel } from '../models/Job';
import { auth, firestore } from '../config/firebase';

describe('Application Model Tests', () => {
  // Track created resources for cleanup
  const testUsers: string[] = [];
  const testJobs: string[] = [];
  const testApplications: string[] = [];

  // Helper function to create a test user
  async function createTestUser(email: string, role: 'candidate' | 'recruiter' = 'candidate') {
    const user = await UserModel.create({
      email,
      password: 'SecurePass123!',
      name: `Test User ${email}`,
      role,
    });
    testUsers.push(user.id);
    return user;
  }

  // Helper function to create a test job
  async function createTestJob(
    createdBy: string,
    orgId: string,
    title: string = 'Software Engineer'
  ) {
    const job = await JobModel.create({
      orgId,
      createdBy,
      title,
      level: 'mid',
      location: 'San Francisco, CA',
      type: 'full-time',
      remote: true,
      description: 'Test job description',
      requirements: ['JavaScript', 'React', 'Node.js'],
      compensation: {
        min: 100000,
        max: 150000,
        currency: 'USD',
      },
      benefits: ['Health Insurance', '401k'],
      status: 'active',
    });
    testJobs.push(job.id);
    return job;
  }

  afterEach(async () => {
    // Clean up test applications
    for (const appId of testApplications) {
      try {
        await firestore.collection('applications').doc(appId).delete();
      } catch (error) {
        // Application might not exist
      }
    }
    testApplications.length = 0;

    // Clean up test jobs
    for (const jobId of testJobs) {
      try {
        await JobModel.hardDelete(jobId);
      } catch (error) {
        // Job might not exist
      }
    }
    testJobs.length = 0;

    // Clean up test users
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

  describe('Application Creation', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let testJob: any;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'test-org-id', 'Backend Developer');
    });

    it('should create a new application with all required fields', async () => {
      const applicationData = {
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
        coverLetter: 'I am very interested in this position.',
      };

      const application = await ApplicationModel.create(applicationData);

      expect(application).toBeDefined();
      expect(application.id).toBeDefined();
      expect(application.jobId).toBe(testJob.id);
      expect(application.userId).toBe(candidateUser.id);
      expect(application.resumeVersionId).toBe('resume-version-123');
      expect(application.coverLetter).toBe('I am very interested in this position.');
      expect(application.status).toBe('submitted');
      expect(application.notes).toBe('');
      expect(application.createdAt).toBeInstanceOf(Date);
      expect(application.updatedAt).toBeInstanceOf(Date);

      testApplications.push(application.id);

      // Verify application exists in Firestore
      const appDoc = await firestore.collection('applications').doc(application.id).get();
      expect(appDoc.exists).toBe(true);
      const firestoreData = appDoc.data();
      expect(firestoreData?.jobId).toBe(testJob.id);
      expect(firestoreData?.userId).toBe(candidateUser.id);
    });

    it('should create application with default status as submitted', async () => {
      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
      });

      expect(application.status).toBe('submitted');
      testApplications.push(application.id);
    });

    it('should create application with custom status', async () => {
      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
        status: 'reviewed',
      });

      expect(application.status).toBe('reviewed');
      testApplications.push(application.id);
    });

    it('should create application with AI score and rationale', async () => {
      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
        coverLetter: 'Great cover letter',
        aiScore: 85,
        aiRationale: 'Strong technical background matching job requirements',
      });

      expect(application.aiScore).toBe(85);
      expect(application.aiRationale).toBe('Strong technical background matching job requirements');
      testApplications.push(application.id);
    });

    it('should create application with notes', async () => {
      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
        notes: 'Candidate has excellent communication skills',
      });

      expect(application.notes).toBe('Candidate has excellent communication skills');
      testApplications.push(application.id);
    });

    it('should create application without cover letter', async () => {
      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-123',
      });

      expect(application.coverLetter).toBe('');
      testApplications.push(application.id);
    });
  });

  describe('Application Retrieval by ID', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let testJob: any;
    let testApplicationId: string;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate2@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter2@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'test-org-id-2', 'Frontend Developer');

      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-456',
        coverLetter: 'Test cover letter',
        aiScore: 75,
      });
      testApplicationId = application.id;
      testApplications.push(testApplicationId);
    });

    it('should find application by valid ID', async () => {
      const application = await ApplicationModel.findById(testApplicationId);

      expect(application).toBeDefined();
      expect(application?.id).toBe(testApplicationId);
      expect(application?.jobId).toBe(testJob.id);
      expect(application?.userId).toBe(candidateUser.id);
      expect(application?.resumeVersionId).toBe('resume-version-456');
      expect(application?.coverLetter).toBe('Test cover letter');
      expect(application?.aiScore).toBe(75);
      expect(application?.status).toBe('submitted');
    });

    it('should return null for non-existent ID', async () => {
      const application = await ApplicationModel.findById('non-existent-id-12345');

      expect(application).toBeNull();
    });

    it('should retrieve application with all fields', async () => {
      const fullApplication = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-version-789',
        coverLetter: 'Detailed cover letter',
        status: 'shortlisted',
        notes: 'Top candidate',
        aiScore: 95,
        aiRationale: 'Perfect match for all requirements',
      });
      testApplications.push(fullApplication.id);

      const foundApplication = await ApplicationModel.findById(fullApplication.id);

      expect(foundApplication).toBeDefined();
      expect(foundApplication?.status).toBe('shortlisted');
      expect(foundApplication?.notes).toBe('Top candidate');
      expect(foundApplication?.aiScore).toBe(95);
      expect(foundApplication?.aiRationale).toBe('Perfect match for all requirements');
    });
  });

  describe('Application Queries by User', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let job1: any;
    let job2: any;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate3@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter3@example.com', 'recruiter');
      job1 = await createTestJob(recruiterUser.id, 'org-1', 'Full Stack Developer');
      job2 = await createTestJob(recruiterUser.id, 'org-2', 'DevOps Engineer');
    });

    it('should find all applications by user ID', async () => {
      const app1 = await ApplicationModel.create({
        jobId: job1.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
        coverLetter: 'Application 1',
      });
      testApplications.push(app1.id);

      const app2 = await ApplicationModel.create({
        jobId: job2.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v2',
        coverLetter: 'Application 2',
      });
      testApplications.push(app2.id);

      const applications = await ApplicationModel.findByUserId(candidateUser.id);

      expect(applications).toHaveLength(2);
      expect(applications[0].userId).toBe(candidateUser.id);
      expect(applications[1].userId).toBe(candidateUser.id);
    });

    it('should return empty array for user with no applications', async () => {
      const anotherUser = await createTestUser('noapps@example.com', 'candidate');

      const applications = await ApplicationModel.findByUserId(anotherUser.id);

      expect(applications).toHaveLength(0);
    });

    it('should return applications ordered by creation date descending', async () => {
      const app1 = await ApplicationModel.create({
        jobId: job1.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app1.id);

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      const app2 = await ApplicationModel.create({
        jobId: job2.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v2',
      });
      testApplications.push(app2.id);

      const applications = await ApplicationModel.findByUserId(candidateUser.id);

      expect(applications).toHaveLength(2);
      // Most recent application should be first
      expect(applications[0].id).toBe(app2.id);
      expect(applications[1].id).toBe(app1.id);
    });

    it('should include job details in application results', async () => {
      const app = await ApplicationModel.create({
        jobId: job1.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app.id);

      const applications = await ApplicationModel.findByUserId(candidateUser.id);

      expect(applications).toHaveLength(1);
      expect(applications[0].jobTitle).toBe('Full Stack Developer');
      expect(applications[0].jobLocation).toBe('San Francisco, CA');
      expect(applications[0].jobType).toBe('full-time');
    });
  });

  describe('Application Queries by Job', () => {
    let candidate1: any;
    let candidate2: any;
    let recruiterUser: any;
    let testJob: any;

    beforeEach(async () => {
      candidate1 = await createTestUser('candidate4@example.com', 'candidate');
      candidate2 = await createTestUser('candidate5@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter4@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'org-3', 'Data Scientist');
    });

    it('should find all applications for a job', async () => {
      const app1 = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidate1.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app1.id);

      const app2 = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidate2.id,
        resumeVersionId: 'resume-v2',
      });
      testApplications.push(app2.id);

      const applications = await ApplicationModel.findByJobId(testJob.id);

      expect(applications).toHaveLength(2);
      expect(applications[0].jobId).toBe(testJob.id);
      expect(applications[1].jobId).toBe(testJob.id);
    });

    it('should return empty array for job with no applications', async () => {
      const anotherJob = await createTestJob(recruiterUser.id, 'org-4', 'Product Manager');

      const applications = await ApplicationModel.findByJobId(anotherJob.id);

      expect(applications).toHaveLength(0);
    });

    it('should return applications ordered by creation date descending', async () => {
      const app1 = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidate1.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app1.id);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const app2 = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidate2.id,
        resumeVersionId: 'resume-v2',
      });
      testApplications.push(app2.id);

      const applications = await ApplicationModel.findByJobId(testJob.id);

      expect(applications).toHaveLength(2);
      expect(applications[0].id).toBe(app2.id);
      expect(applications[1].id).toBe(app1.id);
    });
  });

  describe('Application Existence Check', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let testJob: any;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate6@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter5@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'org-5', 'UX Designer');
    });

    it('should return true when user has applied to job', async () => {
      const app = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app.id);

      const exists = await ApplicationModel.existsByJobAndUser(testJob.id, candidateUser.id);

      expect(exists).toBe(true);
    });

    it('should return false when user has not applied to job', async () => {
      const exists = await ApplicationModel.existsByJobAndUser(testJob.id, candidateUser.id);

      expect(exists).toBe(false);
    });

    it('should return false for non-existent job', async () => {
      const exists = await ApplicationModel.existsByJobAndUser(
        'non-existent-job',
        candidateUser.id
      );

      expect(exists).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const exists = await ApplicationModel.existsByJobAndUser(testJob.id, 'non-existent-user');

      expect(exists).toBe(false);
    });
  });

  describe('Application Status Updates', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let testJob: any;
    let testApplicationId: string;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate7@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter6@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'org-6', 'Mobile Developer');

      const application = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
        coverLetter: 'Original cover letter',
        status: 'submitted',
      });
      testApplicationId = application.id;
      testApplications.push(testApplicationId);
    });

    it('should update application status to reviewed', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'reviewed',
      });

      expect(updatedApp).toBeDefined();
      expect(updatedApp?.status).toBe('reviewed');
      expect(updatedApp?.id).toBe(testApplicationId);
    });

    it('should update application status to shortlisted', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'shortlisted',
      });

      expect(updatedApp?.status).toBe('shortlisted');
    });

    it('should update application status to rejected', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'rejected',
      });

      expect(updatedApp?.status).toBe('rejected');
    });

    it('should update application status to accepted', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'accepted',
      });

      expect(updatedApp?.status).toBe('accepted');
    });

    it('should update cover letter', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        coverLetter: 'Updated cover letter with more details',
      });

      expect(updatedApp?.coverLetter).toBe('Updated cover letter with more details');
    });

    it('should update notes', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        notes: 'Candidate showed great enthusiasm during screening',
      });

      expect(updatedApp?.notes).toBe('Candidate showed great enthusiasm during screening');
    });

    it('should update AI score and rationale', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        aiScore: 90,
        aiRationale: 'Excellent match after detailed analysis',
      });

      expect(updatedApp?.aiScore).toBe(90);
      expect(updatedApp?.aiRationale).toBe('Excellent match after detailed analysis');
    });

    it('should update multiple fields at once', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'shortlisted',
        notes: 'Moving to next round',
        aiScore: 88,
      });

      expect(updatedApp?.status).toBe('shortlisted');
      expect(updatedApp?.notes).toBe('Moving to next round');
      expect(updatedApp?.aiScore).toBe(88);
    });

    it('should update updatedAt timestamp', async () => {
      const originalApp = await ApplicationModel.findById(testApplicationId);
      const originalUpdatedAt = originalApp?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'reviewed',
      });

      expect(updatedApp?.updatedAt).toBeDefined();
      expect(updatedApp?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt?.getTime() || 0);
    });

    it('should preserve other fields when updating', async () => {
      const updatedApp = await ApplicationModel.update(testApplicationId, {
        status: 'reviewed',
      });

      expect(updatedApp?.jobId).toBe(testJob.id);
      expect(updatedApp?.userId).toBe(candidateUser.id);
      expect(updatedApp?.resumeVersionId).toBe('resume-v1');
      expect(updatedApp?.coverLetter).toBe('Original cover letter');
    });

    it('should return null when updating non-existent application', async () => {
      const result = await ApplicationModel.update('non-existent-id', {
        status: 'reviewed',
      });

      expect(result).toBeNull();
    });
  });

  describe('Application Status Counts', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let job1: any;
    let job2: any;
    let job3: any;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate8@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter7@example.com', 'recruiter');
      job1 = await createTestJob(recruiterUser.id, 'org-7', 'Job 1');
      job2 = await createTestJob(recruiterUser.id, 'org-7', 'Job 2');
      job3 = await createTestJob(recruiterUser.id, 'org-7', 'Job 3');
    });

    it('should return correct status counts for user applications', async () => {
      const app1 = await ApplicationModel.create({
        jobId: job1.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
        status: 'submitted',
      });
      testApplications.push(app1.id);

      const app2 = await ApplicationModel.create({
        jobId: job2.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v2',
        status: 'reviewed',
      });
      testApplications.push(app2.id);

      const app3 = await ApplicationModel.create({
        jobId: job3.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v3',
        status: 'shortlisted',
      });
      testApplications.push(app3.id);

      const counts = await ApplicationModel.getStatusCountsByUserId(candidateUser.id);

      expect(counts.submitted).toBe(1);
      expect(counts.reviewed).toBe(1);
      expect(counts.shortlisted).toBe(1);
    });

    it('should return empty object for user with no applications', async () => {
      const anotherUser = await createTestUser('nocount@example.com', 'candidate');

      const counts = await ApplicationModel.getStatusCountsByUserId(anotherUser.id);

      expect(Object.keys(counts)).toHaveLength(0);
    });

    it('should count multiple applications with same status', async () => {
      const app1 = await ApplicationModel.create({
        jobId: job1.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
        status: 'submitted',
      });
      testApplications.push(app1.id);

      const app2 = await ApplicationModel.create({
        jobId: job2.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v2',
        status: 'submitted',
      });
      testApplications.push(app2.id);

      const counts = await ApplicationModel.getStatusCountsByUserId(candidateUser.id);

      expect(counts.submitted).toBe(2);
    });
  });

  describe('Application Deletion', () => {
    let candidateUser: any;
    let recruiterUser: any;
    let testJob: any;

    beforeEach(async () => {
      candidateUser = await createTestUser('candidate9@example.com', 'candidate');
      recruiterUser = await createTestUser('recruiter8@example.com', 'recruiter');
      testJob = await createTestJob(recruiterUser.id, 'org-8', 'Test Job');
    });

    it('should delete an application', async () => {
      const app = await ApplicationModel.create({
        jobId: testJob.id,
        userId: candidateUser.id,
        resumeVersionId: 'resume-v1',
      });
      testApplications.push(app.id);

      const deleted = await ApplicationModel.delete(app.id);

      expect(deleted).toBe(true);

      // Verify application no longer exists
      const foundApp = await ApplicationModel.findById(app.id);
      expect(foundApp).toBeNull();
    });

    it('should return true even for non-existent application', async () => {
      const deleted = await ApplicationModel.delete('non-existent-id');

      expect(deleted).toBe(true);
    });
  });
});
