// Shared platform wallet (single admin wallet for all commissions).

export type AdminWalletType = {
  availableBalance: number;
  totalCommissionEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  updatedAt?: any;
};

export type AdminPayoutAccountType = {
  accountName: string;
  postalCode?: string;
  city?: string;
  province?: string;
  street?: string;
  accountNumberMasked: string;
  status: string;
  createdAt?: any;
  updatedAt?: any;
};

export type AdminWithdrawalStatus =
  | "pending"
  | "pending_review"
  | "pending_compliance"
  | "processing"
  | "succeeded"
  | "completed"
  | "failed"
  | "rejected"
  | "reversed";

export type AdminWithdrawalType = {
  id: string;
  amount: number;
  accountNumberMasked: string;
  status: AdminWithdrawalStatus;
  xenditReferenceId?: string;
  xenditPayoutId?: string;
  failureReason?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type WalletTransaction = {
  id: string;
  farmerId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  reference?: string;
  withdrawalId?: string;
  orderNumber?: string;
  orderId?: string;
  description?: string;
  createdAt?: any;
};

export type AdminWalletOverview = {
  wallet: AdminWalletType;
  payoutAccount: AdminPayoutAccountType | null;
  transactions: WalletTransaction[];
  withdrawableAmount: number;
  minimumWithdrawal: number;
};
