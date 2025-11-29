
// Mocking Firebase Firestore with LocalStorage to resolve module errors
// and allow the application to function without a backend configuration.

// Maps collection names to localStorage keys. 
// 'applications' maps to 'loanApplications' to maintain compatibility with PaymentForm.tsx
const getCollectionKey = (colName: string) => {
  if (colName === 'applications') return 'loanApplications';
  return `firebase_mock_${colName}`;
};

// Helper to get data from localStorage
const getData = (key: string): any[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// Helper to set data to localStorage
const setData = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch a custom event so onSnapshot can pick it up in the same window
  window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }));
};

export const db = {}; // Mock DB object

export const initializeApp = (config: any) => {}; // Mock initialization

export const getFirestore = (app?: any) => db;

export const collection = (db: any, name: string) => {
  return { type: 'collection', name };
};

export const addDoc = async (colRef: any, data: any) => {
  const key = getCollectionKey(colRef.name);
  const currentData = getData(key);
  // Generate a simple ID
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const newDoc = { id, ...data };
  
  // Ensure date field exists for sorting if not provided
  if (!newDoc.date) {
      newDoc.date = new Date().toISOString();
  }

  currentData.push(newDoc);
  setData(key, currentData);
  return { id };
};

export const doc = (db: any, colName: string, id: string) => {
  return { type: 'doc', colName, id };
};

export const updateDoc = async (docRef: any, data: any) => {
  const key = getCollectionKey(docRef.colName);
  const currentData = getData(key);
  const index = currentData.findIndex((d: any) => d.id === docRef.id);
  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...data };
    setData(key, currentData);
  }
};

export const deleteDoc = async (docRef: any) => {
  const key = getCollectionKey(docRef.colName);
  const currentData = getData(key);
  const newData = currentData.filter((d: any) => d.id !== docRef.id);
  setData(key, newData);
};

export const query = (colRef: any, ...constraints: any[]) => {
  return { ...colRef, constraints };
};

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const onSnapshot = (queryRef: any, callback: (snapshot: any) => void, onError?: (error: any) => void) => {
  const key = getCollectionKey(queryRef.name);
  
  const listener = () => {
    let data = getData(key);
    
    // Handle sorting if orderBy constraint is present
    if (queryRef.constraints) {
        const sortConstraint = queryRef.constraints.find((c: any) => c.type === 'orderBy');
        if (sortConstraint) {
            const { field, direction } = sortConstraint;
            data.sort((a: any, b: any) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
    }

    // Mock Firestore snapshot structure
    const snapshot = {
      docs: data.map((d: any) => ({
        id: d.id,
        data: () => d
      }))
    };
    callback(snapshot);
  };

  // Initial call
  listener();

  // Listen for 'storage' (cross-tab)
  const handleStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
  };

  // Listen for local updates
  const handleLocalUpdate = (e: any) => {
      if (e.detail?.key === key) listener();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('local-storage-update', handleLocalUpdate as EventListener);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('local-storage-update', handleLocalUpdate as EventListener);
  };
};
