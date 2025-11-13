/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 */

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { PermissionKey } from '@/types/permission';

interface PermissionGuardProps {
  /**
   * Single permission required
   */
  permission?: PermissionKey;

  /**
   * All of these permissions required (AND logic)
   */
  allOf?: PermissionKey[];

  /**
   * Any of these permissions required (OR logic)
   */
  anyOf?: PermissionKey[];

  /**
   * Children to render if permission check passes
   */
  children: ReactNode;

  /**
   * Fallback to render if permission check fails
   */
  fallback?: ReactNode;

  /**
   * If true, renders null instead of fallback when check fails
   */
  hideWhenDenied?: boolean;
}

/**
 * PermissionGuard component
 * Conditionally renders content based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGuard permission="products.product.create">
 *   <Button>Create Product</Button>
 * </PermissionGuard>
 *
 * @example
 * // All permissions (AND)
 * <PermissionGuard allOf={["products.product.create", "inventory.stock.adjust"]}>
 *   <ComplexFeature />
 * </PermissionGuard>
 *
 * @example
 * // Any permission (OR)
 * <PermissionGuard anyOf={["orders.sales_order.read", "orders.purchase_order.read"]}>
 *   <OrdersSection />
 * </PermissionGuard>
 *
 * @example
 * // With fallback
 * <PermissionGuard
 *   permission="finance.invoice.read"
 *   fallback={<div>You don't have access to view invoices</div>}
 * >
 *   <InvoiceList />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  allOf,
  anyOf,
  children,
  fallback = null,
  hideWhenDenied = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuthStore();

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }

  // Check all permissions (AND logic)
  else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf);
  }

  // Check any permissions (OR logic)
  else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf);
  }

  // If no permissions specified, grant access by default
  else {
    hasAccess = true;
  }

  // If access is granted, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If access is denied
  if (hideWhenDenied) {
    return null;
  }

  return <>{fallback}</>;
}

export default PermissionGuard;
