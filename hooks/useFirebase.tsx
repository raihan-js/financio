import React, { createContext, ReactNode, useContext } from 'react';

// Create mock Firebase services
const mockApp = {};
const mockAuth = {};
const mockFirestore = {};
const mockStorage = {};

// Create a context for Firebase services
interface FirebaseContextType {
  app: typeof mockApp;
  auth: typeof mockAuth;
  firestore: typeof mockFirestore;
  storage: typeof mockStorage;
  initialized: boolean;
}

// Create a mock implementation
const mockFirebaseContext: FirebaseContextType = {
  app: mockApp,
  auth: mockAuth,
  firestore: mockFirestore,
  storage: mockStorage,
  initialized: true
};

const FirebaseContext = createContext<FirebaseContextType>(mockFirebaseContext);

// Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={mockFirebaseContext}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Hook to use Firebase
export function useFirebase() {
  return useContext(FirebaseContext);
}