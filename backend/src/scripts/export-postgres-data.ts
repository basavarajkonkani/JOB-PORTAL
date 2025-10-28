import pool from '../config/database';
import fs from 'fs';
import path from 'path';

interface ExportData {
  users: any[];
  organizations: any[];
  candidateProfiles: any[];
  recruiterProfiles: any[];
  jobs: any[];
  applications: any[];
  resumes: any[];
  resumeVersions: any[];
  exportedAt: string;
  recordCounts: {
    users: number;
    organizations: number;
    candidateProfiles: number;
    recruiterProfiles: number;
    jobs: number;
    applications: number;
    resumes: number;
    resumeVersions: number;
  };
}

async function exportPostgresData(): Promise<void> {
  console.log('🚀 Starting PostgreSQL data export...\n');

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    const exportData: ExportData = {
      users: [],
      organizations: [],
      candidateProfiles: [],
      recruiterProfiles: [],
      jobs: [],
      applications: [],
      resumes: [],
      resumeVersions: [],
      exportedAt: new Date().toISOString(),
      recordCounts: {
        users: 0,
        organizations: 0,
        candidateProfiles: 0,
        recruiterProfiles: 0,
        jobs: 0,
        applications: 0,
        resumes: 0,
        resumeVersions: 0,
      },
    };

    // Export users
    console.log('📊 Exporting users...');
    const usersResult = await pool.query(`
      SELECT 
        id, email, password_hash, role, name, avatar_url, 
        created_at, updated_at
      FROM users
      ORDER BY created_at
    `);
    exportData.users = usersResult.rows;
    exportData.recordCounts.users = usersResult.rows.length;
    console.log(`   ✓ Exported ${usersResult.rows.length} users\n`);

    // Export organizations
    console.log('📊 Exporting organizations...');
    const orgsResult = await pool.query(`
      SELECT 
        id, name, website, logo_url, created_at, updated_at
      FROM orgs
      ORDER BY created_at
    `);
    exportData.organizations = orgsResult.rows;
    exportData.recordCounts.organizations = orgsResult.rows.length;
    console.log(`   ✓ Exported ${orgsResult.rows.length} organizations\n`);

    // Export candidate profiles
    console.log('📊 Exporting candidate profiles...');
    const candidateProfilesResult = await pool.query(`
      SELECT 
        user_id, location, skills, experience, education, 
        preferences, created_at, updated_at
      FROM candidate_profiles
      ORDER BY created_at
    `);
    exportData.candidateProfiles = candidateProfilesResult.rows;
    exportData.recordCounts.candidateProfiles = candidateProfilesResult.rows.length;
    console.log(`   ✓ Exported ${candidateProfilesResult.rows.length} candidate profiles\n`);

    // Export recruiter profiles
    console.log('📊 Exporting recruiter profiles...');
    const recruiterProfilesResult = await pool.query(`
      SELECT 
        user_id, org_id, title, created_at, updated_at
      FROM recruiter_profiles
      ORDER BY created_at
    `);
    exportData.recruiterProfiles = recruiterProfilesResult.rows;
    exportData.recordCounts.recruiterProfiles = recruiterProfilesResult.rows.length;
    console.log(`   ✓ Exported ${recruiterProfilesResult.rows.length} recruiter profiles\n`);

    // Export jobs
    console.log('📊 Exporting jobs...');
    const jobsResult = await pool.query(`
      SELECT 
        id, org_id, created_by, title, level, location, type, remote,
        description, requirements, compensation, benefits, hero_image_url,
        status, created_at, updated_at, published_at
      FROM jobs
      ORDER BY created_at
    `);
    exportData.jobs = jobsResult.rows;
    exportData.recordCounts.jobs = jobsResult.rows.length;
    console.log(`   ✓ Exported ${jobsResult.rows.length} jobs\n`);

    // Export applications
    console.log('📊 Exporting applications...');
    const applicationsResult = await pool.query(`
      SELECT 
        id, job_id, user_id, resume_version_id, cover_letter,
        status, notes, ai_score, ai_rationale, created_at, updated_at
      FROM applications
      ORDER BY created_at
    `);
    exportData.applications = applicationsResult.rows;
    exportData.recordCounts.applications = applicationsResult.rows.length;
    console.log(`   ✓ Exported ${applicationsResult.rows.length} applications\n`);

    // Export resumes
    console.log('📊 Exporting resumes...');
    const resumesResult = await pool.query(`
      SELECT 
        id, user_id, file_url, file_name, uploaded_at
      FROM resumes
      ORDER BY uploaded_at
    `);
    exportData.resumes = resumesResult.rows;
    exportData.recordCounts.resumes = resumesResult.rows.length;
    console.log(`   ✓ Exported ${resumesResult.rows.length} resumes\n`);

    // Export resume versions
    console.log('📊 Exporting resume versions...');
    const resumeVersionsResult = await pool.query(`
      SELECT 
        id, resume_id, version_number, file_url, file_name,
        parsed_data, created_at
      FROM resume_versions
      ORDER BY created_at
    `);
    exportData.resumeVersions = resumeVersionsResult.rows;
    exportData.recordCounts.resumeVersions = resumeVersionsResult.rows.length;
    console.log(`   ✓ Exported ${resumeVersionsResult.rows.length} resume versions\n`);

    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../migration-data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Write to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `postgres-export-${timestamp}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log('✅ Export completed successfully!\n');
    console.log('📁 Export file:', exportPath);
    console.log('\n📊 Summary:');
    console.log('   Users:', exportData.recordCounts.users);
    console.log('   Organizations:', exportData.recordCounts.organizations);
    console.log('   Candidate Profiles:', exportData.recordCounts.candidateProfiles);
    console.log('   Recruiter Profiles:', exportData.recordCounts.recruiterProfiles);
    console.log('   Jobs:', exportData.recordCounts.jobs);
    console.log('   Applications:', exportData.recordCounts.applications);
    console.log('   Resumes:', exportData.recordCounts.resumes);
    console.log('   Resume Versions:', exportData.recordCounts.resumeVersions);
    console.log(
      '\n💾 Total records exported:',
      Object.values(exportData.recordCounts).reduce((a, b) => a + b, 0)
    );
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the export
if (require.main === module) {
  exportPostgresData()
    .then(() => {
      console.log('\n✨ Export process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Export process failed:', error);
      process.exit(1);
    });
}

export default exportPostgresData;
