import { getAuth, getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
}

const USERS_COLLECTION = 'users';

export class UserModel {
  /**
   * Create a new user in Firebase Auth and Firestore
   */
  static async create(userData: CreateUserData): Promise<User> {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        photoURL: userData.avatarUrl,
      });

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
      });

      // Create user document in Firestore
      const now = new Date();
      const userDoc = {
        email: userData.email,
        role: userData.role,
        name: userData.name,
        avatarUrl: userData.avatarUrl || null,
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      await firestore.collection(USERS_COLLECTION).doc(userRecord.uid).set(userDoc);

      return {
        id: userRecord.uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      // If Firestore write fails, try to clean up Auth user
      if (error instanceof Error && error.message.includes('Firestore')) {
        try {
          const userRecord = await auth.getUserByEmail(userData.email);
          await auth.deleteUser(userRecord.uid);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Find a user by ID from Firestore
   */
  static async findById(id: string): Promise<User | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(USERS_COLLECTION).doc(id);
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
        email: data.email,
        role: data.role,
        name: data.name,
        avatarUrl: data.avatarUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find a user by email using Firestore where query
   */
  static async findByEmail(email: string): Promise<User | null> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(USERS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        email: data.email,
        role: data.role,
        name: data.name,
        avatarUrl: data.avatarUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a user in Firestore
   */
  static async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const firestore = getFirestore();
    const auth = getAuth();

    try {
      const docRef = firestore.collection(USERS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (userData.name !== undefined) {
        updateData.name = userData.name;
      }

      if (userData.avatarUrl !== undefined) {
        updateData.avatarUrl = userData.avatarUrl;
      }

      // Update Firestore document
      await docRef.update(updateData);

      // Update Firebase Auth profile if name or avatar changed
      const authUpdateData: any = {};
      if (userData.name !== undefined) {
        authUpdateData.displayName = userData.name;
      }
      if (userData.avatarUrl !== undefined) {
        authUpdateData.photoURL = userData.avatarUrl;
      }

      if (Object.keys(authUpdateData).length > 0) {
        try {
          await auth.updateUser(id, authUpdateData);
        } catch (authError) {
          // Log but don't fail if Auth update fails
          console.error('Failed to update Firebase Auth profile:', authError);
        }
      }

      // Fetch and return updated user
      return this.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a user from Firebase Auth and Firestore
   */
  static async delete(id: string): Promise<boolean> {
    const firestore = getFirestore();
    const auth = getAuth();

    try {
      // Delete from Firestore
      await firestore.collection(USERS_COLLECTION).doc(id).delete();

      // Delete from Firebase Auth
      try {
        await auth.deleteUser(id);
      } catch (authError) {
        // Log but don't fail if Auth deletion fails (user might not exist in Auth)
        console.error('Failed to delete user from Firebase Auth:', authError);
      }

      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if email exists in Firestore
   */
  static async emailExists(email: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(USERS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      throw new Error(
        `Failed to check email existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
