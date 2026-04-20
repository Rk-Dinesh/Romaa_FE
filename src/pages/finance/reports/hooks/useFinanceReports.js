import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";

/* ── 1. Trial Balance ─────────────────────────────────────────────────────── */
const fetchTrialBalance = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/trial-balance", { params });
  return data?.data;
};
export const useTrialBalance = (params = {}) =>
  useQuery({ queryKey: ["trial-balance", params], queryFn: fetchTrialBalance, staleTime: 60_000 });

/* ── 2. Profit & Loss ─────────────────────────────────────────────────────── */
const fetchProfitLoss = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/profit-loss", { params });
  return data?.data;
};
export const useProfitLoss = (params = {}) =>
  useQuery({ queryKey: ["profit-loss", params], queryFn: fetchProfitLoss, staleTime: 60_000 });

/* ── 3. Balance Sheet ─────────────────────────────────────────────────────── */
const fetchBalanceSheet = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/balance-sheet", { params });
  return data?.data;
};
export const useBalanceSheet = (params = {}) =>
  useQuery({ queryKey: ["balance-sheet", params], queryFn: fetchBalanceSheet, staleTime: 60_000 });

/* ── 4. General Ledger ────────────────────────────────────────────────────── */
const fetchGeneralLedger = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/general-ledger", { params });
  return data?.data;
};
export const useGeneralLedger = (params = {}) =>
  useQuery({
    queryKey: ["general-ledger", params],
    queryFn: fetchGeneralLedger,
    enabled: !!params.account_code,
    staleTime: 60_000,
  });

/* ── 5. Cash Flow ─────────────────────────────────────────────────────────── */
const fetchCashFlow = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/cash-flow", { params });
  return data?.data;
};
export const useCashFlow = (params = {}) =>
  useQuery({ queryKey: ["cash-flow", params], queryFn: fetchCashFlow, staleTime: 60_000 });

/* ── 6. GSTR-1 ────────────────────────────────────────────────────────────── */
const fetchGSTR1 = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/gstr-1", { params });
  return data?.data;
};
export const useGSTR1 = (params = {}) =>
  useQuery({ queryKey: ["gstr-1", params], queryFn: fetchGSTR1, staleTime: 60_000 });

/* ── 7. GSTR-2B ───────────────────────────────────────────────────────────── */
const fetchGSTR2B = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/gstr-2b", { params });
  return data?.data;
};
export const useGSTR2B = (params = {}) =>
  useQuery({ queryKey: ["gstr-2b", params], queryFn: fetchGSTR2B, staleTime: 60_000 });

/* ── 8. GSTR-3B ───────────────────────────────────────────────────────────── */
const fetchGSTR3B = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/gstr-3b", { params });
  return data?.data;
};
export const useGSTR3B = (params = {}) =>
  useQuery({ queryKey: ["gstr-3b", params], queryFn: fetchGSTR3B, staleTime: 60_000 });

/* ── 9. ITC Reversal Register ─────────────────────────────────────────────── */
const fetchITCReversal = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/itc-reversal", { params });
  return data?.data;
};
export const useITCReversal = (params = {}) =>
  useQuery({ queryKey: ["itc-reversal", params], queryFn: fetchITCReversal, staleTime: 60_000 });

/* ── 10. TDS Register ─────────────────────────────────────────────────────── */
const fetchTDSRegister = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/tds-register", { params });
  return data?.data;
};
export const useTDSRegister = (params = {}) =>
  useQuery({ queryKey: ["tds-register", params], queryFn: fetchTDSRegister, staleTime: 60_000 });

/* ── 11. AR Aging ─────────────────────────────────────────────────────────── */
const fetchARAgingReport = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/ar-aging", { params });
  return data?.data;
};
export const useARAgingReport = (params = {}) =>
  useQuery({ queryKey: ["ar-aging", params], queryFn: fetchARAgingReport, staleTime: 60_000 });

/* ── 12. AP Aging ─────────────────────────────────────────────────────────── */
const fetchAPAgingReport = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/ap-aging", { params });
  return data?.data;
};
export const useAPAgingReport = (params = {}) =>
  useQuery({ queryKey: ["ap-aging", params], queryFn: fetchAPAgingReport, staleTime: 60_000 });

/* ── 13. Form 26Q ─────────────────────────────────────────────────────────── */
const fetchForm26Q = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/reports/form-26q", { params });
  return data?.data;
};
export const useForm26Q = (params = {}) =>
  useQuery({
    queryKey: ["form-26q", params],
    queryFn: fetchForm26Q,
    enabled: !!params.financial_year && !!params.quarter,
    staleTime: 60_000,
  });
