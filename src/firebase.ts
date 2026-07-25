import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { Property, User } from './types';
import { INITIAL_PROPERTIES, REGISTERED_USERS } from './data/initialProperties';

const firebaseConfig = {
  apiKey: "AIzaSyDb_M1SsUqhPsU1tYLtDXYyu01W4vpYUU8",
  authDomain: "bookmyhomez-72feb.firebaseapp.com",
  projectId: "bookmyhomez-72feb",
  storageBucket: "bookmyhomez-72feb.firebasestorage.app",
  messagingSenderId: "85958849713",
  appId: "1:85958849713:web:fce1f2114f11ae19219e90",
  measurementId: "G-BPLNWQKLNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Operations
export async function seedInitialPropertiesIfEmpty() {
  try {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    if (querySnapshot.empty) {
      for (const prop of INITIAL_PROPERTIES) {
        await setDoc(doc(db, 'properties', String(prop.id)), prop);
      }
    }
  } catch (error) {
    console.error("Error seeding properties: ", error);
  }
}

export async function seedInitialUsersIfEmpty() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    if (querySnapshot.empty) {
      for (const user of REGISTERED_USERS) {
        if (user.id) {
          await setDoc(doc(db, 'users', String(user.id)), user);
        }
      }
    }
  } catch (error) {
    console.error("Error seeding users: ", error);
  }
}

export function subscribeToProperties(callback: (properties: Property[]) => void) {
  const q = query(collection(db, 'properties'));
  return onSnapshot(q, (querySnapshot) => {
    const properties: Property[] = [];
    querySnapshot.forEach((doc) => {
      properties.push(doc.data() as Property);
    });
    callback(properties);
  }, (error) => {
    console.error("Error subscribing to properties: ", error);
  });
}

export async function savePropertyToFirestore(property: Property) {
  try {
    await setDoc(doc(db, 'properties', String(property.id)), property);
  } catch (error) {
    console.error("Error saving property: ", error);
    throw error;
  }
}

export async function updatePropertyInFirestore(id: number, updatedData: Partial<Property>) {
  try {
    const docRef = doc(db, 'properties', String(id));
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating property: ", error);
    throw error;
  }
}

export async function deletePropertyFromFirestore(id: number) {
  try {
    await deleteDoc(doc(db, 'properties', String(id)));
  } catch (error) {
    console.error("Error deleting property: ", error);
    throw error;
  }
}

export async function saveUserToFirestore(user: User & { password?: string }) {
  try {
    if (user.id) {
      await setDoc(doc(db, 'users', String(user.id)), user);
    }
  } catch (error) {
    console.error("Error saving user: ", error);
  }
}
