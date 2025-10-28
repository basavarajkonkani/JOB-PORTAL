import { JobModel, CreateJobData, UpdateJobData } from '../models/Job';
import pool from '../config/database';
import './setup';

describe('Job Model Tests', () => {
  let testOrgId: string;
  let testRecruiterId: string;

  beforeEach(async () => {
    // Create test organization directly in PostgreSQL
    const orgResult = await pool.query(
      `INSERT INTO orgs (name, website)
       VALUES ($1, $2)
       RETURNING id`,
      ['Test Company', 'https://testcompany.com']
    );
    testOrgId = orgResult.rows[0].id;

    // Create test recruiter user
    const recruiter = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['recruiter@test.com', 'hash', 'Test Recruiter', 'recruiter']
    );
    testRecruiterId = recruiter.rows[0].id;
  });

  describe('Job Creation and Linking', () => {
    it('should create a job with all required fields', async () => {
      const jobData: CreateJobData = {
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Senior Software Engineer',
        level: 'senior',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        description: 'We are looking for a senior software engineer to join our team.',
        requirements: ['5+ years experience', 'TypeScript', 'React'],
        compensation: {
          min: 150000,
          max: 200000,
          currency: 'USD',
          equity: '0.1-0.5%',
        },
        benefits: ['Health insurance', '401k', 'Unlimited PTO'],
      };

      const job = await JobModel.create(jobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.orgId).toBe(testOrgId);
      expect(job.createdBy).toBe(testRecruiterId);
      expect(job.title).toBe('Senior Software Engineer');
      expect(job.level).toBe('senior');
      expect(job.location).toBe('San Francisco, CA');
      expect(job.type).toBe('full-time');
      expect(job.remote).toBe(true);
      expect(job.description).toBe(jobData.description);
      expect(job.requirements).toEqual(['5+ years experience', 'TypeScript', 'React']);
      expect(job.compensation.min).toBe(150000);
      expect(job.compensation.max).toBe(200000);
      expect(job.compensation.currency).toBe('USD');
      expect(job.compensation.equity).toBe('0.1-0.5%');
      expect(job.benefits).toEqual(['Health insurance', '401k', 'Unlimited PTO']);
      expect(job.status).toBe('draft');
      expect(job.createdAt).toBeInstanceOf(Date);
      expect(job.updatedAt).toBeInstanceOf(Date);
      expect(job.publishedAt).toBeFalsy(); // null or undefined for draft jobs
    });

    it('should create a job with minimal required fields', async () => {
      const jobData: CreateJobData = {
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Junior Developer',
        level: 'entry',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Entry level position',
      };

      const job = await JobModel.create(jobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.title).toBe('Junior Developer');
      expect(job.requirements).toEqual([]);
      expect(job.benefits).toEqual([]);
      expect(job.compensation.currency).toBe('USD');
      expect(job.status).toBe('draft');
    });

    it('should create a job with active status', async () => {
      const jobData: CreateJobData = {
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Active Position',
        level: 'mid',
        location: 'New York, NY',
        type: 'full-time',
        remote: false,
        description: 'Active job posting',
        status: 'active',
      };

      const job = await JobModel.create(jobData);

      expect(job.status).toBe('active');
    });

    it('should link job to organization', async () => {
      const jobData: CreateJobData = {
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Test Job',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Test description',
      };

      const job = await JobModel.create(jobData);

      expect(job.orgId).toBe(testOrgId);

      // Verify organization exists in PostgreSQL
      const orgResult = await pool.query('SELECT id FROM orgs WHERE id = $1', [testOrgId]);
      expect(orgResult.rows.length).toBe(1);
      expect(orgResult.rows[0].id).toBe(testOrgId);
    });

    it('should link job to recruiter', async () => {
      const jobData: CreateJobData = {
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Test Job',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Test description',
      };

      const job = await JobModel.create(jobData);

      expect(job.createdBy).toBe(testRecruiterId);

      // Verify recruiter exists
      const recruiterResult = await pool.query('SELECT id FROM users WHERE id = $1', [
        testRecruiterId,
      ]);
      expect(recruiterResult.rows.length).toBe(1);
    });

    it('should create multiple jobs for same organization', async () => {
      const job1 = await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Job 1',
        level: 'entry',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'First job',
      });

      const job2 = await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Job 2',
        level: 'senior',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Second job',
      });

      expect(job1.id).not.toBe(job2.id);
      expect(job1.orgId).toBe(testOrgId);
      expect(job2.orgId).toBe(testOrgId);
    });
  });

  describe('Job Search with Various Filters', () => {
    beforeEach(async () => {
      // Create multiple test jobs with different attributes
      await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Senior Software Engineer',
        level: 'senior',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        description: 'Senior position',
        status: 'active',
      });

      await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Junior Developer',
        level: 'entry',
        location: 'New York, NY',
        type: 'full-time',
        remote: false,
        description: 'Entry level position',
        status: 'active',
      });

      await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Mid-Level Engineer',
        level: 'mid',
        location: 'Remote',
        type: 'contract',
        remote: true,
        description: 'Contract position',
        status: 'active',
      });

      await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Draft Position',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Draft job',
        status: 'draft',
      });

      await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Closed Position',
        level: 'senior',
        location: 'Boston, MA',
        type: 'full-time',
        remote: false,
        description: 'Closed job',
        status: 'closed',
      });
    });

    it('should search all jobs without filters', async () => {
      const result = await JobModel.search();

      expect(result.jobs).toBeDefined();
      expect(result.jobs.length).toBe(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter jobs by title', async () => {
      const result = await JobModel.search({
        filters: { title: 'Senior' },
      });

      expect(result.jobs.length).toBe(1);
      expect(result.jobs[0].title).toContain('Senior');
      expect(result.total).toBe(1);
    });

    it('should filter jobs by level', async () => {
      const result = await JobModel.search({
        filters: { level: 'mid' },
      });

      expect(result.jobs.length).toBe(2);
      expect(result.jobs.every((job) => job.level === 'mid')).toBe(true);
    });

    it('should filter jobs by location', async () => {
      const result = await JobModel.search({
        filters: { location: 'San Francisco' },
      });

      expect(result.jobs.length).toBe(1);
      expect(result.jobs[0].location).toContain('San Francisco');
    });

    it('should filter jobs by remote status', async () => {
      const result = await JobModel.search({
        filters: { remote: true },
      });

      expect(result.jobs.length).toBe(3);
      expect(result.jobs.every((job) => job.remote === true)).toBe(true);
    });

    it('should filter jobs by status', async () => {
      const result = await JobModel.search({
        filters: { status: 'active' },
      });

      expect(result.jobs.length).toBe(3);
      expect(result.jobs.every((job) => job.status === 'active')).toBe(true);
    });

    it('should filter jobs by organization', async () => {
      const result = await JobModel.search({
        filters: { orgId: testOrgId },
      });

      expect(result.jobs.length).toBe(5);
      expect(result.jobs.every((job) => job.orgId === testOrgId)).toBe(true);
    });

    it('should filter jobs by recruiter', async () => {
      const result = await JobModel.search({
        filters: { createdBy: testRecruiterId },
      });

      expect(result.jobs.length).toBe(5);
      expect(result.jobs.every((job) => job.createdBy === testRecruiterId)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const result = await JobModel.search({
        filters: {
          level: 'senior',
          remote: true,
          status: 'active',
        },
      });

      expect(result.jobs.length).toBe(1);
      expect(result.jobs[0].title).toBe('Senior Software Engineer');
      expect(result.jobs[0].level).toBe('senior');
      expect(result.jobs[0].remote).toBe(true);
      expect(result.jobs[0].status).toBe('active');
    });

    it('should paginate search results', async () => {
      // Create more jobs for pagination
      for (let i = 0; i < 20; i++) {
        await JobModel.create({
          orgId: testOrgId,
          createdBy: testRecruiterId,
          title: `Job ${i}`,
          level: 'mid',
          location: 'Remote',
          type: 'full-time',
          remote: true,
          description: `Description ${i}`,
          status: 'active',
        });
      }

      const page1 = await JobModel.search({ page: 1, limit: 10 });
      expect(page1.jobs.length).toBe(10);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(10);
      expect(page1.total).toBe(25);
      expect(page1.totalPages).toBe(3);

      const page2 = await JobModel.search({ page: 2, limit: 10 });
      expect(page2.jobs.length).toBe(10);
      expect(page2.page).toBe(2);

      const page3 = await JobModel.search({ page: 3, limit: 10 });
      expect(page3.jobs.length).toBe(5);
      expect(page3.page).toBe(3);
    });

    it('should return empty results for non-matching filters', async () => {
      const result = await JobModel.search({
        filters: { title: 'NonExistentJob' },
      });

      expect(result.jobs.length).toBe(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle case-insensitive title search', async () => {
      const result = await JobModel.search({
        filters: { title: 'senior' },
      });

      expect(result.jobs.length).toBe(1);
      expect(result.jobs[0].title).toContain('Senior');
    });

    it('should handle case-insensitive location search', async () => {
      const result = await JobModel.search({
        filters: { location: 'san francisco' },
      });

      expect(result.jobs.length).toBe(1);
      expect(result.jobs[0].location).toContain('San Francisco');
    });
  });

  describe('Job Updates and Status Changes', () => {
    let testJobId: string;

    beforeEach(async () => {
      const job = await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Original Title',
        level: 'mid',
        location: 'Original Location',
        type: 'full-time',
        remote: false,
        description: 'Original description',
        requirements: ['Original requirement'],
        compensation: { min: 100000, max: 120000, currency: 'USD' },
        benefits: ['Original benefit'],
        status: 'draft',
      });
      testJobId = job.id;
    });

    it('should update job title', async () => {
      const updated = await JobModel.update(testJobId, {
        title: 'Updated Title',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.level).toBe('mid'); // Other fields unchanged
    });

    it('should update job level', async () => {
      const updated = await JobModel.update(testJobId, {
        level: 'senior',
      });

      expect(updated?.level).toBe('senior');
    });

    it('should update job location', async () => {
      const updated = await JobModel.update(testJobId, {
        location: 'New Location',
      });

      expect(updated?.location).toBe('New Location');
    });

    it('should update job type', async () => {
      const updated = await JobModel.update(testJobId, {
        type: 'contract',
      });

      expect(updated?.type).toBe('contract');
    });

    it('should update remote status', async () => {
      const updated = await JobModel.update(testJobId, {
        remote: true,
      });

      expect(updated?.remote).toBe(true);
    });

    it('should update job description', async () => {
      const updated = await JobModel.update(testJobId, {
        description: 'Updated description',
      });

      expect(updated?.description).toBe('Updated description');
    });

    it('should update job requirements', async () => {
      const updated = await JobModel.update(testJobId, {
        requirements: ['New requirement 1', 'New requirement 2'],
      });

      expect(updated?.requirements).toEqual(['New requirement 1', 'New requirement 2']);
    });

    it('should update job compensation', async () => {
      const updated = await JobModel.update(testJobId, {
        compensation: {
          min: 150000,
          max: 180000,
          currency: 'USD',
          equity: '0.5%',
        },
      });

      expect(updated?.compensation.min).toBe(150000);
      expect(updated?.compensation.max).toBe(180000);
      expect(updated?.compensation.equity).toBe('0.5%');
    });

    it('should update job benefits', async () => {
      const updated = await JobModel.update(testJobId, {
        benefits: ['New benefit 1', 'New benefit 2'],
      });

      expect(updated?.benefits).toEqual(['New benefit 1', 'New benefit 2']);
    });

    it('should update multiple fields at once', async () => {
      const updated = await JobModel.update(testJobId, {
        title: 'Multi-Update Title',
        level: 'senior',
        location: 'Multi-Update Location',
        remote: true,
      });

      expect(updated?.title).toBe('Multi-Update Title');
      expect(updated?.level).toBe('senior');
      expect(updated?.location).toBe('Multi-Update Location');
      expect(updated?.remote).toBe(true);
    });

    it('should change status from draft to active', async () => {
      const updated = await JobModel.update(testJobId, {
        status: 'active',
      });

      expect(updated?.status).toBe('active');
      expect(updated?.publishedAt).toBeInstanceOf(Date);
    });

    it('should change status from active to closed', async () => {
      // First activate the job
      await JobModel.update(testJobId, { status: 'active' });

      // Then close it
      const updated = await JobModel.update(testJobId, {
        status: 'closed',
      });

      expect(updated?.status).toBe('closed');
    });

    it('should set publishedAt when status changes to active', async () => {
      const beforeUpdate = await JobModel.findById(testJobId);
      expect(beforeUpdate?.publishedAt).toBeFalsy(); // null or undefined for draft jobs

      const updated = await JobModel.update(testJobId, {
        status: 'active',
      });

      expect(updated?.publishedAt).toBeInstanceOf(Date);
      expect(updated?.publishedAt).toBeTruthy();
    });

    it('should update updatedAt timestamp', async () => {
      const original = await JobModel.findById(testJobId);
      const originalUpdatedAt = original?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await JobModel.update(testJobId, {
        title: 'Updated Title',
      });

      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt?.getTime() || 0);
    });

    it('should return null when updating non-existent job', async () => {
      const result = await JobModel.update('00000000-0000-0000-0000-000000000000', {
        title: 'New Title',
      });

      expect(result).toBeNull();
    });

    it('should preserve other fields when updating', async () => {
      const updated = await JobModel.update(testJobId, {
        title: 'New Title',
      });

      expect(updated?.orgId).toBe(testOrgId);
      expect(updated?.createdBy).toBe(testRecruiterId);
      expect(updated?.level).toBe('mid');
      expect(updated?.location).toBe('Original Location');
      expect(updated?.description).toBe('Original description');
    });

    it('should soft delete job by setting status to closed', async () => {
      const deleted = await JobModel.delete(testJobId);

      expect(deleted).toBeDefined();
      expect(deleted?.status).toBe('closed');

      // Verify job still exists in database
      const job = await JobModel.findById(testJobId);
      expect(job).toBeDefined();
      expect(job?.status).toBe('closed');
    });

    it('should find job by ID after update', async () => {
      await JobModel.update(testJobId, {
        title: 'Updated Title',
      });

      const job = await JobModel.findById(testJobId);

      expect(job).toBeDefined();
      expect(job?.id).toBe(testJobId);
      expect(job?.title).toBe('Updated Title');
    });
  });

  describe('Job Retrieval Methods', () => {
    let job1Id: string;
    let job2Id: string;
    let otherRecruiterId: string;

    beforeEach(async () => {
      // Create another recruiter
      const recruiter = await pool.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['other@test.com', 'hash', 'Other Recruiter', 'recruiter']
      );
      otherRecruiterId = recruiter.rows[0].id;

      // Create jobs
      const job1 = await JobModel.create({
        orgId: testOrgId,
        createdBy: testRecruiterId,
        title: 'Job 1',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'First job',
        status: 'active',
      });
      job1Id = job1.id;

      const job2 = await JobModel.create({
        orgId: testOrgId,
        createdBy: otherRecruiterId,
        title: 'Job 2',
        level: 'senior',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Second job',
        status: 'active',
      });
      job2Id = job2.id;
    });

    it('should find job by ID', async () => {
      const job = await JobModel.findById(job1Id);

      expect(job).toBeDefined();
      expect(job?.id).toBe(job1Id);
      expect(job?.title).toBe('Job 1');
    });

    it('should return null for non-existent job ID', async () => {
      const job = await JobModel.findById('00000000-0000-0000-0000-000000000000');

      expect(job).toBeNull();
    });

    it('should find jobs by organization ID', async () => {
      const jobs = await JobModel.findByOrgId(testOrgId);

      expect(jobs.length).toBe(2);
      expect(jobs.every((job) => job.orgId === testOrgId)).toBe(true);
    });

    it('should find jobs by recruiter ID', async () => {
      const jobs = await JobModel.findByCreatedBy(testRecruiterId);

      expect(jobs.length).toBe(1);
      expect(jobs[0].id).toBe(job1Id);
      expect(jobs[0].createdBy).toBe(testRecruiterId);
    });

    it('should return empty array for organization with no jobs', async () => {
      const newOrgResult = await pool.query(
        `INSERT INTO orgs (name, website)
         VALUES ($1, $2)
         RETURNING id`,
        ['Empty Org', 'https://empty.com']
      );

      const jobs = await JobModel.findByOrgId(newOrgResult.rows[0].id);

      expect(jobs).toEqual([]);
    });

    it('should return empty array for recruiter with no jobs', async () => {
      const newRecruiter = await pool.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['new@test.com', 'hash', 'New Recruiter', 'recruiter']
      );

      const jobs = await JobModel.findByCreatedBy(newRecruiter.rows[0].id);

      expect(jobs).toEqual([]);
    });
  });
});
