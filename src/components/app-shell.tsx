
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  Boxes,
  Factory,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  FlaskConical,
  Warehouse,
  Heart,
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: FlaskConical, label: "Materia Prima" },
  { href: "/packaging", icon: Package, label: "Empaques" },
  { href: "/recipes", icon: BookHeart, label: "Recetas" },
  { href: "/labor", icon: Users, label: "Mano de Obra" },
  { href: "/overhead", icon: Factory, label: "Costos Indirectos" },
  { href: "/transport", icon: Truck, label: "Transporte" },
  { href: "/capital-investment", icon: Landmark, label: "Inversión" },
  { href: "/finished-products", icon: Warehouse, label: "Productos Terminados" },
  { href: "/reports", icon: FileText, label: "Reportes" },
];

const secondaryNavItems = [
    { href: "/donate", icon: Heart, label: "Donar" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
              <Boxes className="h-5 w-5 text-primary" />
            </Button>
            <span className="text-lg font-semibold">ProdCost Pro</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    as="a"
                    href={item.href}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu>
            {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton
                            as="a"
                            href={item.href}
                            isActive={pathname === item.href}
                            tooltip={item.label}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarSeparator />
            <div className="p-2 flex flex-col gap-2">
                {user && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Sign out</span>
                        </Button>
                    </div>
                )}
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <SidebarTrigger className="shrink-0 md:hidden" />
          <div className="flex-1">
            {/* Can add a global search here if needed */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
