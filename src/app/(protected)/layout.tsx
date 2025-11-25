'use client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import AppShell from '@/components/app-shell';
import {
  useUser,
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import type {
  Product,
  PriceList,
  LaborSettings,
  OverheadItem,
  TransportItem,
  CapitalItem,
  FinishedProduct,
} from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AppDataContextType {
  products: Product[];
  inventory: PriceList[];
  packaging: PriceList[];
  laborSettings: LaborSettings | null;
  overhead: OverheadItem[];
  transport: TransportItem[];
  capital: CapitalItem[];
  finishedProducts: FinishedProduct[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  addIngredient: (item: Omit<PriceList, 'id'>) => void;
  updateIngredient: (updatedItem: PriceList) => void;
  deleteIngredient: (itemId: string) => void;
  addPackagingItem: (item: Omit<PriceList, 'id'>) => void;
  updatePackagingItem: (updatedItem: PriceList) => void;
  deletePackagingItem: (itemId: string) => void;
  addOverheadItem: (item: Omit<OverheadItem, 'id'>) => void;
  updateOverheadItem: (updatedItem: OverheadItem) => void;
  deleteOverheadItem: (itemId: string) => void;
  addTransportItem: (item: Omit<TransportItem, 'id'>) => void;
  updateTransportItem: (updatedItem: TransportItem) => void;
  deleteTransportItem: (itemId: string) => void;
  addCapitalItem: (item: Omit<CapitalItem, 'id'>) => void;
  updateCapitalItem: (updatedItem: CapitalItem) => void;
  deleteCapitalItem: (itemId: string) => void;
  setLaborSettings: (settings: LaborSettings) => void;
  addFinishedProduct: (item: Omit<FinishedProduct, 'id'>) => void;
  updateFinishedProduct: (updatedItem: FinishedProduct) => void;
  deleteFinishedProduct: (itemId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading: userIsLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!userIsLoading && !user) {
      router.push('/');
    }
  }, [user, userIsLoading, router]);

  const userId = user?.uid;

  const productsRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'products') : null),
    [firestore, userId]
  );
  const { data: products, isLoading: productsLoading } = useCollection(productsRef);

  const inventoryRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'inventory') : null),
    [firestore, userId]
  );
  const { data: inventory, isLoading: inventoryLoading } = useCollection(inventoryRef);
  
  const packagingRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'packaging') : null),
    [firestore, userId]
  );
  const { data: packaging, isLoading: packagingLoading } = useCollection(packagingRef);
  
  const laborSettingsRef = useMemoFirebase(
    () => (firestore && userId ? doc(firestore, 'users', userId, 'laborCosts', 'settings') : null),
    [firestore, userId]
  );
  const { data: laborSettings, isLoading: laborLoading } = useDoc(laborSettingsRef);

  const overheadRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'overhead') : null),
    [firestore, userId]
  );
  const { data: overhead, isLoading: overheadLoading } = useCollection(overheadRef);

  const transportRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'transportCosts') : null),
    [firestore, userId]
  );
  const { data: transport, isLoading: transportLoading } = useCollection(transportRef);

  const capitalRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'capitalCosts') : null),
    [firestore, userId]
  );
  const { data: capital, isLoading: capitalLoading } = useCollection(capitalRef);

  const finishedProductsRef = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'finishedProducts') : null),
    [firestore, userId]
  );
  const { data: finishedProducts, isLoading: finishedProductsLoading } = useCollection(finishedProductsRef);


  const isLoading =
    userIsLoading ||
    productsLoading ||
    inventoryLoading ||
    packagingLoading ||
    laborLoading ||
    overheadLoading ||
    transportLoading ||
    capitalLoading ||
    finishedProductsLoading;

    const createFirestoreOperation = <T extends { id?: string }>(
      ref: any,
      operation: 'add' | 'set' | 'delete',
      item?: T | string
    ) => {
      if (!ref) return;
  
      const handleFirestoreError = (error: any, itemData?: any) => {
        const path = typeof item === 'string' ? doc(ref, item).path : ref.path;
        const op = operation === 'add' ? 'create' : operation === 'set' ? 'update' : 'delete';
        const permissionError = new FirestorePermissionError({
          path,
          operation: op,
          requestResourceData: itemData,
        });
        errorEmitter.emit('permission-error', permissionError);
      };
  
      if (operation === 'add' && typeof item !== 'string') {
        addDoc(ref, item).catch((e) => handleFirestoreError(e, item));
      } else if (operation === 'set' && typeof item !== 'string' && item?.id) {
        setDoc(doc(ref, item.id), item).catch((e) => handleFirestoreError(e, item));
      } else if (operation === 'delete' && typeof item === 'string') {
        deleteDoc(doc(ref, item)).catch((e) => handleFirestoreError(e));
      }
    };
  

  const state: AppDataContextType = {
    products: (products as Product[]) || [],
    inventory: (inventory as PriceList[]) || [],
    packaging: (packaging as PriceList[]) || [],
    laborSettings: (laborSettings as LaborSettings) || null,
    overhead: (overhead as OverheadItem[]) || [],
    transport: (transport as TransportItem[]) || [],
    capital: (capital as CapitalItem[]) || [],
    finishedProducts: (finishedProducts as FinishedProduct[]) || [],

    addProduct: (product) => createFirestoreOperation(productsRef, 'add', product),
    updateProduct: (updated) => createFirestoreOperation(productsRef, 'set', updated),
    addIngredient: (item) => createFirestoreOperation(inventoryRef, 'add', item),
    updateIngredient: (updated) => createFirestoreOperation(inventoryRef, 'set', updated),
    deleteIngredient: (id) => createFirestoreOperation(inventoryRef, 'delete', id),
    addPackagingItem: (item) => createFirestoreOperation(packagingRef, 'add', item),
    updatePackagingItem: (updated) => createFirestoreOperation(packagingRef, 'set', updated),
    deletePackagingItem: (id) => createFirestoreOperation(packagingRef, 'delete', id),
    setLaborSettings: (settings) => {
      if (laborSettingsRef) {
        setDoc(laborSettingsRef, settings).catch((e) => {
          const permissionError = new FirestorePermissionError({
            path: laborSettingsRef.path,
            operation: 'update',
            requestResourceData: settings,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      }
    },
    addOverheadItem: (item) => createFirestoreOperation(overheadRef, 'add', item),
    updateOverheadItem: (updated) => createFirestoreOperation(overheadRef, 'set', updated),
    deleteOverheadItem: (id) => createFirestoreOperation(overheadRef, 'delete', id),
    addTransportItem: (item) => createFirestoreOperation(transportRef, 'add', item),
    updateTransportItem: (updated) => createFirestoreOperation(transportRef, 'set', updated),
    deleteTransportItem: (id) => createFirestoreOperation(transportRef, 'delete', id),
    addCapitalItem: (item) => createFirestoreOperation(capitalRef, 'add', item),
    updateCapitalItem: (updated) => createFirestoreOperation(capitalRef, 'set', updated),
    deleteCapitalItem: (id) => createFirestoreOperation(capitalRef, 'delete', id),
    addFinishedProduct: (item) => createFirestoreOperation(finishedProductsRef, 'add', item),
    updateFinishedProduct: (updated) => createFirestoreOperation(finishedProductsRef, 'set', updated),
    deleteFinishedProduct: (id) => createFirestoreOperation(finishedProductsRef, 'delete', id),
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-6 p-6 w-full">
          <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={state}>
      <AppShell>{children}</AppShell>
    </AppDataContext.Provider>
  );
}
