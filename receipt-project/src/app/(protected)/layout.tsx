"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const LABELS: Record<string, string> = {
  transactions: "Transakcje",
  products: "Produkty",
  dashboard: "Kokpit",
  login: "Logowanie",
  "add-transaction": "Dodaj transakcję",
  "daily-raport": "Dzienny raport",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);
  if (!hydrated) return null;
  if (!token) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    let label: string;

    if (/^\d+$/.test(seg)) {
      label = "Szczegóły";
    } else {
      label = LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    }

    return { href, label };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-screen h-screen overflow-hidden">
        <div className="w-full pl-3 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, idx) => (
                <BreadcrumbItem key={crumb.href}>
                  <BreadcrumbLink
                    href={crumb.href}
                    {...(idx === crumbs.length - 1
                      ? { "aria-current": "page" }
                      : {})}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                  {idx < crumbs.length - 1 && (
                    <BreadcrumbSeparator className="mx-2" />
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="h-full w-full px-10">
          <main>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
