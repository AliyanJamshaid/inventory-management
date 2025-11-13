import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, BarChart3, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">InventoryPro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Modern Inventory Management for Growing Businesses
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Streamline your inventory operations with real-time tracking,
              automated reordering, and comprehensive analytics. Everything you
              need to manage your stock efficiently.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-slate-50 py-24">
          <div className="container px-4">
            <h2 className="text-center text-3xl font-bold">
              Everything you need to manage inventory
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Real-time Tracking
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Monitor your inventory levels in real-time across all
                  locations and warehouses.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Advanced Analytics
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Get insights into sales trends, stock levels, and business
                  performance with detailed reports.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Supplier Management
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Manage suppliers, track orders, and automate procurement
                  processes seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 InventoryPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
