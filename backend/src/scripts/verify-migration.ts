import pool from '../config/database';
import { firestore } from '../config/firebase';
import fs from 'fs';
import path from 'path';

interface VerificationResult {
  collection: string;
  postgresCount: number;
  firestoreCount: number;
  match: boolean;
  difference: number;
}

interface FieldMapping {
  postgres: string;
  firestore: string;
}

interface SampleComparison {
  collection: string;
  sampleId: string;
  postgresData: any;
  firestoreData: any;
  fieldsMatch: boolean;
  mismatches: string[];
}

async function verifyMigration(): Promise<void> {
  console.log('🔍 Starting migration verification...\n');

  const results: VerificationResult[] = [];
  const sampleComparisons: SampleComparison[] = [];
  const errors: string[] = [];

  try {
    // Verify users
    console.log('👥 Verifying users...');
    const postgresUsers = await pool.query('SELECT COUNT(*) FROM users');
    const firestoreUsers = await firestore.collection('users').count().get();

    const usersResult: VerificationResult = {
      collection: 'users',
      postgresCount: parseInt(postgresUsers.rows[0].count),
      firestoreCount: firestoreUsers.data().count,
      match: postgresUsers.rows[0].count === firestoreUsers.data().count.toString(),
      difference: parseInt(postgresUsers.rows[0].count) - firestoreUsers.data().count,
    };
    results.push(usersResult);
    console.log(
      `   PostgreSQL: ${usersResult.postgresCount}, Firestore: ${usersResult.firestoreCount} ${usersResult.match ? '✅' : '❌'}`
    );

    // Sample verification for users
    const sampleUser = await pool.query('SELECT * FROM users LIMIT 1');
    if (sampleUser.rows.length > 0) {
      const userId = sampleUser.rows[0].id;
      const firestoreUserDoc = await firestore.collection('users').doc(userId).get();

      if (firestoreUserDoc.exists) {
        const pgData = sampleUser.rows[0];
        const fsData = firestoreUserDoc.data()!;
        const mismatches: string[] = [];

        if (pgData.email !== fsData.email) mismatches.push('email');
        if (pgData.name !== fsData.name) mismatches.push('name');
        if (pgData.role !== fsData.role) mismatches.push('role');

        sampleComparisons.push({
          collection: 'users',
          sampleId: userId,
          postgresData: {
            email: pgData.email,
            name: pgData.name,
            role: pgData.role,
          },
          firestoreData: {
            email: fsData.email,
            name: fsData.name,
            role: fsData.role,
          },
          fieldsMatch: mismatches.length === 0,
          mismatches,
        });
      }
    }

    // Verify organizations
    console.log('🏢 Verifying organizations...');
    const postgresOrgs = await pool.query('SELECT COUNT(*) FROM orgs');
    const firestoreOrgs = await firestore.collection('organizations').count().get();

    const orgsResult: VerificationResult = {
      collection: 'organizations',
      postgresCount: parseInt(postgresOrgs.rows[0].count),
      firestoreCount: firestoreOrgs.data().count,
      match: postgresOrgs.rows[0].count === firestoreOrgs.data().count.toString(),
      difference: parseInt(postgresOrgs.rows[0].count) - firestoreOrgs.data().count,
    };
    results.push(orgsResult);
    console.log(
      `   PostgreSQL: ${orgsResult.postgresCount}, Firestore: ${orgsResult.firestoreCount} ${orgsResult.match ? '✅' : '❌'}`
    );

    // Verify candidate profiles
    console.log('👤 Verifying candidate profiles...');
    const postgresCandidates = await pool.query('SELECT COUNT(*) FROM candidate_profiles');
    const firestoreCandidates = await firestore.collection('candidateProfiles').count().get();

    const candidatesResult: VerificationResult = {
      collection: 'candidateProfiles',
      postgresCount: parseInt(postgresCandidates.rows[0].count),
      firestoreCount: firestoreCandidates.data().count,
      match: postgresCandidates.rows[0].count === firestoreCandidates.data().count.toString(),
      difference: parseInt(postgresCandidates.rows[0].count) - firestoreCandidates.data().count,
    };
    results.push(candidatesResult);
    console.log(
      `   PostgreSQL: ${candidatesResult.postgresCount}, Firestore: ${candidatesResult.firestoreCount} ${candidatesResult.match ? '✅' : '❌'}`
    );

    // Verify recruiter profiles
    console.log('💼 Verifying recruiter profiles...');
    const postgresRecruiters = await pool.query('SELECT COUNT(*) FROM recruiter_profiles');
    const firestoreRecruiters = await firestore.collection('recruiterProfiles').count().get();

    const recruitersResult: VerificationResult = {
      collection: 'recruiterProfiles',
      postgresCount: parseInt(postgresRecruiters.rows[0].count),
      firestoreCount: firestoreRecruiters.data().count,
      match: postgresRecruiters.rows[0].count === firestoreRecruiters.data().count.toString(),
      difference: parseInt(postgresRecruiters.rows[0].count) - firestoreRecruiters.data().count,
    };
    results.push(recruitersResult);
    console.log(
      `   PostgreSQL: ${recruitersResult.postgresCount}, Firestore: ${recruitersResult.firestoreCount} ${recruitersResult.match ? '✅' : '❌'}`
    );

    // Verify jobs
    console.log('💼 Verifying jobs...');
    const postgresJobs = await pool.query('SELECT COUNT(*) FROM jobs');
    const firestoreJobs = await firestore.collection('jobs').count().get();

    const jobsResult: VerificationResult = {
      collection: 'jobs',
      postgresCount: parseInt(postgresJobs.rows[0].count),
      firestoreCount: firestoreJobs.data().count,
      match: postgresJobs.rows[0].count === firestoreJobs.data().count.toString(),
      difference: parseInt(postgresJobs.rows[0].count) - firestoreJobs.data().count,
    };
    results.push(jobsResult);
    console.log(
      `   PostgreSQL: ${jobsResult.postgresCount}, Firestore: ${jobsResult.firestoreCount} ${jobsResult.match ? '✅' : '❌'}`
    );

    // Sample verification for jobs
    const sampleJob = await pool.query('SELECT * FROM jobs LIMIT 1');
    if (sampleJob.rows.length > 0) {
      const jobId = sampleJob.rows[0].id;
      const firestoreJobDoc = await firestore.collection('jobs').doc(jobId).get();

      if (firestoreJobDoc.exists) {
        const pgData = sampleJob.rows[0];
        const fsData = firestoreJobDoc.data()!;
        const mismatches: string[] = [];

        if (pgData.title !== fsData.title) mismatches.push('title');
        if (pgData.level !== fsData.level) mismatches.push('level');
        if (pgData.location !== fsData.location) mismatches.push('location');
        if (pgData.status !== fsData.status) mismatches.push('status');

        sampleComparisons.push({
          collection: 'jobs',
          sampleId: jobId,
          postgresData: {
            title: pgData.title,
            level: pgData.level,
            location: pgData.location,
            status: pgData.status,
          },
          firestoreData: {
            title: fsData.title,
            level: fsData.level,
            location: fsData.location,
            status: fsData.status,
          },
          fieldsMatch: mismatches.length === 0,
          mismatches,
        });
      }
    }

    // Verify applications
    console.log('📝 Verifying applications...');
    const postgresApplications = await pool.query('SELECT COUNT(*) FROM applications');
    const firestoreApplications = await firestore.collection('applications').count().get();

    const applicationsResult: VerificationResult = {
      collection: 'applications',
      postgresCount: parseInt(postgresApplications.rows[0].count),
      firestoreCount: firestoreApplications.data().count,
      match: postgresApplications.rows[0].count === firestoreApplications.data().count.toString(),
      difference: parseInt(postgresApplications.rows[0].count) - firestoreApplications.data().count,
    };
    results.push(applicationsResult);
    console.log(
      `   PostgreSQL: ${applicationsResult.postgresCount}, Firestore: ${applicationsResult.firestoreCount} ${applicationsResult.match ? '✅' : '❌'}`
    );

    // Verify resumes
    console.log('📄 Verifying resumes...');
    const postgresResumes = await pool.query('SELECT COUNT(*) FROM resumes');
    const firestoreResumes = await firestore.collection('resumes').count().get();

    const resumesResult: VerificationResult = {
      collection: 'resumes',
      postgresCount: parseInt(postgresResumes.rows[0].count),
      firestoreCount: firestoreResumes.data().count,
      match: postgresResumes.rows[0].count === firestoreResumes.data().count.toString(),
      difference: parseInt(postgresResumes.rows[0].count) - firestoreResumes.data().count,
    };
    results.push(resumesResult);
    console.log(
      `   PostgreSQL: ${resumesResult.postgresCount}, Firestore: ${resumesResult.firestoreCount} ${resumesResult.match ? '✅' : '❌'}`
    );

    // Verify resume versions
    console.log('📑 Verifying resume versions...');
    const postgresVersions = await pool.query('SELECT COUNT(*) FROM resume_versions');

    // Count all resume versions across all resumes
    let totalVersions = 0;
    const resumeDocs = await firestore.collection('resumes').get();
    for (const resumeDoc of resumeDocs.docs) {
      const versionsSnapshot = await resumeDoc.ref.collection('versions').count().get();
      totalVersions += versionsSnapshot.data().count;
    }

    const versionsResult: VerificationResult = {
      collection: 'resumeVersions',
      postgresCount: parseInt(postgresVersions.rows[0].count),
      firestoreCount: totalVersions,
      match: postgresVersions.rows[0].count === totalVersions.toString(),
      difference: parseInt(postgresVersions.rows[0].count) - totalVersions,
    };
    results.push(versionsResult);
    console.log(
      `   PostgreSQL: ${versionsResult.postgresCount}, Firestore: ${versionsResult.firestoreCount} ${versionsResult.match ? '✅' : '❌'}`
    );

    // Verify relationships
    console.log('\n🔗 Verifying relationships...');

    // Check if all applications reference valid jobs and users
    const applicationsWithInvalidRefs = await pool.query(`
      SELECT a.id 
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE j.id IS NULL OR u.id IS NULL
    `);

    if (applicationsWithInvalidRefs.rows.length > 0) {
      errors.push(
        `Found ${applicationsWithInvalidRefs.rows.length} applications with invalid job or user references`
      );
      console.log(
        `   ❌ ${applicationsWithInvalidRefs.rows.length} applications have invalid references`
      );
    } else {
      console.log('   ✅ All application relationships are valid');
    }

    // Check if all jobs reference valid organizations
    const jobsWithInvalidOrgs = await pool.query(`
      SELECT j.id 
      FROM jobs j
      LEFT JOIN orgs o ON j.org_id = o.id
      WHERE o.id IS NULL
    `);

    if (jobsWithInvalidOrgs.rows.length > 0) {
      errors.push(
        `Found ${jobsWithInvalidOrgs.rows.length} jobs with invalid organization references`
      );
      console.log(
        `   ❌ ${jobsWithInvalidOrgs.rows.length} jobs have invalid organization references`
      );
    } else {
      console.log('   ✅ All job-organization relationships are valid');
    }

    // Generate verification report
    const reportDir = path.join(__dirname, '../../migration-data');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `verification-report-${timestamp}.json`);

    const allMatch = results.every((r) => r.match);
    const totalPostgres = results.reduce((sum, r) => sum + r.postgresCount, 0);
    const totalFirestore = results.reduce((sum, r) => sum + r.firestoreCount, 0);

    const report = {
      verifiedAt: new Date().toISOString(),
      overallStatus: allMatch && errors.length === 0 ? 'PASS' : 'FAIL',
      summary: {
        totalPostgresRecords: totalPostgres,
        totalFirestoreRecords: totalFirestore,
        allCountsMatch: allMatch,
        relationshipErrors: errors.length,
      },
      collectionResults: results,
      sampleComparisons,
      relationshipErrors: errors,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Overall Status: ${report.overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Total PostgreSQL Records: ${totalPostgres}`);
    console.log(`Total Firestore Records: ${totalFirestore}`);
    console.log(`All Counts Match: ${allMatch ? '✅ Yes' : '❌ No'}`);
    console.log(`Relationship Errors: ${errors.length}`);

    if (!allMatch) {
      console.log('\n⚠️  Collections with mismatched counts:');
      results
        .filter((r) => !r.match)
        .forEach((r) => {
          console.log(`   - ${r.collection}: difference of ${r.difference}`);
        });
    }

    if (errors.length > 0) {
      console.log('\n⚠️  Relationship errors found:');
      errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log('\n📁 Verification report saved to:', reportPath);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the verification
if (require.main === module) {
  verifyMigration()
    .then(() => {
      console.log('\n✨ Verification process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification process failed:', error);
      process.exit(1);
    });
}

export default verifyMigration;
