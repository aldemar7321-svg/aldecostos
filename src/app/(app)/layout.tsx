'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import {
  inventoryData as initialInventoryData,
  packagingData as initialPackagingData,
  productsData as initialProductsData,
  laborSettingsData as initialLaborSettingsData,
  overheadData as initialOverheadData,
  transportData as initialTransportData,
  capitalData as initialCapitalData,
} from '@/lib/data';
import type { Product, PriceList, LaborSettings, OverheadItem, TransportItem, CapitalItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AppDataContextType {
  products: Product[];
  inventory: PriceList[];
  packaging: PriceList[];
  laborSettings: LaborSettings;
  overhead: OverheadItem[];
  transport: TransportItem[];
  capital: CapitalItem[];
  addProduct: (product: Product) => void;
  updateProduct: (updatedProduct: Product) => void;
  addInventoryItem: (item: PriceList) => void;
  updateInventoryItem: (updatedItem: PriceList) => void;
  deleteInventoryItem: (itemId: string) => void;
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
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.error(`Error parsing stored data for key "${key}":`, error);
        return fallback;
    }
}

export default function AppLayout({
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProducts(getStoredData('products', initialProductsData));
    setInventory(getStoredData('inventory', initialInventoryData));
    setPackaging(getStoredData('packaging', initialPackagingData));
    setLaborSettings(getStoredData('laborSettings', initialLaborSettingsData));
    setOverhead(getStoredData('overhead', initialOverheadData));
    setTransport(getStoredData('transport', initialTransportData));
    setCapital(getStoredData('capital', initialCapitalData));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory, isLoading]);
  
  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('packaging', JSON.stringify(packaging));
    }
  }, [packaging, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('laborSettings', JSON.stringify(laborSettings));
    }
  }, [laborSettings, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('overhead', JSON.stringify(overhead));
    }
  }, [overhead, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('transport', JSON.stringify(transport));
    }
  }, [transport, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('capital', JSON.stringify(capital));
    }
  }, [capital, isLoading]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const addInventoryItem = (item: PriceList) => {
    setInventory((prev) => [...prev, item]);
  };

  const updateInventoryItem = (updatedItem: PriceList) => {
    setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };
  
  const deleteInventoryItem = (itemId: string) => {
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
    addProduct,
    updateProduct,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
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
  };

  return (
    <AppDataContext.Provider value={state}>
      <AppShell>
        {isLoading ? (
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
        ) : children}
      </AppShell>
    </AppDataContext.Provider>
  );
}
