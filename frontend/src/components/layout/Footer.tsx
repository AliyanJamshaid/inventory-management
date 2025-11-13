"use client";

export function Footer() {
  return (
    <footer className="border-t bg-white py-4 px-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>&copy; 2025 InventoryPro. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
