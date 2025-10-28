import { firestore } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Event {
  id: string;
  userId?: string;
  eventType: string;
  properties: Record<string, any>;
  createdAt: Date;
}

export interface EventInput {
  userId?: string;
  eventType: string;
  properties?: Record<string, any>;
}

export class EventModel {
  private static collection = firestore.collection('events');

  static async create(eventData: EventInput): Promise<Event> {
    const { userId, eventType, properties = {} } = eventData;

    const docRef = await this.collection.add({
      userId: userId || null,
      eventType,
      properties,
      createdAt: Timestamp.now(),
    });

    const doc = await docRef.get();
    const data = doc.data()!;

    return {
      id: doc.id,
      userId: data.userId,
      eventType: data.eventType,
      properties: data.properties,
      createdAt: data.createdAt.toDate(),
    };
  }

  static async findByType(eventType: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = this.collection.where('eventType', '==', eventType);

    if (startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(endDate));
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        eventType: data.eventType,
        properties: data.properties,
        createdAt: data.createdAt.toDate(),
      };
    });
  }

  static async findByUserId(userId: string, limit: number = 100): Promise<Event[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        eventType: data.eventType,
        properties: data.properties,
        createdAt: data.createdAt.toDate(),
      };
    });
  }

  static async countByType(eventType: string, startDate?: Date, endDate?: Date): Promise<number> {
    let query = this.collection.where('eventType', '==', eventType);

    if (startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(endDate));
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  static async countUniqueUsers(
    eventType: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let query = this.collection.where('eventType', '==', eventType).where('userId', '!=', null);

    if (startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(endDate));
    }

    const snapshot = await query.get();
    const uniqueUsers = new Set(snapshot.docs.map((doc) => doc.data().userId));
    return uniqueUsers.size;
  }
}
