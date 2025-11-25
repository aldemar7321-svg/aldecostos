'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppShell from '@/components/app-shell';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type {
  Product,
  PriceList,
  LaborSettings,
  OverheadItem,
  TransportItem,
  CapitalItem,
  FinishedProduct,
} from '@/lib/types';
import {
  productsData,
  ingredientsData,
  packagingData,
  laborSettingsData,
  overheadData,
  transportData,
  capitalData,
  finishedProductsData
} from '@/lib/data';

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

const getStoredData = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing JSON from localStorage key "${key}":`, e);
      return fallback;
    }
  }
  return fallback;
};

const storeData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<PriceList[]>([]);
  const [packaging, setPackaging] = useState<PriceList[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSettings | null>(null);
  const [overhead, setOverhead] = useState<OverheadItem[]>([]);
  const [transport, setTransport] = useState<TransportItem[]>([]);
  const [capital, setCapital] = useState<CapitalItem[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // Check if data is already in localStorage to prevent overwriting on refresh
    const initialProducts = getStoredData('products', productsData);
    const initialInventory = getStoredData('inventory', ingredientsData);
    const initialPackaging = getStoredData('packaging', packagingData);
    const initialLaborSettings = getStoredData('laborSettings', laborSettingsData);
    const initialOverhead = getStoredData('overhead', overheadData);
    const initialTransport = getStoredData('transport', transportData);
    const initialCapital = getStoredData('capital', capitalData);
    const initialFinishedProducts = getStoredData('finishedProducts', finishedProductsData);

    setProducts(initialProducts);
    setInventory(initialInventory);
    setPackaging(initialPackaging);
    setLaborSettings(initialLaborSettings);
    setOverhead(initialOverhead);
    setTransport(initialTransport);
    setCapital(initialCapital);
    setFinishedProducts(initialFinishedProducts);
    
    setIsDataLoaded(true);
  }, []);

  useEffect(() => { if (isDataLoaded) storeData('products', products) }, [products, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('inventory', inventory) }, [inventory, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('packaging', packaging) }, [packaging, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('laborSettings', laborSettings) }, [laborSettings, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('overhead', overhead) }, [overhead, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('transport', transport) }, [transport, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('capital', capital) }, [capital, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) storeData('finishedProducts', finishedProducts) }, [finishedProducts, isDataLoaded]);
  
  const createItem = useCallback(<T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    item: Omit<T, 'id'>
  ) => {
    setter(prev => [...prev, { ...item, id: `item-${Date.now()}` } as T]);
  }, []);

  const updateItem = useCallback(<T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    updated: T
  ) => {
    setter(prev => prev.map(item => item.id === updated.id ? updated : item));
  }, []);

  const deleteItem = useCallback((
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    id: string
  ) => {
    setter(prev => prev.filter(item => item.id !== id));
  }, []);

  const state: AppDataContextType = {
    products,
    inventory,
    packaging,
    laborSettings,
    overhead,
    transport,
    capital,
    finishedProducts,
    addProduct: (product) => createItem(setProducts, product),
    updateProduct: (updated) => updateItem(setProducts, updated),
    addIngredient: (item) => createItem(setInventory, item),
    updateIngredient: (updated) => updateItem(setInventory, updated),
    deleteIngredient: (id) => deleteItem(setInventory, id),
    addPackagingItem: (item) => createItem(setPackaging, item),
    updatePackagingItem: (updated) => updateItem(setPackaging, updated),
    deletePackagingItem: (id) => deleteItem(setPackaging, id),
    addOverheadItem: (item) => createItem(setOverhead, item),
    updateOverheadItem: (updated) => updateItem(setOverhead, updated),
    deleteOverheadItem: (id) => deleteItem(setOverhead, id),
    addTransportItem: (item) => createItem(setTransport, item),
    updateTransportItem: (updated) => updateItem(setTransport, updated),
    deleteTransportItem: (id) => deleteItem(setTransport, id),
    addCapitalItem: (item) => createItem(setCapital, item),
    updateCapitalItem: (updated) => updateItem(setCapital, updated),
    deleteCapitalItem: (id) => deleteItem(setCapital, id),
    setLaborSettings: (settings) => setLaborSettings(settings),
    addFinishedProduct: (item) => createItem(setFinishedProducts, item),
    updateFinishedProduct: (updated) => updateItem(setFinishedProducts, updated),
    deleteFinishedProduct: (id) => deleteItem(setFinishedProducts, id),
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppDataContext.Provider value={state}>
          {isDataLoaded ? (
            <AppShell>{children}</AppShell>
          ) : (
            <div className="flex h-screen items-center justify-center">Cargando datos...</div>
          )}
        </AppDataContext.Provider>
        <Toaster />
      </body>
    </html>
  );
}
