import { firestore } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface MetricsCache {
  id: string;
  metricName: string;
  metricValue: Record<string, any>;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
}

export interface MetricsCacheInput {
  metricName: string;
  metricValue: Record<string, any>;
  periodStart: Date;
  periodEnd: Date;
}

export class MetricsCacheModel {
  private static collection = firestore.collection('metricsCache');

  static async upsert(data: MetricsCacheInput): Promise<MetricsCache> {
    const { metricName, metricValue, periodStart, periodEnd } = data;

    // Create a unique ID based on metric name and period
    const docId = `${metricName}_${periodStart.getTime()}_${periodEnd.getTime()}`;

    const docData = {
      metricName,
      metricValue,
      periodStart: Timestamp.fromDate(periodStart),
      periodEnd: Timestamp.fromDate(periodEnd),
      calculatedAt: Timestamp.now(),
    };

    await this.collection.doc(docId).set(docData, { merge: true });

    return {
      id: docId,
      metricName,
      metricValue,
      periodStart,
      periodEnd,
      calculatedAt: new Date(),
    };
  }

  static async findByName(
    metricName: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<MetricsCache | null> {
    let query = this.collection.where('metricName', '==', metricName);

    if (periodStart) {
      query = query.where('periodStart', '==', Timestamp.fromDate(periodStart));
    }

    if (periodEnd) {
      query = query.where('periodEnd', '==', Timestamp.fromDate(periodEnd));
    }

    const snapshot = await query.orderBy('calculatedAt', 'desc').limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      metricName: data.metricName,
      metricValue: data.metricValue,
      periodStart: data.periodStart.toDate(),
      periodEnd: data.periodEnd.toDate(),
      calculatedAt: data.calculatedAt.toDate(),
    };
  }

  static async findAll(): Promise<MetricsCache[]> {
    const snapshot = await this.collection.orderBy('calculatedAt', 'desc').get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        metricName: data.metricName,
        metricValue: data.metricValue,
        periodStart: data.periodStart.toDate(),
        periodEnd: data.periodEnd.toDate(),
        calculatedAt: data.calculatedAt.toDate(),
      };
    });
  }

  static async deleteOlderThan(date: Date): Promise<number> {
    const snapshot = await this.collection
      .where('calculatedAt', '<', Timestamp.fromDate(date))
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }
}
