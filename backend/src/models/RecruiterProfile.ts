import { getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

export interface RecruiterProfile {
  userId: string;
  orgId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecruiterProfileData {
  userId: string;
  orgId?: string;
  title?: string;
}

export interface UpdateRecruiterProfileData {
  orgId?: string | null;
  title?: string;
}

const RECRUITER_PROFILES_COLLECTION = 'recruiterProfiles';

export class RecruiterProfileModel {
  /**
   * Create a new recruiter profile in Firestore
   */
  static async create(profileData: CreateRecruiterProfileData): Promise<RecruiterProfile> {
    const firestore = getFirestore();

    try {
      const now = new Date();
      const profileDoc = {
        userId: profileData.userId,
        orgId: profileData.orgId || null,
        title: profileData.title || null,
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      // Use userId as document ID for easy lookup
      await firestore
        .collection(RECRUITER_PROFILES_COLLECTION)
        .doc(profileData.userId)
        .set(profileDoc);

      return {
        userId: profileData.userId,
        orgId: profileDoc.orgId || undefined,
        title: profileDoc.title || undefined,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(
        `Failed to create recruiter profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find a recruiter profile by user ID from Firestore
   */
  static async findByUserId(userId: string): Promise<RecruiterProfile | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(RECRUITER_PROFILES_COLLECTION).doc(userId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data) {
        return null;
      }

      return {
        userId: data.userId,
        orgId: data.orgId || undefined,
        title: data.title || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find recruiter profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find all recruiters for an organization from Firestore
   */
  static async findByOrgId(orgId: string): Promise<RecruiterProfile[]> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(RECRUITER_PROFILES_COLLECTION)
        .where('orgId', '==', orgId)
        .get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: data.userId,
          orgId: data.orgId || undefined,
          title: data.title || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find recruiters by organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a recruiter profile in Firestore
   */
  static async update(
    userId: string,
    profileData: UpdateRecruiterProfileData
  ): Promise<RecruiterProfile | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(RECRUITER_PROFILES_COLLECTION).doc(userId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (profileData.orgId !== undefined) {
        updateData.orgId = profileData.orgId;
      }

      if (profileData.title !== undefined) {
        updateData.title = profileData.title;
      }

      // Update Firestore document
      await docRef.update(updateData);

      // Fetch and return updated profile
      return this.findByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to update recruiter profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a recruiter profile from Firestore
   */
  static async delete(userId: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      await firestore.collection(RECRUITER_PROFILES_COLLECTION).doc(userId).delete();
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete recruiter profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if profile exists for user in Firestore
   */
  static async exists(userId: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(RECRUITER_PROFILES_COLLECTION).doc(userId);
      const doc = await docRef.get();
      return doc.exists;
    } catch (error) {
      throw new Error(
        `Failed to check profile existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Associate recruiter with organization
   */
  static async setOrganization(userId: string, orgId: string): Promise<RecruiterProfile | null> {
    return this.update(userId, { orgId });
  }

  /**
   * Remove recruiter from organization
   */
  static async removeFromOrganization(userId: string): Promise<RecruiterProfile | null> {
    return this.update(userId, { orgId: null });
  }
}
