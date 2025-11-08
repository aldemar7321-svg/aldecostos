'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import {
  inventoryData as initialInventoryData,
  productsData as initialProductsData,
  laborSettingsData as initialLaborSettingsData,
  overheadData as initialOverheadData,
} from '@/lib/data';
import type { Product, PriceList, LaborSettings, OverheadItem } from '@/lib/types';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>(initialProductsData);
  const [inventory, setInventory] = useState<PriceList[]>(initialInventoryData);
  const [laborSettings, setLaborSettings] = useState<LaborSettings>(initialLaborSettingsData);
  const [overhead, setOverhead] = useState<OverheadItem[]>(initialOverheadData);

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
    setLaborSettings,
  };

  return (
    <AppShell>
      {typeof children === 'function' ? children(state) : children}
    </AppShell>
  );
}
