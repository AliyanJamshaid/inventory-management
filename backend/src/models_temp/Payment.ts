import mongoose, { Schema } from 'mongoose';
import { IPayment, PaymentMethod, PaymentTransactionStatus } from '../types/models';

/**
 * Payment Schema
 * Tracks individual payment transactions for invoices
 */
const paymentSchema = new Schema<IPayment>(
  {
    /**
     * Reference to invoice
     */
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice is required'],
    },

    /**
     * Date when payment was made
     */
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    /**
     * Payment amount
     */
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },

    /**
     * Payment method used
     */
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Payment method is required'],
    },

    /**
     * Transaction ID from payment gateway or bank
     */
    transactionId: {
      type: String,
      trim: true,
    },

    /**
     * Payment status
     */
    status: {
      type: String,
      enum: Object.values(PaymentTransactionStatus),
      default: PaymentTransactionStatus.PENDING,
      required: true,
    },

    /**
     * Additional notes about the payment
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    /**
     * User who recorded the payment
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
paymentSchema.index({ invoice: 1, paymentDate: -1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });
paymentSchema.index({ createdBy: 1 });

/**
 * Post-save middleware to update invoice paid amount
 */
paymentSchema.post('save', async function (doc) {
  if (doc.status === PaymentTransactionStatus.COMPLETED) {
    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findById(doc.invoice);

    if (invoice) {
      // Recalculate total paid amount from all completed payments
      const Payment = mongoose.model('Payment');
      const payments = await Payment.find({
        invoice: doc.invoice,
        status: PaymentTransactionStatus.COMPLETED,
      });

      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      invoice.paidAmount = totalPaid;
      await invoice.save();
    }
  }
});

/**
 * Static method to find payments by invoice
 * @param invoiceId - Invoice ID
 * @returns Array of payment documents
 */
paymentSchema.statics.findByInvoice = function (invoiceId: mongoose.Types.ObjectId) {
  return this.find({ invoice: invoiceId })
    .populate('invoice')
    .populate('createdBy', 'firstName lastName email')
    .sort({ paymentDate: -1 });
};

/**
 * Static method to find payments by status
 * @param status - Payment status
 * @returns Array of payment documents
 */
paymentSchema.statics.findByStatus = function (status: PaymentTransactionStatus) {
  return this.find({ status })
    .populate('invoice')
    .populate('createdBy', 'firstName lastName email')
    .sort({ paymentDate: -1 });
};

/**
 * Static method to find payments by date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of payment documents
 */
paymentSchema.statics.findByDateRange = function (startDate: Date, endDate: Date) {
  return this.find({
    paymentDate: { $gte: startDate, $lte: endDate },
  })
    .populate('invoice')
    .populate('createdBy', 'firstName lastName email')
    .sort({ paymentDate: -1 });
};

/**
 * Static method to get payment summary for a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Aggregated payment summary
 */
paymentSchema.statics.getPaymentSummary = function (startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        paymentDate: { $gte: startDate, $lte: endDate },
        status: PaymentTransactionStatus.COMPLETED,
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        paymentCount: { $sum: 1 },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ]);
};

/**
 * Static method to find payments by transaction ID
 * @param transactionId - Transaction ID
 * @returns Payment document
 */
paymentSchema.statics.findByTransactionId = function (transactionId: string) {
  return this.findOne({ transactionId })
    .populate('invoice')
    .populate('createdBy', 'firstName lastName email');
};

/**
 * Instance method to mark payment as completed
 * @returns Updated payment
 */
paymentSchema.methods.markAsCompleted = async function () {
  if (this.status === PaymentTransactionStatus.COMPLETED) {
    throw new Error('Payment is already completed');
  }

  if (this.status === PaymentTransactionStatus.FAILED) {
    throw new Error('Failed payments cannot be marked as completed');
  }

  this.status = PaymentTransactionStatus.COMPLETED;
  return await this.save();
};

/**
 * Instance method to mark payment as failed
 * @returns Updated payment
 */
paymentSchema.methods.markAsFailed = async function () {
  if (this.status === PaymentTransactionStatus.COMPLETED) {
    throw new Error('Completed payments cannot be marked as failed');
  }

  this.status = PaymentTransactionStatus.FAILED;
  return await this.save();
};

/**
 * Instance method to get invoice details
 * @returns Invoice document
 */
paymentSchema.methods.getInvoiceDetails = async function () {
  const Invoice = mongoose.model('Invoice');
  return await Invoice.findById(this.invoice).populate('customer');
};

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
