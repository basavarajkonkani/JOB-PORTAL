import { auth, firestore } from '../config/firebase';
import fs from 'fs';
import path from 'path';
import { Timestamp } from 'firebase-admin/firestore';

interface ImportStats {
  users: { success: number; failed: number };
  organizations: { success: number; failed: number };
  candidateProfiles: { success: number; failed: number };
  recruiterProfiles: { success: number; failed: number };
  jobs: { success: number; failed: number };
  applications: { success: number; failed: number };
  resumes: { success: number; failed: number };
  resumeVersions: { success: number; failed: number };
}

async function importToFirebase(exportFilePath: string): Promise<void> {
  console.log('🚀 Starting Firebase import...\n');
  console.log('📁 Reading export file:', exportFilePath);

  // Read export data
  const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));
  console.log('✅ Export file loaded successfully\n');

  const stats: ImportStats = {
    users: { success: 0, failed: 0 },
    organizations: { success: 0, failed: 0 },
    candidateProfiles: { success: 0, failed: 0 },
    recruiterProfiles: { success: 0, failed: 0 },
    jobs: { success: 0, failed: 0 },
    applications: { success: 0, failed: 0 },
    resumes: { success: 0, failed: 0 },
    resumeVersions: { success: 0, failed: 0 },
  };

  const errors: Array<{ type: string; id: string; error: string }> = [];

  try {
    // Import users to Firebase Auth and Firestore
    console.log('👥 Importing users...');
    for (const user of exportData.users) {
      try {
        // Create Firebase Auth user
        try {
          await auth.createUser({
            uid: user.id,
            email: user.email,
            displayName: user.name,
            // Note: Cannot import password_hash directly, users will need to reset passwords
          });
        } catch (authError: any) {
          if (authError.code === 'auth/uid-already-exists') {
            console.log(`   ⚠️  User ${user.email} already exists in Firebase Auth, skipping...`);
          } else {
            throw authError;
          }
        }

        // Set custom claims for role
        await auth.setCustomUserClaims(user.id, { role: user.role });

        // Create Firestore document
        await firestore
          .collection('users')
          .doc(user.id)
          .set({
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatar_url || null,
            createdAt: Timestamp.fromDate(new Date(user.created_at)),
            updatedAt: Timestamp.fromDate(new Date(user.updated_at)),
          });

        stats.users.success++;
        if (stats.users.success % 10 === 0) {
          console.log(`   ✓ Imported ${stats.users.success} users...`);
        }
      } catch (error: any) {
        stats.users.failed++;
        errors.push({
          type: 'user',
          id: user.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import user ${user.email}:`, error.message);
      }
    }
    console.log(
      `   ✅ Users import complete: ${stats.users.success} success, ${stats.users.failed} failed\n`
    );

    // Import organizations
    console.log('🏢 Importing organizations...');
    for (const org of exportData.organizations) {
      try {
        await firestore
          .collection('organizations')
          .doc(org.id)
          .set({
            name: org.name,
            website: org.website || null,
            logoUrl: org.logo_url || null,
            createdAt: Timestamp.fromDate(new Date(org.created_at)),
            updatedAt: Timestamp.fromDate(new Date(org.updated_at)),
          });

        stats.organizations.success++;
      } catch (error: any) {
        stats.organizations.failed++;
        errors.push({
          type: 'organization',
          id: org.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import organization ${org.name}:`, error.message);
      }
    }
    console.log(
      `   ✅ Organizations import complete: ${stats.organizations.success} success, ${stats.organizations.failed} failed\n`
    );

    // Import candidate profiles
    console.log('👤 Importing candidate profiles...');
    for (const profile of exportData.candidateProfiles) {
      try {
        await firestore
          .collection('candidateProfiles')
          .doc(profile.user_id)
          .set({
            userId: profile.user_id,
            location: profile.location || null,
            skills: profile.skills || [],
            experience: profile.experience || [],
            education: profile.education || [],
            preferences: profile.preferences || {},
            createdAt: Timestamp.fromDate(new Date(profile.created_at)),
            updatedAt: Timestamp.fromDate(new Date(profile.updated_at)),
          });

        stats.candidateProfiles.success++;
      } catch (error: any) {
        stats.candidateProfiles.failed++;
        errors.push({
          type: 'candidateProfile',
          id: profile.user_id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import candidate profile ${profile.user_id}:`, error.message);
      }
    }
    console.log(
      `   ✅ Candidate profiles import complete: ${stats.candidateProfiles.success} success, ${stats.candidateProfiles.failed} failed\n`
    );

    // Import recruiter profiles
    console.log('💼 Importing recruiter profiles...');
    for (const profile of exportData.recruiterProfiles) {
      try {
        await firestore
          .collection('recruiterProfiles')
          .doc(profile.user_id)
          .set({
            userId: profile.user_id,
            orgId: profile.org_id || null,
            title: profile.title || null,
            createdAt: Timestamp.fromDate(new Date(profile.created_at)),
            updatedAt: Timestamp.fromDate(new Date(profile.updated_at)),
          });

        stats.recruiterProfiles.success++;
      } catch (error: any) {
        stats.recruiterProfiles.failed++;
        errors.push({
          type: 'recruiterProfile',
          id: profile.user_id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import recruiter profile ${profile.user_id}:`, error.message);
      }
    }
    console.log(
      `   ✅ Recruiter profiles import complete: ${stats.recruiterProfiles.success} success, ${stats.recruiterProfiles.failed} failed\n`
    );

    // Import jobs
    console.log('💼 Importing jobs...');
    for (const job of exportData.jobs) {
      try {
        await firestore
          .collection('jobs')
          .doc(job.id)
          .set({
            orgId: job.org_id,
            createdBy: job.created_by,
            title: job.title,
            level: job.level,
            location: job.location,
            type: job.type,
            remote: job.remote,
            description: job.description,
            requirements: job.requirements || [],
            compensation: job.compensation || {},
            benefits: job.benefits || [],
            heroImageUrl: job.hero_image_url || null,
            status: job.status,
            createdAt: Timestamp.fromDate(new Date(job.created_at)),
            updatedAt: Timestamp.fromDate(new Date(job.updated_at)),
            publishedAt: job.published_at ? Timestamp.fromDate(new Date(job.published_at)) : null,
          });

        stats.jobs.success++;
        if (stats.jobs.success % 10 === 0) {
          console.log(`   ✓ Imported ${stats.jobs.success} jobs...`);
        }
      } catch (error: any) {
        stats.jobs.failed++;
        errors.push({
          type: 'job',
          id: job.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import job ${job.title}:`, error.message);
      }
    }
    console.log(
      `   ✅ Jobs import complete: ${stats.jobs.success} success, ${stats.jobs.failed} failed\n`
    );

    // Import applications
    console.log('📝 Importing applications...');
    for (const application of exportData.applications) {
      try {
        await firestore
          .collection('applications')
          .doc(application.id)
          .set({
            jobId: application.job_id,
            userId: application.user_id,
            resumeVersionId: application.resume_version_id,
            coverLetter: application.cover_letter || null,
            status: application.status,
            notes: application.notes || null,
            aiScore: application.ai_score ? parseFloat(application.ai_score) : null,
            aiRationale: application.ai_rationale || null,
            createdAt: Timestamp.fromDate(new Date(application.created_at)),
            updatedAt: Timestamp.fromDate(new Date(application.updated_at)),
          });

        stats.applications.success++;
        if (stats.applications.success % 10 === 0) {
          console.log(`   ✓ Imported ${stats.applications.success} applications...`);
        }
      } catch (error: any) {
        stats.applications.failed++;
        errors.push({
          type: 'application',
          id: application.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import application ${application.id}:`, error.message);
      }
    }
    console.log(
      `   ✅ Applications import complete: ${stats.applications.success} success, ${stats.applications.failed} failed\n`
    );

    // Import resumes
    console.log('📄 Importing resumes...');
    for (const resume of exportData.resumes) {
      try {
        await firestore
          .collection('resumes')
          .doc(resume.id)
          .set({
            userId: resume.user_id,
            fileUrl: resume.file_url,
            fileName: resume.file_name,
            uploadedAt: Timestamp.fromDate(new Date(resume.uploaded_at)),
          });

        stats.resumes.success++;
      } catch (error: any) {
        stats.resumes.failed++;
        errors.push({
          type: 'resume',
          id: resume.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import resume ${resume.id}:`, error.message);
      }
    }
    console.log(
      `   ✅ Resumes import complete: ${stats.resumes.success} success, ${stats.resumes.failed} failed\n`
    );

    // Import resume versions
    console.log('📑 Importing resume versions...');
    for (const version of exportData.resumeVersions) {
      try {
        await firestore
          .collection('resumes')
          .doc(version.resume_id)
          .collection('versions')
          .doc(version.id)
          .set({
            versionNumber: version.version_number,
            fileUrl: version.file_url,
            fileName: version.file_name,
            parsedData: version.parsed_data || {},
            createdAt: Timestamp.fromDate(new Date(version.created_at)),
          });

        stats.resumeVersions.success++;
      } catch (error: any) {
        stats.resumeVersions.failed++;
        errors.push({
          type: 'resumeVersion',
          id: version.id,
          error: error.message,
        });
        console.error(`   ✗ Failed to import resume version ${version.id}:`, error.message);
      }
    }
    console.log(
      `   ✅ Resume versions import complete: ${stats.resumeVersions.success} success, ${stats.resumeVersions.failed} failed\n`
    );

    // Generate import report
    const reportDir = path.join(__dirname, '../../migration-data');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `import-report-${timestamp}.json`);

    const report = {
      importedAt: new Date().toISOString(),
      sourceFile: exportFilePath,
      stats,
      errors,
      summary: {
        totalSuccess: Object.values(stats).reduce((sum, s) => sum + s.success, 0),
        totalFailed: Object.values(stats).reduce((sum, s) => sum + s.failed, 0),
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('✅ Import completed!\n');
    console.log('📊 Summary:');
    console.log('   Users:', `${stats.users.success} success, ${stats.users.failed} failed`);
    console.log(
      '   Organizations:',
      `${stats.organizations.success} success, ${stats.organizations.failed} failed`
    );
    console.log(
      '   Candidate Profiles:',
      `${stats.candidateProfiles.success} success, ${stats.candidateProfiles.failed} failed`
    );
    console.log(
      '   Recruiter Profiles:',
      `${stats.recruiterProfiles.success} success, ${stats.recruiterProfiles.failed} failed`
    );
    console.log('   Jobs:', `${stats.jobs.success} success, ${stats.jobs.failed} failed`);
    console.log(
      '   Applications:',
      `${stats.applications.success} success, ${stats.applications.failed} failed`
    );
    console.log('   Resumes:', `${stats.resumes.success} success, ${stats.resumes.failed} failed`);
    console.log(
      '   Resume Versions:',
      `${stats.resumeVersions.success} success, ${stats.resumeVersions.failed} failed`
    );
    console.log(
      '\n📈 Total:',
      `${report.summary.totalSuccess} success, ${report.summary.totalFailed} failed`
    );
    console.log('\n📁 Import report saved to:', reportPath);

    if (errors.length > 0) {
      console.log('\n⚠️  Some records failed to import. Check the report for details.');
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run the import
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Please provide the path to the export file');
    console.log('\nUsage: npm run migrate:import <export-file-path>');
    console.log('Example: npm run migrate:import ./migration-data/postgres-export-2024-01-01.json');
    process.exit(1);
  }

  const exportFilePath = args[0];

  if (!fs.existsSync(exportFilePath)) {
    console.error(`❌ Error: Export file not found: ${exportFilePath}`);
    process.exit(1);
  }

  importToFirebase(exportFilePath)
    .then(() => {
      console.log('\n✨ Import process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import process failed:', error);
      process.exit(1);
    });
}

export default importToFirebase;
