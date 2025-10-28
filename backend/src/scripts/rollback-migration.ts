import { auth, firestore, storage, realtimeDb } from '../config/firebase';
import fs from 'fs';
import path from 'path';

interface RollbackStats {
  users: { deleted: number; failed: number };
  organizations: { deleted: number; failed: number };
  candidateProfiles: { deleted: number; failed: number };
  recruiterProfiles: { deleted: number; failed: number };
  jobs: { deleted: number; failed: number };
  applications: { deleted: number; failed: number };
  resumes: { deleted: number; failed: number };
  storageFiles: { deleted: number; failed: number };
  realtimeData: { deleted: number; failed: number };
}

async function deleteCollection(
  collectionPath: string,
  batchSize: number = 100
): Promise<{ deleted: number; failed: number }> {
  const collectionRef = firestore.collection(collectionPath);
  let deleted = 0;
  let failed = 0;

  try {
    let snapshot = await collectionRef.limit(batchSize).get();

    while (!snapshot.empty) {
      const batch = firestore.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      try {
        await batch.commit();
        deleted += snapshot.docs.length;
        console.log(`   ✓ Deleted ${deleted} documents from ${collectionPath}...`);
      } catch (error) {
        failed += snapshot.docs.length;
        console.error(`   ✗ Failed to delete batch from ${collectionPath}:`, error);
      }

      // Get next batch
      snapshot = await collectionRef.limit(batchSize).get();
    }
  } catch (error) {
    console.error(`   ✗ Error deleting collection ${collectionPath}:`, error);
  }

  return { deleted, failed };
}

