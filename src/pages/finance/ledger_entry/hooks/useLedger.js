import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";

/* ── All Suppliers Summary ───────────────────────────────────────────────── */
const fetchLedgerSummary = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/ledger/summary", { params });
  return data?.data || [];
};

export const useLedgerSummary = (params = {}) =>
  useQuery({
    queryKey: ["ledger-summary", params],
    queryFn:  fetchLedgerSummary,
    staleTime: 30 * 1000,
  });

/* ── Supplier Balance (single figure) ───────────────────────────────────── */
const fetchSupplierBalance = async ({ queryKey }) => {
  const [, supplierId, params] = queryKey;
  const { data } = await api.get(`/ledger/balance/${supplierId}`, { params });
  return data?.data || null;
};

export const useSupplierBalance = (supplierId, params = {}) =>
  useQuery({
    queryKey: ["ledger-balance", supplierId, params],
    queryFn:  fetchSupplierBalance,
    enabled:  !!supplierId,
    staleTime: 30 * 1000,
  });

/* ── Supplier Ledger (full register) ────────────────────────────────────── */
const fetchSupplierLedger = async ({ queryKey }) => {
  const [, supplierId, params] = queryKey;
  const { data } = await api.get(`/ledger/supplier/${supplierId}`, { params });
  return data?.data || [];
};

export const useSupplierLedger = (supplierId, params = {}) =>
  useQuery({
    queryKey: ["ledger-supplier", supplierId, params],
    queryFn:  fetchSupplierLedger,
    enabled:  !!supplierId,
    staleTime: 30 * 1000,
  });

/* ── Supplier Statement (by voucher type) ────────────────────────────────── */
const fetchSupplierStatement = async ({ queryKey }) => {
  const [, supplierId, params] = queryKey;
  const { data } = await api.get(`/ledger/statement/${supplierId}`, { params });
  return data?.data || null;
};

export const useSupplierStatement = (supplierId, params = {}) =>
  useQuery({
    queryKey: ["ledger-statement", supplierId, params],
    queryFn:  fetchSupplierStatement,
    enabled:  !!supplierId,
    staleTime: 30 * 1000,
  });

/* ── Tender Balance ──────────────────────────────────────────────────────── */
const fetchTenderBalance = async ({ queryKey }) => {
  const [, tenderId, params] = queryKey;
  const { data } = await api.get(`/ledger/tender-balance/${tenderId}`, { params });
  return data?.data || null;
};

export const useTenderBalance = (tenderId, params = {}) =>
  useQuery({
    queryKey: ["ledger-tender-balance", tenderId, params],
    queryFn:  fetchTenderBalance,
    enabled:  !!tenderId,
    staleTime: 30 * 1000,
  });

/* ── Tender Ledger (grouped by supplier) ────────────────────────────────── */
const fetchTenderLedger = async ({ queryKey }) => {
  const [, tenderId, params] = queryKey;
  const { data } = await api.get(`/ledger/tender/${tenderId}`, { params });
  return data?.data || [];
};

export const useTenderLedger = (tenderId, params = {}) =>
  useQuery({
    queryKey: ["ledger-tender", tenderId, params],
    queryFn:  fetchTenderLedger,
    enabled:  !!tenderId,
    staleTime: 30 * 1000,
  });
