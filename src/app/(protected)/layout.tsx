'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import {
  ingredientsData as initialIngredientsData,
  packagingData as initialPackagingData,
  productsData as initialProductsData,
  laborSettingsData as initialLaborSettingsData,
  overheadData as initialOverheadData,
  transportData as initialTransportData,
  capitalData as initialCapitalData,
  finishedProductsData as initialFinishedProductsData,
} from '@/lib/data';
import type { Product, PriceList, LaborSettings, OverheadItem, TransportItem, CapitalItem, FinishedProduct } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

interface AppDataContextType {
  products: Product[];
  inventory: PriceList[];
  packaging: PriceList[];
  laborSettings: LaborSettings;
  overhead: OverheadItem[];
  transport: TransportItem[];
  capital: CapitalItem[];
  finishedProducts: FinishedProduct[];
  addProduct: (product: Product) => void;
  updateProduct: (updatedProduct: Product) => void;
  addIngredient: (item: PriceList) => void;
  updateIngredient: (updatedItem: PriceList) => void;
  deleteIngredient: (itemId: string) => void;
  addPackagingItem: (item: PriceList) => void;
  updatePackagingItem: (updatedItem: PriceList) => void;
  deletePackagingItem: (itemId: string) => void;
  addOverheadItem: (item: OverheadItem) => void;
  updateOverheadItem: (updatedItem: OverheadItem) => void;
  deleteOverheadItem: (itemId: string) => void;
  addTransportItem: (item: TransportItem) => void;
  updateTransportItem: (updatedItem: TransportItem) => void;
  deleteTransportItem: (itemId: string) => void;
  addCapitalItem: (item: CapitalItem) => void;
  updateCapitalItem: (updatedItem: CapitalItem) => void;
  deleteCapitalItem: (itemId: string) => void;
  setLaborSettings: (settings: LaborSettings) => void;
  addFinishedProduct: (item: FinishedProduct) => void;
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

const getStoredData = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    const stored = localStorage.getItem(key);
    try {
        if (!stored) return fallback;
        const parsed = JSON.parse(stored);
        // Basic migration/validation logic
        if (key === 'overhead' || key === 'transport' || key === 'capital') {
            if (Array.isArray(parsed) && parsed.length > 0 && !('allocationBasis' in parsed[0])) {
                return (parsed as any[]).map(item => ({...item, allocationBasis: 'labor'})) as T;
            }
        }
        if (key === 'products' && Array.isArray(parsed) && parsed.length > 0 && !('ingredients' in parsed[0])) {
            return (parsed as any[]).map(item => ({...item, ingredients: []})) as T;
        }
        return parsed;
    } catch (error) {
        console.error(`Error parsing stored data for key "${key}":`, error);
        return fallback;
    }
}

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<PriceList[]>([]);
  const [packaging, setPackaging] = useState<PriceList[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSettings>(initialLaborSettingsData);
  const [overhead, setOverhead] = useState<OverheadItem[]>([]);
  const [transport, setTransport] = useState<TransportItem[]>([]);
  const [capital, setCapital] = useState<CapitalItem[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    setProducts(getStoredData('products', initialProductsData));
    setInventory(getStoredData('inventory', initialIngredientsData));
    setPackaging(getStoredData('packaging', initialPackagingData));
    setLaborSettings(getStoredData('laborSettings', initialLaborSettingsData));
    setOverhead(getStoredData('overhead', initialOverheadData));
    setTransport(getStoredData('transport', initialTransportData));
    setCapital(getStoredData('capital', initialCapitalData));
    setFinishedProducts(getStoredData('finishedProducts', initialFinishedProductsData));
    setIsDataLoading(false);
  }, []);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('packaging', JSON.stringify(packaging));
    }
  }, [packaging, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('laborSettings', JSON.stringify(laborSettings));
    }
  }, [laborSettings, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('overhead', JSON.stringify(overhead));
    }
  }, [overhead, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('transport', JSON.stringify(transport));
    }
  }, [transport, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('capital', JSON.stringify(capital));
    }
  }, [capital, isDataLoading]);

  useEffect(() => {
    if(!isDataLoading) {
      localStorage.setItem('finishedProducts', JSON.stringify(finishedProducts));
    }
  }, [finishedProducts, isDataLoading]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const addIngredient = (item: PriceList) => {
    setInventory((prev) => [...prev, item]);
  };

  const updateIngredient = (updatedItem: PriceList) => {
    setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteIngredient = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };
  
  const addPackagingItem = (item: PriceList) => {
    setPackaging((prev) => [...prev, item]);
  };

  const updatePackagingItem = (updatedItem: PriceList) => {
    setPackaging((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };
  
  const deletePackagingItem = (itemId: string) => {
    setPackaging((prev) => prev.filter((i) => i.id !== itemId));
  };

  const addOverheadItem = (item: OverheadItem) => {
    setOverhead((prev) => [...prev, item]);
  };
  
  const updateOverheadItem = (updatedItem: OverheadItem) => {
    setOverhead((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteOverheadItem = (itemId: string) => {
    setOverhead((prev) => prev.filter((i) => i.id !== itemId));
  };

  const addTransportItem = (item: TransportItem) => {
    setTransport((prev) => [...prev, item]);
  };

  const updateTransportItem = (updatedItem: TransportItem) => {
    setTransport((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteTransportItem = (itemId: string) => {
    setTransport((prev) => prev.filter((i) => i.id !== itemId));
  };

  const addCapitalItem = (item: CapitalItem) => {
    setCapital((prev) => [...prev, item]);
  };

  const updateCapitalItem = (updatedItem: CapitalItem) => {
    setCapital((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteCapitalItem = (itemId: string) => {
    setCapital((prev) => prev.filter((i) => i.id !== itemId));
  };

  const addFinishedProduct = (item: FinishedProduct) => {
    setFinishedProducts((prev) => [...prev, item]);
  };

  const updateFinishedProduct = (updatedItem: FinishedProduct) => {
    setFinishedProducts((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteFinishedProduct = (itemId: string) => {
    setFinishedProducts((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSetLaborSettings = (settings: LaborSettings) => {
    setLaborSettings(settings);
  };

  const state = {
    products,
    inventory,
    packaging,
    laborSettings,
    overhead,
    transport,
    capital,
    finishedProducts,
    addProduct,
    updateProduct,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addPackagingItem,
    updatePackagingItem,
    deletePackagingItem,
    addOverheadItem,
    updateOverheadItem,
    deleteOverheadItem,
    addTransportItem,
    updateTransportItem,
    deleteTransportItem,
    addCapitalItem,
    updateCapitalItem,
    deleteCapitalItem,
    setLaborSettings: handleSetLaborSettings,
    addFinishedProduct,
    updateFinishedProduct,
    deleteFinishedProduct,
  };
  
  const isLoading = isUserLoading || isDataLoading;

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="space-y-6 p-6">
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
