import { getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

export interface Org {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrgData {
  name: string;
  website?: string;
  logoUrl?: string;
}

export interface UpdateOrgData {
  name?: string;
  website?: string;
  logoUrl?: string;
}

const ORGANIZATIONS_COLLECTION = 'organizations';

export class OrgModel {
  /**
   * Create a new organization in Firestore
   */
  static async create(orgData: CreateOrgData): Promise<Org> {
    const firestore = getFirestore();

    try {
      const now = new Date();
      const orgDoc = {
        name: orgData.name,
        website: orgData.website || null,
        logoUrl: orgData.logoUrl || null,
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      // Create document with auto-generated ID
      const docRef = await firestore.collection(ORGANIZATIONS_COLLECTION).add(orgDoc);

      return {
        id: docRef.id,
        name: orgDoc.name,
        website: orgDoc.website || undefined,
        logoUrl: orgDoc.logoUrl || undefined,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(
        `Failed to create organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find an organization by ID from Firestore
   */
  static async findById(id: string): Promise<Org | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(ORGANIZATIONS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data) {
        return null;
      }

      return {
        id: doc.id,
        name: data.name,
        website: data.website || undefined,
        logoUrl: data.logoUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find organization by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find an organization by name from Firestore
   */
  static async findByName(name: string): Promise<Org | null> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(ORGANIZATIONS_COLLECTION)
        .where('name', '==', name)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        website: data.website || undefined,
        logoUrl: data.logoUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find organization by name: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an organization in Firestore
   */
  static async update(id: string, orgData: UpdateOrgData): Promise<Org | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(ORGANIZATIONS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (orgData.name !== undefined) {
        updateData.name = orgData.name;
      }

      if (orgData.website !== undefined) {
        updateData.website = orgData.website;
      }

      if (orgData.logoUrl !== undefined) {
        updateData.logoUrl = orgData.logoUrl;
      }

      // Update Firestore document
      await docRef.update(updateData);

      // Fetch and return updated organization
      return this.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to update organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an organization from Firestore
   */
  static async delete(id: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      await firestore.collection(ORGANIZATIONS_COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all recruiters for an organization from Firestore
   */
  static async getRecruiters(orgId: string): Promise<string[]> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection('recruiterProfiles')
        .where('orgId', '==', orgId)
        .get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => doc.data().userId);
    } catch (error) {
      throw new Error(
        `Failed to get recruiters for organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
