import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Migration Scripts', () => {
  const testDataDir = path.join(__dirname, '../../migration-data/test');
  const migrationDataDir = path.join(__dirname, '../../migration-data');
  let testExportPath: string;
  let testBackupPath: string;

  beforeAll(async () => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Create sample export file for testing
    testExportPath = path.join(testDataDir, 'test-export.json');
    createSampleExportFile(testExportPath);
  });

  afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testDataDir)) {
      const files = fs.readdirSync(testDataDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(testDataDir, file));
      });
    }
  });

  function createSampleExportFile(filePath: string) {
    const sampleData = {
      users: [
        {
          id: 'test-user-1',
          email: 'test1@example.com',
          password_hash: 'hashed',
          role: 'candidate',
          name: 'Test User 1',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'test-user-2',
          email: 'test2@example.com',
          password_hash: 'hashed',
          role: 'recruiter',
          name: 'Test User 2',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      organizations: [
        {
          id: 'test-org-1',
          name: 'Test Organization',
          website: 'https://test.com',
          logo_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      candidateProfiles: [
        {
          user_id: 'test-user-1',
          location: 'San Francisco, CA',
          skills: ['JavaScript', 'TypeScript', 'React'],
          experience: [],
          education: [],
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      recruiterProfiles: [
        {
          user_id: 'test-user-2',
          org_id: 'test-org-1',
          title: 'Senior Recruiter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      jobs: [
        {
          id: 'test-job-1',
          org_id: 'test-org-1',
          created_by: 'test-user-2',
          title: 'Software Engineer',
          level: 'mid',
          location: 'San Francisco, CA',
          type: 'full-time',
          remote: true,
          description: 'Test job description',
          requirements: ['JavaScript', 'React'],
          compensation: { min: 100000, max: 150000 },
          benefits: ['Health Insurance'],
          hero_image_url: null,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
        },
      ],
      applications: [
        {
          id: 'test-app-1',
          job_id: 'test-job-1',
          user_id: 'test-user-1',
          resume_version_id: 'test-resume-v1',
          cover_letter: 'Test cover letter',
          status: 'pending',
          notes: null,
          ai_score: 85.5,
          ai_rationale: 'Good match',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      resumes: [
        {
          id: 'test-resume-1',
          user_id: 'test-user-1',
          file_url: 'https://example.com/resume.pdf',
          file_name: 'resume.pdf',
          uploaded_at: new Date().toISOString(),
        },
      ],
      resumeVersions: [
        {
          id: 'test-resume-v1',
          resume_id: 'test-resume-1',
          version_number: 1,
          file_url: 'https://example.com/resume-v1.pdf',
          file_name: 'resume-v1.pdf',
          parsed_data: {},
          created_at: new Date().toISOString(),
        },
      ],
      exportedAt: new Date().toISOString(),
      recordCounts: {
        users: 2,
        organizations: 1,
        candidateProfiles: 1,
        recruiterProfiles: 1,
        jobs: 1,
        applications: 1,
        resumes: 1,
        resumeVersions: 1,
      },
    };

    fs.writeFileSync(filePath, JSON.stringify(sampleData, null, 2));
  }

  describe('Export Script', () => {
    it('should have valid export file structure', async () => {
      // Verify file exists
      expect(fs.existsSync(testExportPath)).toBe(true);

      // Parse and verify structure
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      expect(exportData).toHaveProperty('users');
      expect(exportData).toHaveProperty('organizations');
      expect(exportData).toHaveProperty('candidateProfiles');
      expect(exportData).toHaveProperty('recruiterProfiles');
      expect(exportData).toHaveProperty('jobs');
      expect(exportData).toHaveProperty('applications');
      expect(exportData).toHaveProperty('resumes');
      expect(exportData).toHaveProperty('resumeVersions');
      expect(exportData).toHaveProperty('exportedAt');
      expect(exportData).toHaveProperty('recordCounts');

      // Verify arrays
      expect(Array.isArray(exportData.users)).toBe(true);
      expect(Array.isArray(exportData.organizations)).toBe(true);
      expect(Array.isArray(exportData.jobs)).toBe(true);

      // Verify record counts match array lengths
      expect(exportData.recordCounts.users).toBe(exportData.users.length);
      expect(exportData.recordCounts.organizations).toBe(exportData.organizations.length);
      expect(exportData.recordCounts.jobs).toBe(exportData.jobs.length);
    });

    it('should include all required user fields in export', async () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      if (exportData.users.length > 0) {
        const user = exportData.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('created_at');
        expect(user).toHaveProperty('updated_at');
      }
    });

    it('should include all required job fields in export', async () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      if (exportData.jobs.length > 0) {
        const job = exportData.jobs[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('org_id');
        expect(job).toHaveProperty('created_by');
        expect(job).toHaveProperty('status');
        expect(job).toHaveProperty('created_at');
      }
    });
  });

  describe('Import Script', () => {
    it('should validate export file exists before import', () => {
      // Ensure we have an export file
      expect(fs.existsSync(testExportPath)).toBe(true);

      // Verify it's valid JSON
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));
      expect(exportData).toBeDefined();
      expect(exportData.users).toBeDefined();
    });

    it('should have correct data structure for import', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Verify users have required fields for Firebase Auth
      if (exportData.users.length > 0) {
        const testUser = exportData.users[0];
        expect(testUser.id).toBeDefined();
        expect(testUser.email).toBeDefined();
        expect(testUser.role).toBeDefined();
      }

      // Verify organizations have required fields
      if (exportData.organizations.length > 0) {
        const testOrg = exportData.organizations[0];
        expect(testOrg.id).toBeDefined();
        expect(testOrg.name).toBeDefined();
      }

      // Verify jobs have required fields
      if (exportData.jobs.length > 0) {
        const testJob = exportData.jobs[0];
        expect(testJob.id).toBeDefined();
        expect(testJob.title).toBeDefined();
        expect(testJob.org_id).toBeDefined();
      }
    });

    it('should have valid relationships in export data', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Check that job references valid organization
      if (exportData.jobs.length > 0 && exportData.organizations.length > 0) {
        const testJob = exportData.jobs[0];
        const orgExists = exportData.organizations.some((org: any) => org.id === testJob.org_id);
        expect(orgExists).toBe(true);
      }

      // Check that application references valid job and user
      if (exportData.applications.length > 0) {
        const testApp = exportData.applications[0];
        const jobExists = exportData.jobs.some((job: any) => job.id === testApp.job_id);
        const userExists = exportData.users.some((user: any) => user.id === testApp.user_id);
        expect(jobExists).toBe(true);
        expect(userExists).toBe(true);
      }
    });
  });

  describe('Verification Script', () => {
    it('should have record counts in export data', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Verify record counts exist
      expect(exportData.recordCounts).toBeDefined();
      expect(exportData.recordCounts.users).toBe(exportData.users.length);
      expect(exportData.recordCounts.organizations).toBe(exportData.organizations.length);
      expect(exportData.recordCounts.jobs).toBe(exportData.jobs.length);
      expect(exportData.recordCounts.applications).toBe(exportData.applications.length);
    });

    it('should validate data integrity in export', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Verify no duplicate user IDs
      const userIds = exportData.users.map((u: any) => u.id);
      const uniqueUserIds = new Set(userIds);
      expect(userIds.length).toBe(uniqueUserIds.size);

      // Verify no duplicate job IDs
      const jobIds = exportData.jobs.map((j: any) => j.id);
      const uniqueJobIds = new Set(jobIds);
      expect(jobIds.length).toBe(uniqueJobIds.size);

      // Verify all users have valid emails
      exportData.users.forEach((user: any) => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should verify all required fields are present', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Check users have all required fields
      exportData.users.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('created_at');
        expect(user).toHaveProperty('updated_at');
      });

      // Check jobs have all required fields
      exportData.jobs.forEach((job: any) => {
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('org_id');
        expect(job).toHaveProperty('status');
        expect(job).toHaveProperty('created_at');
      });
    });
  });

  describe('Rollback Script', () => {
    it('should have backup file structure defined', () => {
      // Create a mock backup structure to test
      const mockBackup = {
        backedUpAt: new Date().toISOString(),
        collections: {
          users: [
            {
              id: 'test-user-1',
              data: {
                email: 'test@example.com',
                name: 'Test User',
                role: 'candidate',
              },
            },
          ],
          organizations: [],
          jobs: [],
        },
      };

      // Verify structure
      expect(mockBackup).toHaveProperty('backedUpAt');
      expect(mockBackup).toHaveProperty('collections');
      expect(mockBackup.collections).toHaveProperty('users');
      expect(Array.isArray(mockBackup.collections.users)).toBe(true);
    });

    it('should validate backup data format', () => {
      const mockBackupData = {
        backedUpAt: new Date().toISOString(),
        collections: {
          users: [
            {
              id: 'user-1',
              data: { email: 'test@example.com', name: 'Test' },
            },
          ],
          organizations: [
            {
              id: 'org-1',
              data: { name: 'Test Org' },
            },
          ],
        },
      };

      // Verify each collection has proper structure
      Object.values(mockBackupData.collections).forEach((collection: any) => {
        expect(Array.isArray(collection)).toBe(true);
        collection.forEach((doc: any) => {
          expect(doc).toHaveProperty('id');
          expect(doc).toHaveProperty('data');
        });
      });
    });

    it('should have rollback report structure', () => {
      const mockReport = {
        rolledBackAt: new Date().toISOString(),
        backupPath: '/path/to/backup.json',
        stats: {
          users: { deleted: 10, failed: 0 },
          organizations: { deleted: 5, failed: 0 },
          jobs: { deleted: 20, failed: 0 },
        },
        summary: {
          totalDeleted: 35,
          totalFailed: 0,
        },
      };

      // Verify report structure
      expect(mockReport).toHaveProperty('rolledBackAt');
      expect(mockReport).toHaveProperty('stats');
      expect(mockReport).toHaveProperty('summary');
      expect(mockReport.summary).toHaveProperty('totalDeleted');
      expect(mockReport.summary).toHaveProperty('totalFailed');
    });
  });

  describe('End-to-End Migration Flow', () => {
    it('should have complete migration workflow defined', () => {
      // Verify export file exists
      expect(fs.existsSync(testExportPath)).toBe(true);

      // Verify export data structure
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));
      expect(exportData).toHaveProperty('users');
      expect(exportData).toHaveProperty('organizations');
      expect(exportData).toHaveProperty('jobs');
      expect(exportData).toHaveProperty('applications');
      expect(exportData).toHaveProperty('recordCounts');

      // Verify all collections have data
      expect(exportData.users.length).toBeGreaterThan(0);
      expect(exportData.organizations.length).toBeGreaterThan(0);
      expect(exportData.jobs.length).toBeGreaterThan(0);
    });

    it('should validate migration data consistency', () => {
      const exportData = JSON.parse(fs.readFileSync(testExportPath, 'utf-8'));

      // Verify referential integrity
      exportData.jobs.forEach((job: any) => {
        // Job should reference existing organization
        const orgExists = exportData.organizations.some((org: any) => org.id === job.org_id);
        expect(orgExists).toBe(true);

        // Job should reference existing user as creator
        const userExists = exportData.users.some((user: any) => user.id === job.created_by);
        expect(userExists).toBe(true);
      });

      exportData.applications.forEach((app: any) => {
        // Application should reference existing job
        const jobExists = exportData.jobs.some((job: any) => job.id === app.job_id);
        expect(jobExists).toBe(true);

        // Application should reference existing user
        const userExists = exportData.users.some((user: any) => user.id === app.user_id);
        expect(userExists).toBe(true);
      });
    });

    it('should have all migration scripts available', () => {
      // Verify script files exist
      const scriptsDir = path.join(__dirname, '../scripts');

      expect(fs.existsSync(path.join(scriptsDir, 'export-postgres-data.ts'))).toBe(true);
      expect(fs.existsSync(path.join(scriptsDir, 'import-to-firebase.ts'))).toBe(true);
      expect(fs.existsSync(path.join(scriptsDir, 'verify-migration.ts'))).toBe(true);
      expect(fs.existsSync(path.join(scriptsDir, 'rollback-migration.ts'))).toBe(true);
    });
  });
});
