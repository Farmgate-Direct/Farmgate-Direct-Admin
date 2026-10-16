// Admin wallet actions.
import { auth } from "../FirebaseConfig";
import type {
  AdminPayoutAccountType,
  AdminWalletOverview,
  AdminWalletType,
  AdminWithdrawalType,
  WalletTransaction,
} from "../types/wallet";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const REQUEST_TIMEOUT = 30000;
const WITHDRAW_TIMEOUT = 60000;

const MAX_NAME_LEN = 100;
const MAX_AMOUNT = 10000000;

const cleanName = (v: unknown) => String(v ?? "").trim();

const checkName = (name: string) => {
  if (name.length < 3 || name.length > MAX_NAME_LEN) {
    throw new Error("Enter the GCash account name.");
  }
};

const cleanNumber = (v: unknown) => {
  const raw = String(v ?? "").trim();
  if (raw === "") return "";
  const digits = raw.replace(/\D/g, "");
  let norm = digits;
  if (/^639\d{9}$/.test(digits)) norm = `0${digits.slice(2)}`;
  if (!/^09\d{9}$/.test(norm)) {
    throw new Error("Use a valid 11-digit GCash number such as 09171234567.");
  }
  return norm;
};

const checkAmount = (amount: number | undefined) => {
  if (amount === undefined) return undefined;
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new Error("Enter a valid withdrawal amount.");
  }
  return Math.round(amount * 100) / 100;
};

const authedFetch = async (
  path: string,
  options: RequestInit = {},
  timeout = REQUEST_TIMEOUT,
  retryOnTimeout = true,
) => {
  if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL is not configured.");
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");
  // One token per overview call.
  const token = await user.getIdToken();

  const attempt = async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(`${BACKEND_URL}/wallet${path}`, {
        ...options,
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        const err: any = new Error(
          data.error || `Request failed (${res.status}).`,
        );
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (e: any) {
      if (e?.name === "AbortError") {
        const err: any = new Error(
          "The server is waking up (cold start). Please wait a moment.",
        );
        err.name = "AbortError";
        throw err;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt();
  } catch (e: any) {
    // One auto-retry covers the Render cold-start window.
    if (retryOnTimeout && e?.name === "AbortError") {
      await new Promise((r) => setTimeout(r, 2000));
      return await attempt();
    }
    throw e;
  }
};

// One request for wallet + payout + history.
// Falls back to 3 requests when the server has no overview route yet.
const fetchOverview = async (): Promise<AdminWalletOverview> => {
  try {
    const data = await authedFetch("/admin/overview");
    return {
      wallet: data.wallet as AdminWalletType,
      payoutAccount: (data.payoutAccount || null) as AdminPayoutAccountType | null,
      transactions: (Array.isArray(data.transactions)
        ? data.transactions
        : []) as WalletTransaction[],
      withdrawableAmount: Number(data.withdrawableAmount || 0),
      minimumWithdrawal: Number(data.minimumWithdrawal || 1),
    };
  } catch (e: any) {
    if (e?.status !== 404) throw e;

    console.log(
      "Admin overview route missing on server, using legacy wallet calls.",
    );
    const [w, txs, pa] = await Promise.all([
      authedFetch("/admin/wallet", {}, REQUEST_TIMEOUT, false),
      authedFetch("/admin/transactions", {}, REQUEST_TIMEOUT, false),
      authedFetch("/admin/payout-account", {}, REQUEST_TIMEOUT, false),
    ]);
    return {
      wallet: w.wallet as AdminWalletType,
      payoutAccount: (pa.payoutAccount || null) as AdminPayoutAccountType | null,
      transactions: (Array.isArray(txs.transactions)
        ? txs.transactions
        : []) as WalletTransaction[],
      withdrawableAmount: Number(w.withdrawableAmount || 0),
      minimumWithdrawal: Number(w.minimumWithdrawal || 1),
    };
  }
};

// Shared loader: parallel calls reuse one in-flight request, and results
// are cached briefly so refocus is instant.
const OVERVIEW_CACHE_MS = 8000;
let cachedOverview: AdminWalletOverview | null = null;
let cachedAt = 0;
let inflightOverview: Promise<AdminWalletOverview> | null = null;

const loadSharedOverview = (): Promise<AdminWalletOverview> => {
  if (cachedOverview && Date.now() - cachedAt < OVERVIEW_CACHE_MS) {
    return Promise.resolve(cachedOverview);
  }
  if (!inflightOverview) {
    inflightOverview = fetchOverview().then((overview) => {
      cachedOverview = overview;
      cachedAt = Date.now();
      inflightOverview = null;
      return overview;
    }).catch((e) => {
      inflightOverview = null;
      throw e;
    });
  }
  return inflightOverview;
};

// Clear cache after writes so the next read is fresh.
const invalidateCache = () => {
  cachedOverview = null;
  cachedAt = 0;
};

// Get admin wallet balance.
export const getAdminWallet = async (): Promise<{
  wallet: AdminWalletType;
  withdrawableAmount: number;
  minimumWithdrawal: number;
}> => {
  const overview = await loadSharedOverview();
  return {
    wallet: overview.wallet,
    withdrawableAmount: overview.withdrawableAmount,
    minimumWithdrawal: overview.minimumWithdrawal,
  };
};

// Get admin wallet transactions.
export const getAdminTransactions = async (): Promise<WalletTransaction[]> => {
  const overview = await loadSharedOverview();
  return overview.transactions;
};

// Get admin payout account.
export const getAdminPayoutAccount = async (): Promise<AdminPayoutAccountType | null> => {
  const overview = await loadSharedOverview();
  return overview.payoutAccount;
};

export const saveAdminPayoutAccount = async (input: {
  accountName: string;
  accountNumber: string;
}): Promise<AdminPayoutAccountType> => {
  const accountName = cleanName(input?.accountName);
  checkName(accountName);
  const accountNumber = cleanNumber(input?.accountNumber);
  const data = await authedFetch("/admin/payout-account", {
    method: "PUT",
    body: JSON.stringify({ accountName, accountNumber }),
  });
  invalidateCache();
  return data.payoutAccount as AdminPayoutAccountType;
};

export const requestAdminWithdrawal = async (amount?: number): Promise<{
  withdrawal: AdminWithdrawalType;
  withdrawableAmount: number;
}> => {
  const clean = amount === undefined || amount === null || String(amount).trim() === ""
    ? undefined
    : checkAmount(Number(amount));
  const data = await authedFetch(
    "/admin/withdraw",
    {
      method: "POST",
      body: JSON.stringify(clean === undefined ? {} : { amount: clean }),
    },
    WITHDRAW_TIMEOUT,
  );
  invalidateCache();
  return {
    withdrawal: data.withdrawal as AdminWithdrawalType,
    withdrawableAmount: Number(data.withdrawableAmount || 0),
  };
};

