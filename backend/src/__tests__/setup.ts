import redisClient from '../config/redis';

// Mock firebase-admin before importing any modules that use it
const mockTimestamp = {
  now: jest.fn(() => ({
    toDate: () => new Date('2024-01-01T00:00:00.000Z'),
    seconds: 1704067200,
    nanoseconds: 0,
  })),
  fromDate: jest.fn((date: Date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  })),
};

const mockFieldValue = {
  serverTimestamp: jest.fn(() => ({ _methodName: 'FieldValue.serverTimestamp' })),
  delete: jest.fn(() => ({ _methodName: 'FieldValue.delete' })),
  increment: jest.fn((n: number) => ({ _methodName: 'FieldValue.increment', _value: n })),
  arrayUnion: jest.fn((...elements: any[]) => ({
    _methodName: 'FieldValue.arrayUnion',
    _elements: elements,
  })),
  arrayRemove: jest.fn((...elements: any[]) => ({
    _methodName: 'FieldValue.arrayRemove',
    _elements: elements,
  })),
};

const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'mock-id',
        data: jest.fn().mockReturnValue({}),
      }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: 'mock-version-id',
            data: jest.fn().mockReturnValue({}),
          }),
          delete: jest.fn().mockResolvedValue(undefined),
        })),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      })),
    })),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: true,
      docs: [],
    }),
  })),
  Timestamp: mockTimestamp,
  FieldValue: mockFieldValue,
};

const mockAuth = {
  createUser: jest.fn().mockResolvedValue({ uid: 'mock-user-id' }),
  getUserByEmail: jest.fn().mockResolvedValue({ uid: 'mock-user-id' }),
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'mock-user-id',
    email: 'test@example.com',
    role: 'candidate',
  }),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  getUser: jest.fn().mockResolvedValue({ uid: 'mock-user-id' }),
  updateUser: jest.fn().mockResolvedValue({ uid: 'mock-user-id' }),
};

const mockStorage = {
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      save: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://mock-url.com/file.pdf']),
      exists: jest.fn().mockResolvedValue([true]),
      delete: jest.fn().mockResolvedValue(undefined),
      getMetadata: jest.fn().mockResolvedValue([{}]),
    })),
    exists: jest.fn().mockResolvedValue([true]),
  })),
};

const mockDatabase = {
  ref: jest.fn(() => ({
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    once: jest.fn().mockResolvedValue({
      val: jest.fn().mockReturnValue(null),
    }),
    push: jest.fn(() => ({
      key: 'mock-push-id',
      set: jest.fn().mockResolvedValue(undefined),
    })),
    onDisconnect: jest.fn(() => ({
      update: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    })),
  })),
  ServerValue: {
    TIMESTAMP: { '.sv': 'timestamp' },
  },
};

// Create a mock app
const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(() => mockApp),
    credential: {
      cert: jest.fn(() => ({})),
      applicationDefault: jest.fn(() => ({})),
    },
    auth: jest.fn(() => mockAuth),
    firestore: jest.fn(() => mockFirestore),
    storage: jest.fn(() => mockStorage),
    database: jest.fn(() => mockDatabase),
    apps: [mockApp],
  };
});

// Mock Firebase config module
jest.mock('../config/firebase', () => {
  return {
    initializeFirebase: jest.fn(),
    validateFirebaseConnection: jest.fn().mockResolvedValue(undefined),
    getAuth: jest.fn(() => mockAuth),
    getFirestore: jest.fn(() => mockFirestore),
    getStorage: jest.fn(() => mockStorage),
    getRealtimeDb: jest.fn(() => mockDatabase),
    isFirebaseInitialized: jest.fn(() => true),
    auth: mockAuth,
    firestore: mockFirestore,
    storage: mockStorage,
    realtimeDb: mockDatabase,
  };
});

// Test setup and teardown
export async function setupTestDatabase() {
  // Firebase is mocked, no setup needed
}

export async function cleanDatabase() {
  // Firebase is mocked, no cleanup needed
}

export async function teardownTestDatabase() {
  // Close Redis connection
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}

// Global setup and teardown
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

afterEach(async () => {
  await cleanDatabase();
});
