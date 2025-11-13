import { Document, Types } from 'mongoose';

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

/**
 * Stock Transaction Type Enum
 */
export enum StockTransactionType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Purchase Order Status Enum
 */
export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

/**
 * Sales Order Status Enum
 */
export enum SalesOrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

/**
 * Invoice Status Enum
 */
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
}

/**
 * Payment Transaction Status Enum
 */
export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Customer Type Enum
 */
export enum CustomerType {
  B2B = 'B2B',
  B2C = 'B2C',
}

/**
 * Stock Location Type Enum
 */
export enum StockLocationType {
  SHELF = 'SHELF',
  AISLE = 'AISLE',
  BIN = 'BIN',
  RACK = 'RACK',
  FLOOR = 'FLOOR',
  PALLET = 'PALLET',
}

/**
 * Notification Type Enum
 */
export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  ORDER_STATUS = 'ORDER_STATUS',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

/**
 * User Document Interface
 */
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

/**
 * Permission Document Interface
 */
export interface IPermission extends Document {
  resource: string;
  actions: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role Document Interface
 */
export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Document Interface
 */
export interface ICategory extends Document {
  name: string;
  description?: string;
  parent?: Types.ObjectId;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  children?: ICategory[];
}

/**
 * Product Variant Document Interface
 */
export interface IProductVariant extends Document {
  product: Types.ObjectId;
  variantName: string;
  sku: string;
  barcode?: string;
  attributes: Map<string, any>;
  costPrice: number;
  sellingPrice: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Document Interface
 */
export interface IProduct extends Document {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category?: Types.ObjectId;
  supplier?: Types.ObjectId;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  tax: number;
  images: string[];
  variants: Types.ObjectId[];
  attributes: Map<string, any>;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Warehouse Document Interface
 */
export interface IWarehouse extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  manager?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock Location Document Interface
 */
export interface IStockLocation extends Document {
  warehouse: Types.ObjectId;
  name: string;
  code: string;
  type: StockLocationType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock Document Interface
 */
export interface IStock extends Document {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  warehouse: Types.ObjectId;
  location?: Types.ObjectId;
  quantity: number;
  reservedQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: Date;
  lastStockTakeDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  availableQuantity: number;
}

/**
 * Stock Transaction Document Interface
 */
export interface IStockTransaction extends Document {
  type: StockTransactionType;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  warehouse: Types.ObjectId;
  location?: Types.ObjectId;
  quantity: number;
  fromWarehouse?: Types.ObjectId;
  toWarehouse?: Types.ObjectId;
  reasonCode?: string;
  reference?: string;
  batchNumber?: string;
  serialNumber?: string;
  performedBy: Types.ObjectId;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
}

/**
 * Supplier Document Interface
 */
export interface ISupplier extends Document {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  paymentTerms?: string;
  rating?: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Purchase Order Item Interface
 */
export interface IPurchaseOrderItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

/**
 * Purchase Order Document Interface
 */
export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: Types.ObjectId;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  approvedBy?: Types.ObjectId;
  receivedBy?: Types.ObjectId;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer Document Interface
 */
export interface ICustomer extends Document {
  customerNumber: string;
  name: string;
  email?: string;
  phone?: string;
  type: CustomerType;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  creditLimit: number;
  currentCredit: number;
  paymentTerms?: string;
  loyaltyPoints: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sales Order Item Interface
 */
export interface ISalesOrderItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Sales Order Document Interface
 */
export interface ISalesOrder extends Document {
  soNumber: string;
  customer: Types.ObjectId;
  orderDate: Date;
  deliveryDate?: Date;
  status: SalesOrderStatus;
  items: ISalesOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  processedBy?: Types.ObjectId;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invoice Item Interface
 */
export interface IInvoiceItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Invoice Document Interface
 */
export interface IInvoice extends Document {
  invoiceNumber: string;
  salesOrder?: Types.ObjectId;
  customer: Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Document Interface
 */
export interface IPayment extends Document {
  invoice: Types.ObjectId;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: PaymentTransactionStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

/**
 * Notification Document Interface
 */
export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

/**
 * Activity Log Document Interface
 */
export interface IActivityLog extends Document {
  user?: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Settings Document Interface
 */
export interface ISettings extends Document {
  key: string;
  value: any;
  category: string;
  description?: string;
  dataType: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}
