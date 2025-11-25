
'use client';

import { createContext, useContext, useMemo } from 'react';
import AppShell from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import type { Product, PriceList, LaborSettings, OverheadItem, TransportItem, CapitalItem, FinishedProduct } from '@/lib/types';


interface AppDataContextType {
  products: Product[] | null;
  inventory: PriceList[] | null;
  packaging: PriceList[] | null;
  laborSettings: LaborSettings | null;
  overhead: OverheadItem[] | null;
  transport: TransportItem[] | null;
  capital: CapitalItem[] | null;
  finishedProducts: FinishedProduct[] | null;
  addProduct: (product: Omit<Product, 'id' | 'userId'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  addIngredient: (item: Omit<PriceList, 'id' | 'userId'>) => void;
  updateIngredient: (updatedItem: PriceList) => void;
  deleteIngredient: (itemId: string) => void;
  addPackagingItem: (item: Omit<PriceList, 'id' | 'userId'>) => void;
  updatePackagingItem: (updatedItem: PriceList) => void;
  deletePackagingItem: (itemId: string) => void;
  addOverheadItem: (item: Omit<OverheadItem, 'id' | 'userId'>) => void;
  updateOverheadItem: (updatedItem: OverheadItem) => void;
  deleteOverheadItem: (itemId: string) => void;
  addTransportItem: (item: Omit<TransportItem, 'id' | 'userId'>) => void;
  updateTransportItem: (updatedItem: TransportItem) => void;
  deleteTransportItem: (itemId: string) => void;
  addCapitalItem: (item: Omit<CapitalItem, 'id' | 'userId'>) => void;
  updateCapitalItem: (updatedItem: CapitalItem) => void;
  deleteCapitalItem: (itemId: string) => void;
  setLaborSettings: (settings: LaborSettings) => void;
  addFinishedProduct: (item: Omit<FinishedProduct, 'id' | 'userId'>) => void;
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  if (!isUserLoading && !user) {
    router.push('/');
  }

  const userId = user?.uid;

  const recipesRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'recipes') : null, [firestore, userId]);
  const inventoryRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'inventory') : null, [firestore, userId]);
  const packagingRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'packaging') : null, [firestore, userId]);
  const laborCostsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'laborCosts') : null, [firestore, userId]);
  const overheadCostsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'overheadCosts') : null, [firestore, userId]);
  const transportCostsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'transportCosts') : null, [firestore, userId]);
  const capitalCostsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'capitalCosts') : null, [firestore, userId]);
  const finishedProductsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'finishedProducts') : null, [firestore, userId]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(recipesRef);
  const { data: inventory, isLoading: inventoryLoading } = useCollection<PriceList>(inventoryRef);
  const { data: packaging, isLoading: packagingLoading } = useCollection<PriceList>(packagingRef);
  const { data: laborSettings, isLoading: laborLoading } = useCollection<LaborSettings>(laborCostsRef);
  const { data: overhead, isLoading: overheadLoading } = useCollection<OverheadItem>(overheadCostsRef);
  const { data: transport, isLoading: transportLoading } = useCollection<TransportItem>(transportCostsRef);
  const { data: capital, isLoading: capitalLoading } = useCollection<CapitalItem>(capitalCostsRef);
  const { data: finishedProducts, isLoading: finishedProductsLoading } = useCollection<FinishedProduct>(finishedProductsRef);

  const isLoading = isUserLoading || productsLoading || inventoryLoading || packagingLoading || laborLoading || overheadLoading || transportLoading || capitalLoading || finishedProductsLoading;

  const state = useMemo(() => ({
    products,
    inventory,
    packaging,
    laborSettings: laborSettings?.[0] || null,
    overhead,
    transport,
    capital,
    finishedProducts,
    addProduct: (product: Omit<Product, 'id' | 'userId'>) => {
        if (recipesRef) addDocumentNonBlocking(recipesRef, { ...product, userId });
    },
    updateProduct: (updatedProduct: Product) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'recipes', updatedProduct.id), { ...updatedProduct, userId }, { merge: true });
    },
    addIngredient: (item: Omit<PriceList, 'id' | 'userId'>) => {
        if (inventoryRef) addDocumentNonBlocking(inventoryRef, { ...item, userId });
    },
    updateIngredient: (updatedItem: PriceList) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'inventory', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deleteIngredient: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'inventory', itemId));
    },
    addPackagingItem: (item: Omit<PriceList, 'id'| 'userId'>) => {
        if (packagingRef) addDocumentNonBlocking(packagingRef, { ...item, userId });
    },
    updatePackagingItem: (updatedItem: PriceList) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'packaging', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deletePackagingItem: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'packaging', itemId));
    },
    addOverheadItem: (item: Omit<OverheadItem, 'id'| 'userId'>) => {
        if (overheadCostsRef) addDocumentNonBlocking(overheadCostsRef, { ...item, userId });
    },
    updateOverheadItem: (updatedItem: OverheadItem) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'overheadCosts', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deleteOverheadItem: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'overheadCosts', itemId));
    },
    addTransportItem: (item: Omit<TransportItem, 'id'| 'userId'>) => {
        if (transportCostsRef) addDocumentNonBlocking(transportCostsRef, { ...item, userId });
    },
    updateTransportItem: (updatedItem: TransportItem) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'transportCosts', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deleteTransportItem: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'transportCosts', itemId));
    },
    addCapitalItem: (item: Omit<CapitalItem, 'id'| 'userId'>) => {
        if (capitalCostsRef) addDocumentNonBlocking(capitalCostsRef, { ...item, userId });
    },
    updateCapitalItem: (updatedItem: CapitalItem) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'capitalCosts', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deleteCapitalItem: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'capitalCosts', itemId));
    },
    setLaborSettings: (settings: LaborSettings) => {
        if (laborCostsRef) setDocumentNonBlocking(doc(laborCostsRef, 'settings'), { ...settings, userId }, { merge: true });
    },
    addFinishedProduct: (item: Omit<FinishedProduct, 'id'| 'userId'>) => {
        if (finishedProductsRef) addDocumentNonBlocking(finishedProductsRef, { ...item, userId });
    },
    updateFinishedProduct: (updatedItem: FinishedProduct) => {
        if (userId) setDocumentNonBlocking(doc(firestore, 'users', userId, 'finishedProducts', updatedItem.id), { ...updatedItem, userId }, { merge: true });
    },
    deleteFinishedProduct: (itemId: string) => {
        if (userId) deleteDocumentNonBlocking(doc(firestore, 'users', userId, 'finishedProducts', itemId));
    },
  }), [userId, firestore, products, inventory, packaging, laborSettings, overhead, transport, capital, finishedProducts, recipesRef, inventoryRef, packagingRef, laborCostsRef, overheadCostsRef, transportCostsRef, capitalCostsRef, finishedProductsRef]);
  
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
    )
  }

  return (
    <AppDataContext.Provider value={state}>
      <AppShell>
        {children}
      </AppShell>
    </AppDataContext.Provider>
  );
}
