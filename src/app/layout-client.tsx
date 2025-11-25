'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { productsData, ingredientsData, packagingData, laborSettingsData, overheadData, transportData, capitalData, finishedProductsData } from '@/lib/data';
import type { Product, PriceList, LaborSettings, OverheadItem, TransportItem, CapitalItem, FinishedProduct } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AppDataContextType {
  products: Product[];
  inventory: PriceList[];
  packaging: PriceList[];
  laborSettings: LaborSettings;
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

// Helper to get data from localStorage
const getStoredData = (key: string, fallback: any) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<PriceList[]>([]);
  const [packaging, setPackaging] = useState<PriceList[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSettings>(laborSettingsData);
  const [overhead, setOverhead] = useState<OverheadItem[]>([]);
  const [transport, setTransport] = useState<TransportItem[]>([]);
  const [capital, setCapital] = useState<CapitalItem[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProducts(getStoredData('products', productsData));
    setInventory(getStoredData('inventory', ingredientsData));
    setPackaging(getStoredData('packaging', packagingData));
    setLaborSettings(getStoredData('laborSettings', laborSettingsData));
    setOverhead(getStoredData('overhead', overheadData));
    setTransport(getStoredData('transport', transportData));
    setCapital(getStoredData('capital', capitalData));
    setFinishedProducts(getStoredData('finishedProducts', finishedProductsData));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('products', JSON.stringify(products));
  }, [products, isLoading]);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory, isLoading]);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('packaging', JSON.stringify(packaging));
  }, [packaging, isLoading]);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('laborSettings', JSON.stringify(laborSettings));
  }, [laborSettings, isLoading]);
  
  useEffect(() => {
    if(!isLoading) localStorage.setItem('overhead', JSON.stringify(overhead));
  }, [overhead, isLoading]);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('transport', JSON.stringify(transport));
  }, [transport, isLoading]);
  
  useEffect(() => {
    if(!isLoading) localStorage.setItem('capital', JSON.stringify(capital));
  }, [capital, isLoading]);

  useEffect(() => {
    if(!isLoading) localStorage.setItem('finishedProducts', JSON.stringify(finishedProducts));
  }, [finishedProducts, isLoading]);

  const state: AppDataContextType = {
    products,
    inventory,
    packaging,
    laborSettings,
    overhead,
    transport,
    capital,
    finishedProducts,
    addProduct: (product) => setProducts(prev => [...prev, { ...product, id: `prod-${Date.now()}` }]),
    updateProduct: (updated) => setProducts(prev => prev.map(p => p.id === updated.id ? updated : p)),
    addIngredient: (item) => setInventory(prev => [...prev, { ...item, id: `ing-${Date.now()}` }]),
    updateIngredient: (updated) => setInventory(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deleteIngredient: (id) => setInventory(prev => prev.filter(i => i.id !== id)),
    addPackagingItem: (item) => setPackaging(prev => [...prev, { ...item, id: `pkg-${Date.now()}` }]),
    updatePackagingItem: (updated) => setPackaging(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deletePackagingItem: (id) => setPackaging(prev => prev.filter(i => i.id !== id)),
    setLaborSettings,
    addOverheadItem: (item) => setOverhead(prev => [...prev, { ...item, id: `ovh-${Date.now()}` }]),
    updateOverheadItem: (updated) => setOverhead(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deleteOverheadItem: (id) => setOverhead(prev => prev.filter(i => i.id !== id)),
    addTransportItem: (item) => setTransport(prev => [...prev, { ...item, id: `trn-${Date.now()}` }]),
    updateTransportItem: (updated) => setTransport(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deleteTransportItem: (id) => setTransport(prev => prev.filter(i => i.id !== id)),
    addCapitalItem: (item) => setCapital(prev => [...prev, { ...item, id: `cap-${Date.now()}` }]),
    updateCapitalItem: (updated) => setCapital(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deleteCapitalItem: (id) => setCapital(prev => prev.filter(i => i.id !== id)),
    addFinishedProduct: (item) => setFinishedProducts(prev => [...prev, { ...item, id: `fp-${Date.now()}` }]),
    updateFinishedProduct: (updated) => setFinishedProducts(prev => prev.map(i => i.id === updated.id ? updated : i)),
    deleteFinishedProduct: (id) => setFinishedProducts(prev => prev.filter(i => i.id !== id)),
  };

  if (isLoading) {
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
