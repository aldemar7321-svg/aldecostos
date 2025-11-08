'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import {
  inventoryData as initialInventoryData,
  productsData as initialProductsData,
  laborSettingsData as initialLaborSettingsData,
  overheadData as initialOverheadData,
} from '@/lib/data';
import type { Product, PriceList, LaborSettings, OverheadItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AppDataContextType {
  products: Product[];
  inventory: PriceList[];
  laborSettings: LaborSettings;
  overhead: OverheadItem[];
  addProduct: (product: Product) => void;
  updateProduct: (updatedProduct: Product) => void;
  addInventoryItem: (item: PriceList) => void;
  updateInventoryItem: (updatedItem: PriceList) => void;
  deleteInventoryItem: (itemId: string) => void;
  addOverheadItem: (item: OverheadItem) => void;
  updateOverheadItem: (updatedItem: OverheadItem) => void;
  deleteOverheadItem: (itemId: string) => void;
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
    return stored ? JSON.parse(stored) : fallback;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<PriceList[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSettings>(initialLaborSettingsData);
  const [overhead, setOverhead] = useState<OverheadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProducts(getStoredData('products', initialProductsData));
    setInventory(getStoredData('inventory', initialInventoryData));
    setLaborSettings(getStoredData('laborSettings', initialLaborSettingsData));
    setOverhead(getStoredData('overhead', initialOverheadData));
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
      localStorage.setItem('laborSettings', JSON.stringify(laborSettings));
    }
  }, [laborSettings, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('overhead', JSON.stringify(overhead));
    }
  }, [overhead, isLoading]);


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
  
  const addOverheadItem = (item: OverheadItem) => {
    setOverhead((prev) => [...prev, item]);
  };
  
  const updateOverheadItem = (updatedItem: OverheadItem) => {
    setOverhead((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteOverheadItem = (itemId: string) => {
    setOverhead((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSetLaborSettings = (settings: LaborSettings) => {
    setLaborSettings(settings);
  };

  const state = {
    products,
    inventory,
    laborSettings,
    overhead,
    addProduct,
    updateProduct,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addOverheadItem,
    updateOverheadItem,
    deleteOverheadItem,
    setLaborSettings: handleSetLaborSettings,
  };

  return (
    <AppDataContext.Provider value={state}>
      <AppShell>
        {isLoading ? (
            <div className="space-y-6">
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
