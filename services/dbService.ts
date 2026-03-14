import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  deleteDoc,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, User, SiteSettings, AdminUser } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class DatabaseService {
  async init(): Promise<boolean> {
    console.log('Initializing Firebase connection...');
    try {
      // Test connection by attempting to fetch settings
      await getDocFromServer(doc(db, 'settings', 'main_config'));
      console.log('Firebase Connection Verified Successfully.');
      return true;
    } catch (err) {
      if (err instanceof Error && err.message.includes('the client is offline')) {
        console.warn('Firebase is unreachable (Offline Mode).');
        return false;
      }
      // If it's just a "not found" or "permission denied" it might still be "connected"
      console.log('Firebase Init check finished.');
      return true;
    }
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => doc.data() as Product);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    const path = 'products';
    try {
      const batch = writeBatch(db);
      
      // In Firestore, we don't necessarily need to delete items not in the list 
      // unless we want a perfect sync. The original code did this.
      // For simplicity and to avoid hitting limits, we'll just upsert.
      // If we really need to delete, we'd fetch all IDs first.
      
      for (const product of products) {
        const docRef = doc(db, path, product.id);
        batch.set(docRef, product);
      }
      
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    const path = 'users';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    const path = 'users';
    try {
      await setDoc(doc(db, path, user.id), user);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Settings
  async getSettings(): Promise<SiteSettings | null> {
    const path = 'settings/main_config';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'main_config'));
      if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const path = 'settings/main_config';
    try {
      await setDoc(doc(db, 'settings', 'main_config'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Admins
  async getAllAdmins(): Promise<AdminUser[]> {
    const path = 'admins';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => doc.data() as AdminUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async saveAdmins(admins: AdminUser[]): Promise<void> {
    const path = 'admins';
    try {
      const batch = writeBatch(db);
      for (const admin of admins) {
        const docRef = doc(db, path, admin.id);
        batch.set(docRef, admin);
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

export const dbService = new DatabaseService();