async function deleteSubcollections(
  parentCollection: string,
  subcollectionName: string
): Promise<{ deleted: number; failed: number }> {
  let totalDeleted = 0;
  let totalFailed = 0;

  try {
    const parentDocs = await firestore.collection(parentCollection).get();

    for (const parentDoc of parentDocs.docs) {
      const subcollectionRef = parentDoc.ref.collection(subcollectionName);
      const snapshot = await subcollectionRef.get();

      if (!snapshot.empty) {
        const batch = firestore.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        try {
          await batch.commit();
          totalDeleted += snapshot.docs.length;
        } catch (error) {
          totalFailed += snapshot.docs.length;
          console.error(`   ✗ Failed to delete subcollection for ${parentDoc.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`   ✗ Error deleting subcollections ${subcollectionName}:`, error);
  }

  return { deleted: totalDeleted, failed: totalFailed };
}

async function deleteAllFirebaseAuth(): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  try {
    let pageToken: string | undefined;

    do {
      const listUsersResult = await auth.listUsers(1000, pageToken);

      for (const userRecord of listUsersResult.users) {
        try {
          await auth.deleteUser(userRecord.uid);
          deleted++;

          if (deleted % 100 === 0) {
            console.log(`   ✓ Deleted ${deleted} Firebase Auth users...`);
          }
        } catch (error) {
          failed++;
          console.error(`   ✗ Failed to delete user ${userRecord.uid}:`, error);
        }
      }

      pageToken = listUsersResult.pageToken;
    } while (pageToken);
  } catch (error) {
    console.error('   ✗ Error listing Firebase Auth users:', error);
  }

  return { deleted, failed };
}

async function deleteStorageBucket(
  bucketPath: string
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: bucketPath });

    for (const file of files) {
      try {
        await file.delete();
        deleted++;

        if (deleted % 50 === 0) {
          console.log(`   ✓ Deleted ${deleted} files from storage...`);
        }
      } catch (error) {
        failed++;
        console.error(`   ✗ Failed to delete file ${file.name}:`, error);
      }
    }
  } catch (error) {
    console.error(`   ✗ Error deleting storage files from ${bucketPath}:`, error);
  }

  return { deleted, failed };
}

async function deleteRealtimeDatabase(): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  try {
    const paths = ['presence', 'notifications', 'applicationUpdates'];

    for (const path of paths) {
      try {
        await realtimeDb.ref(path).remove();
        deleted++;
        console.log(`   ✓ Deleted Realtime Database path: ${path}`);
      } catch (error) {
        failed++;
        console.error(`   ✗ Failed to delete Realtime Database path ${path}:`, error);
      }
    }
  } catch (error) {
    console.error('   ✗ Error deleting Realtime Database:', error);
  }

  return { deleted, failed };
}

async function createBackup(): Promise<string> {
  console.log('💾 Creating backup before rollback...\n');

  const backupData: any = {
    backedUpAt: new Date().toISOString(),
    collections: {},
  };

  const collections = [
    'users',
    'organizations',
    'candidateProfiles',
    'recruiterProfiles',
    'jobs',
    'applications',
    'resumes',
  ];

  for (const collectionName of collections) {
    console.log(`   Backing up ${collectionName}...`);
    const snapshot = await firestore.collection(collectionName).get();
    backupData.collections[collectionName] = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    console.log(`   ✓ Backed up ${snapshot.docs.length} documents from ${collectionName}`);
  }

  // Backup resume versions (subcollection)
  console.log('   Backing up resume versions...');
  const resumeDocs = await firestore.collection('resumes').get();
  backupData.collections.resumeVersions = [];

  for (const resumeDoc of resumeDocs.docs) {
    const versionsSnapshot = await resumeDoc.ref.collection('versions').get();
    versionsSnapshot.docs.forEach((versionDoc) => {
      backupData.collections.resumeVersions.push({
        resumeId: resumeDoc.id,
        versionId: versionDoc.id,
        data: versionDoc.data(),
      });
    });
  }
  console.log(`   ✓ Backed up ${backupData.collections.resumeVersions.length} resume versions`);

  const backupDir = path.join(__dirname, '../../migration-data/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `firebase-backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

  console.log(`\n✅ Backup created: ${backupPath}\n`);
  return backupPath;
}

async function restoreFromBackup(backupFilePath: string): Promise<void> {
  console.log('🔄 Restoring from backup...\n');
  console.log('📁 Reading backup file:', backupFilePath);

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found: ${backupFilePath}`);
  }

  const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
  console.log('✅ Backup file loaded successfully\n');

  // Restore collections
  for (const [collectionName, documents] of Object.entries(backupData.collections)) {
    if (collectionName === 'resumeVersions') continue; // Handle separately

    console.log(`📥 Restoring ${collectionName}...`);
    const docs = documents as Array<{ id: string; data: any }>;

    for (const doc of docs) {
      try {
        await firestore.collection(collectionName).doc(doc.id).set(doc.data);
      } catch (error) {
        console.error(`   ✗ Failed to restore document ${doc.id}:`, error);
      }
    }
    console.log(`   ✅ Restored ${docs.length} documents to ${collectionName}`);
  }

  // Restore resume versions (subcollection)
  if (backupData.collections.resumeVersions) {
    console.log('📥 Restoring resume versions...');
    const versions = backupData.collections.resumeVersions as Array<{
      resumeId: string;
      versionId: string;
      data: any;
    }>;

    for (const version of versions) {
      try {
        await firestore
          .collection('resumes')
          .doc(version.resumeId)
          .collection('versions')
          .doc(version.versionId)
          .set(version.data);
      } catch (error) {
        console.error(`   ✗ Failed to restore version ${version.versionId}:`, error);
      }
    }
    console.log(`   ✅ Restored ${versions.length} resume versions`);
  }

  console.log('\n✅ Restore completed!');
}

async function rollbackMigration(options: {
  createBackup?: boolean;
  deleteAuth?: boolean;
  deleteFirestore?: boolean;
  deleteStorage?: boolean;
  deleteRealtime?: boolean;
}): Promise<void> {
  console.log('🔄 Starting migration rollback...\n');

  const {
    createBackup: shouldBackup = true,
    deleteAuth = true,
    deleteFirestore = true,
    deleteStorage = true,
    deleteRealtime = true,
  } = options;

  const stats: RollbackStats = {
    users: { deleted: 0, failed: 0 },
    organizations: { deleted: 0, failed: 0 },
    candidateProfiles: { deleted: 0, failed: 0 },
    recruiterProfiles: { deleted: 0, failed: 0 },
    jobs: { deleted: 0, failed: 0 },
    applications: { deleted: 0, failed: 0 },
    resumes: { deleted: 0, failed: 0 },
    storageFiles: { deleted: 0, failed: 0 },
    realtimeData: { deleted: 0, failed: 0 },
  };

  let backupPath: string | null = null;

  try {
    // Create backup if requested
    if (shouldBackup) {
      backupPath = await createBackup();
    }

    // Delete Firestore collections
    if (deleteFirestore) {
      console.log('🗑️  Deleting Firestore collections...\n');

      console.log('   Deleting resume versions (subcollection)...');
      const resumeVersionsResult = await deleteSubcollections('resumes', 'versions');
      console.log(`   ✅ Deleted ${resumeVersionsResult.deleted} resume versions\n`);

      console.log('   Deleting applications...');
      stats.applications = await deleteCollection('applications');
      console.log(`   ✅ Deleted ${stats.applications.deleted} applications\n`);

      console.log('   Deleting resumes...');
      stats.resumes = await deleteCollection('resumes');
      console.log(`   ✅ Deleted ${stats.resumes.deleted} resumes\n`);

      console.log('   Deleting jobs...');
      stats.jobs = await deleteCollection('jobs');
      console.log(`   ✅ Deleted ${stats.jobs.deleted} jobs\n`);

      console.log('   Deleting recruiter profiles...');
      stats.recruiterProfiles = await deleteCollection('recruiterProfiles');
      console.log(`   ✅ Deleted ${stats.recruiterProfiles.deleted} recruiter profiles\n`);

      console.log('   Deleting candidate profiles...');
      stats.candidateProfiles = await deleteCollection('candidateProfiles');
      console.log(`   ✅ Deleted ${stats.candidateProfiles.deleted} candidate profiles\n`);

      console.log('   Deleting organizations...');
      stats.organizations = await deleteCollection('organizations');
      console.log(`   ✅ Deleted ${stats.organizations.deleted} organizations\n`);

      console.log('   Deleting users...');
      stats.users = await deleteCollection('users');
      console.log(`   ✅ Deleted ${stats.users.deleted} users\n`);
    }

    // Delete Firebase Auth users
    if (deleteAuth) {
      console.log('🗑️  Deleting Firebase Auth users...\n');
      const authResult = await deleteAllFirebaseAuth();
      console.log(`   ✅ Deleted ${authResult.deleted} Firebase Auth users\n`);
    }

    // Delete Storage files
    if (deleteStorage) {
      console.log('🗑️  Deleting Storage files...\n');

      console.log('   Deleting resumes...');
      const resumesResult = await deleteStorageBucket('resumes/');
      stats.storageFiles.deleted += resumesResult.deleted;
      stats.storageFiles.failed += resumesResult.failed;

      console.log('   Deleting avatars...');
      const avatarsResult = await deleteStorageBucket('avatars/');
      stats.storageFiles.deleted += avatarsResult.deleted;
      stats.storageFiles.failed += avatarsResult.failed;

      console.log(`   ✅ Deleted ${stats.storageFiles.deleted} storage files\n`);
    }

    // Delete Realtime Database
    if (deleteRealtime) {
      console.log('🗑️  Deleting Realtime Database...\n');
      stats.realtimeData = await deleteRealtimeDatabase();
      console.log(`   ✅ Deleted ${stats.realtimeData.deleted} Realtime Database paths\n`);
    }

    // Generate rollback report
    const reportDir = path.join(__dirname, '../../migration-data');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `rollback-report-${timestamp}.json`);

    const report = {
      rolledBackAt: new Date().toISOString(),
      backupPath,
      stats,
      summary: {
        totalDeleted:
          stats.users.deleted +
          stats.organizations.deleted +
          stats.candidateProfiles.deleted +
          stats.recruiterProfiles.deleted +
          stats.jobs.deleted +
          stats.applications.deleted +
          stats.resumes.deleted +
          stats.storageFiles.deleted +
          stats.realtimeData.deleted,
        totalFailed:
          stats.users.failed +
          stats.organizations.failed +
          stats.candidateProfiles.failed +
          stats.recruiterProfiles.failed +
          stats.jobs.failed +
          stats.applications.failed +
          stats.resumes.failed +
          stats.storageFiles.failed +
          stats.realtimeData.failed,
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('✅ Rollback completed!\n');
    console.log('📊 Summary:');
    console.log('   Users:', `${stats.users.deleted} deleted, ${stats.users.failed} failed`);
    console.log(
      '   Organizations:',
      `${stats.organizations.deleted} deleted, ${stats.organizations.failed} failed`
    );
    console.log(
      '   Candidate Profiles:',
      `${stats.candidateProfiles.deleted} deleted, ${stats.candidateProfiles.failed} failed`
    );
    console.log(
      '   Recruiter Profiles:',
      `${stats.recruiterProfiles.deleted} deleted, ${stats.recruiterProfiles.failed} failed`
    );
    console.log('   Jobs:', `${stats.jobs.deleted} deleted, ${stats.jobs.failed} failed`);
    console.log(
      '   Applications:',
      `${stats.applications.deleted} deleted, ${stats.applications.failed} failed`
    );
    console.log('   Resumes:', `${stats.resumes.deleted} deleted, ${stats.resumes.failed} failed`);
    console.log(
      '   Storage Files:',
      `${stats.storageFiles.deleted} deleted, ${stats.storageFiles.failed} failed`
    );
    console.log(
      '   Realtime Data:',
      `${stats.realtimeData.deleted} deleted, ${stats.realtimeData.failed} failed`
    );
    console.log(
      '\n📈 Total:',
      `${report.summary.totalDeleted} deleted, ${report.summary.totalFailed} failed`
    );
    console.log('\n📁 Rollback report saved to:', reportPath);

    if (backupPath) {
      console.log('💾 Backup saved to:', backupPath);
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Run the rollback
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'restore' && args[1]) {
    // Restore from backup
    const backupFilePath = args[1];
    restoreFromBackup(backupFilePath)
      .then(() => {
        console.log('\n✨ Restore process completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Restore process failed:', error);
        process.exit(1);
      });
  } else if (command === 'delete') {
    // Delete all Firebase data
    console.log('⚠️  WARNING: This will delete ALL Firebase data!');
    console.log('⚠️  A backup will be created automatically.\n');

    const options = {
      createBackup: !args.includes('--no-backup'),
      deleteAuth: !args.includes('--skip-auth'),
      deleteFirestore: !args.includes('--skip-firestore'),
      deleteStorage: !args.includes('--skip-storage'),
      deleteRealtime: !args.includes('--skip-realtime'),
    };

    rollbackMigration(options)
      .then(() => {
        console.log('\n✨ Rollback process completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Rollback process failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  Delete all Firebase data:');
    console.log('    npm run migrate:rollback delete [options]');
    console.log('');
    console.log('  Options:');
    console.log('    --no-backup        Skip creating backup');
    console.log('    --skip-auth        Skip deleting Firebase Auth users');
    console.log('    --skip-firestore   Skip deleting Firestore collections');
    console.log('    --skip-storage     Skip deleting Storage files');
    console.log('    --skip-realtime    Skip deleting Realtime Database');
    console.log('');
    console.log('  Restore from backup:');
    console.log('    npm run migrate:rollback restore <backup-file-path>');
    console.log('');
    console.log('Examples:');
    console.log('  npm run migrate:rollback delete');
    console.log('  npm run migrate:rollback delete --no-backup');
    console.log(
      '  npm run migrate:rollback restore ./migration-data/backups/firebase-backup-2024-01-01.json'
    );
    process.exit(1);
  }
}

export { rollbackMigration, restoreFromBackup, createBackup };
