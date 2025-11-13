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
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
  createPasswordResetToken(): string;
}

/**
 * Permission Document Interface
 */
export interface IPermission extends Document {
  module: string; // e.g., "products", "inventory", "customers"
  resource: string; // e.g., "product", "stock", "customer"
  action: string; // e.g., "create", "read", "update", "delete", "approve"
  displayName: string; // e.g., "Create Products"
  description?: string;
  category: string; // group permissions, e.g., "Inventory Management"
  conditions?: any; // field-level or row-level permissions
  isSystemPermission: boolean; // can't be deleted
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role Document Interface
 */
export interface IRole extends Document {
  name: string;
  displayName: string;
  description?: string;
  permissions: Types.ObjectId[];
  isSystemRole: boolean; // built-in roles (can't delete)
  isDefault: boolean; // assigned to new users
  hierarchy: number; // 1 = highest (admin), 100 = lowest
  customSettings?: Map<string, any>; // role-specific settings
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  addPermission(permissionId: Types.ObjectId): Promise<void>;
  removePermission(permissionId: Types.ObjectId): Promise<void>;
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
  customFields: Map<string, any>;
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
 * Barcode Type Enum
 */
export enum BarcodeType {
  EAN13 = 'EAN13',
  UPC = 'UPC',
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  QR = 'QR',
  INTERNAL = 'INTERNAL',
}

/**
 * Product Document Interface
 */
export interface IProduct extends Document {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  barcodeType?: BarcodeType;
  qrCode?: string;
  alternativeBarcodes?: string[];
  category?: Types.ObjectId;
  supplier?: Types.ObjectId;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  tax: number;
  prices: Map<string, number>; // Multi-currency prices (currency code → price)
  images: string[];
  variants: Types.ObjectId[];
  attributes: Map<string, any>;
  customFields: Map<string, any>;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  addVariant(variantId: Types.ObjectId): Promise<void>;
  removeVariant(variantId: Types.ObjectId): Promise<void>;
  getPriceInCurrency(currencyCode: string): Promise<number>;
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
  customFields: Map<string, any>;
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
  customFields: Map<string, any>;
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
  currency: string; // Currency code (ISO 4217)
  exchangeRate: number; // Exchange rate at time of transaction
  amountInBaseCurrency: number; // Total amount in base currency
  customFields: Map<string, any>;
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
  customFields: Map<string, any>;
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
  currency: string; // Currency code (ISO 4217)
  exchangeRate: number; // Exchange rate at time of transaction
  amountInBaseCurrency: number; // Total amount in base currency
  paymentStatus: PaymentStatus;
  customFields: Map<string, any>;
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
  currency: string; // Currency code (ISO 4217)
  exchangeRate: number; // Exchange rate at time of transaction
  amountInBaseCurrency: number; // Total amount in base currency
  paymentMethod?: PaymentMethod;
  customFields: Map<string, any>;
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

/**
 * Custom Field Type Enum
 */
export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  FILE = 'file',
  JSON = 'json',
}

/**
 * Custom Field Entity Type Enum
 */
export enum CustomFieldEntityType {
  PRODUCT = 'product',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  SALES_ORDER = 'sales_order',
  PURCHASE_ORDER = 'purchase_order',
  INVOICE = 'invoice',
  WAREHOUSE = 'warehouse',
  CATEGORY = 'category',
}

/**
 * Custom Field Validation Interface
 */
export interface ICustomFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

/**
 * Custom Field Document Interface
 */
export interface ICustomField extends Document {
  entityType: CustomFieldEntityType;
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  required: boolean;
  defaultValue?: any;
  validation?: ICustomFieldValidation;
  helpText?: string;
  placeholder?: string;
  order: number;
  section?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow Entity Type Enum
 */
export enum WorkflowEntityType {
  SALES_ORDER = 'sales_order',
  PURCHASE_ORDER = 'purchase_order',
  INVOICE = 'invoice',
  RETURN = 'return',
  CUSTOM = 'custom',
}

/**
 * Workflow Status Interface
 */
export interface IWorkflowStatus {
  key: string;
  label: string;
  color: string;
  icon?: string;
  description?: string;
  isInitial: boolean;
  isFinal: boolean;
  order: number;
  actions?: string[];
}

/**
 * Workflow Transition Interface
 */
export interface IWorkflowTransition {
  from: string;
  to: string;
  label: string;
  requiresPermission?: string[];
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  webhookUrl?: string;
  emailNotification?: boolean;
  conditions?: any;
}

/**
 * Workflow Definition Document Interface
 */
export interface IWorkflowDefinition extends Document {
  name: string;
  entityType: WorkflowEntityType;
  statuses: IWorkflowStatus[];
  transitions: IWorkflowTransition[];
  isActive: boolean;
  isDefault: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  validateWorkflow(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  getInitialStatus(): IWorkflowStatus | undefined;
  getStatusByKey(key: string): IWorkflowStatus | undefined;
  getAllowedTransitions(statusKey: string): IWorkflowTransition[];
}

/**
 * Status History Document Interface
 */
export interface IStatusHistory extends Document {
  entityType: WorkflowEntityType;
  entityId: Types.ObjectId;
  fromStatus?: string;
  toStatus: string;
  changedBy: Types.ObjectId;
  changedAt: Date;
  notes?: string;
  metadata?: any;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getFormattedDuration(): string;
}

/**
 * Label Template Type Enum
 */
export enum LabelTemplateType {
  PRODUCT = 'product',
  LOCATION = 'location',
  BOX = 'box',
  ASSET = 'asset',
  PRICE_TAG = 'price_tag',
}

/**
 * Label Layout Interface
 */
export interface ILabelLayout {
  showBarcode: boolean;
  showQRCode: boolean;
  showProductName: boolean;
  showPrice: boolean;
  showSKU: boolean;
  showDescription: boolean;
  showCategory: boolean;
  fontSize: number;
  barcodeHeight: number;
}

/**
 * Label Template Document Interface
 */
export interface ILabelTemplate extends Document {
  name: string;
  type: LabelTemplateType;
  width: number;
  height: number;
  layout: ILabelLayout;
  isDefault: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Currency Document Interface
 */
export interface ICurrency extends Document {
  code: string; // ISO 4217 code (USD, EUR, GBP, etc.)
  name: string; // US Dollar, Euro, British Pound
  symbol: string; // $, €, £
  decimalPlaces: number; // 2 for most, 0 for JPY
  exchangeRate: number; // rate to base currency
  isBaseCurrency: boolean; // only one can be true
  isActive: boolean;
  lastUpdated: Date; // last time exchange rate was updated
  createdAt: Date;
  updatedAt: Date;

  // Methods
  formatAmount(amount: number): string;
}

/**
 * Exchange Rate Document Interface
 */
export interface IExchangeRate extends Document {
  fromCurrency: string; // Currency code
  toCurrency: string; // Currency code
  rate: number;
  date: Date;
  source?: string; // API source (e.g., "exchangerate-api.com")
  createdAt: Date;
}
