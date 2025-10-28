import { getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface Preferences {
  roles?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  minCompensation?: number;
}

export interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: Preferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidateProfileData {
  userId: string;
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  preferences?: Preferences;
}

export interface UpdateCandidateProfileData {
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  preferences?: Preferences;
}

const CANDIDATE_PROFILES_COLLECTION = 'candidateProfiles';

export class CandidateProfileModel {
  /**
   * Create a new candidate profile in Firestore
   */
  static async create(profileData: CreateCandidateProfileData): Promise<CandidateProfile> {
    const firestore = getFirestore();

    try {
      const now = new Date();
      const profileDoc = {
        userId: profileData.userId,
        location: profileData.location || '',
        skills: profileData.skills || [],
        experience: profileData.experience || [],
        education: profileData.education || [],
        preferences: profileData.preferences || {},
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      // Use userId as document ID for easy lookup
      await firestore
        .collection(CANDIDATE_PROFILES_COLLECTION)
        .doc(profileData.userId)
        .set(profileDoc);

      return {
        userId: profileData.userId,
        location: profileDoc.location,
        skills: profileDoc.skills,
        experience: profileDoc.experience,
        education: profileDoc.education,
        preferences: profileDoc.preferences,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(
        `Failed to create candidate profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find a candidate profile by user ID from Firestore
   */
  static async findByUserId(userId: string): Promise<CandidateProfile | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(CANDIDATE_PROFILES_COLLECTION).doc(userId);
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
        location: data.location || '',
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        preferences: data.preferences || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to find candidate profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a candidate profile in Firestore
   */
  static async update(
    userId: string,
    profileData: UpdateCandidateProfileData
  ): Promise<CandidateProfile | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(CANDIDATE_PROFILES_COLLECTION).doc(userId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (profileData.location !== undefined) {
        updateData.location = profileData.location;
      }

      if (profileData.skills !== undefined) {
        updateData.skills = profileData.skills;
      }

      if (profileData.experience !== undefined) {
        updateData.experience = profileData.experience;
      }

      if (profileData.education !== undefined) {
        updateData.education = profileData.education;
      }

      if (profileData.preferences !== undefined) {
        updateData.preferences = profileData.preferences;
      }

      // Update Firestore document
      await docRef.update(updateData);

      // Fetch and return updated profile
      return this.findByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to update candidate profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a candidate profile from Firestore
   */
  static async delete(userId: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      await firestore.collection(CANDIDATE_PROFILES_COLLECTION).doc(userId).delete();
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete candidate profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if profile exists for user in Firestore
   */
  static async exists(userId: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(CANDIDATE_PROFILES_COLLECTION).doc(userId);
      const doc = await docRef.get();
      return doc.exists;
    } catch (error) {
      throw new Error(
        `Failed to check profile existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query candidate profiles by skills
   */
  static async findBySkills(skills: string[], limit: number = 10): Promise<CandidateProfile[]> {
    const firestore = getFirestore();

    try {
      // Firestore array-contains-any supports up to 10 values
      const skillsToQuery = skills.slice(0, 10);

      const querySnapshot = await firestore
        .collection(CANDIDATE_PROFILES_COLLECTION)
        .where('skills', 'array-contains-any', skillsToQuery)
        .limit(limit)
        .get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: data.userId,
          location: data.location || '',
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          preferences: data.preferences || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find profiles by skills: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query candidate profiles by location
   */
  static async findByLocation(location: string, limit: number = 10): Promise<CandidateProfile[]> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(CANDIDATE_PROFILES_COLLECTION)
        .where('location', '==', location)
        .limit(limit)
        .get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: data.userId,
          location: data.location || '',
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          preferences: data.preferences || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find profiles by location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query candidate profiles by skills and location
   */
  static async findBySkillsAndLocation(
    skills: string[],
    location: string,
    limit: number = 10
  ): Promise<CandidateProfile[]> {
    const firestore = getFirestore();

    try {
      // Firestore array-contains-any supports up to 10 values
      const skillsToQuery = skills.slice(0, 10);

      const querySnapshot = await firestore
        .collection(CANDIDATE_PROFILES_COLLECTION)
        .where('skills', 'array-contains-any', skillsToQuery)
        .where('location', '==', location)
        .limit(limit)
        .get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: data.userId,
          location: data.location || '',
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          preferences: data.preferences || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find profiles by skills and location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
