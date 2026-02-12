import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// The actual fetch function
const fetchTenders = async ({ queryKey }) => {
  const [_, params] = queryKey;

  const { data } = await api.get("/tender/gettenders", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });

  return data; // Expecting { data: [...], totalPages: N }
};

export const useTenders = (queryParams) => {
  return useQuery({
    // Unique Cache Key: If any param changes, it refetches automatically
    queryKey: ["tenders", queryParams],
    queryFn: fetchTenders,

    // UI Optimizations
    placeholderData: keepPreviousData, // Keeps old list visible while loading new page
    retry: 1, // Retry failed requests once
  });
};

const addTenderApi = async (tenderData) => {
  const { data } = await api.post("/tender/addtender", tenderData);
  return data;
};

export const useAddTender = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTenderApi,
    onSuccess: () => {
      toast.success("Tender created successfully ✅");
      // 1. Refetch the Tender List immediately
      queryClient.invalidateQueries(["tenders"]);
      // 2. Call parent callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create tender");
    },
  });
};

const updateTenderApi = async ({ id, data }) => {
  const response = await api.put(`/tender/updatetender/${id}`, data);
  return response.data;
};

export const useEditTender = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenderApi,
    onSuccess: () => {
      toast.success("Tender updated successfully ✅");
      // 1. Invalidate list to trigger auto-refresh
      queryClient.invalidateQueries(["tenders"]);
      // 2. Call callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update tender");
    },
  });
};

const fetchEMDList = async ({ queryKey }) => {
  const [_, params] = queryKey;
  
  const { data } = await api.get("/tender/gettendersemdsd", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  
  return data; // Expecting { data: [...], totalPages: N }
};

export const useEMD = (queryParams) => {
  return useQuery({
    queryKey: ["emd-list", queryParams], // Unique cache key
    queryFn: fetchEMDList,
    placeholderData: keepPreviousData, // Smooth pagination
    staleTime: 60 * 1000, // 1 minute cache
  });
};

const updateEMDApi = async ({ tenderId, data }) => {
  const response = await api.post(`/tender/updateemdamount/${tenderId}`, data);
  return response.data;
};

export const useEditEMD = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEMDApi,
    onSuccess: () => {
      toast.success("Updated successfully ✅");
      // 1. Refresh the EMD list automatically
      queryClient.invalidateQueries(["emd-list"]);
      // 2. Call callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update EMD ❌");
    },
  });
};

const fetchEMDTrackingApi = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;
  const { data } = await api.get(`/tender/emdtracking/${tenderId}`);
  // Return the specific array from the response
  return data.emdTracking || []; 
};

export const useEMDTracking = (tenderId) => {
  return useQuery({
    queryKey: ["emd-tracking", tenderId], // Unique cache key per tender
    queryFn: fetchEMDTrackingApi,
    enabled: !!tenderId, // Only fetch if we have a valid ID
    staleTime: 5 * 60 * 1000, // Cache this data for 5 minutes
  });
};

const fetchDepositList = async ({ queryKey }) => {
  const [_, params] = queryKey;
  
  const { data } = await api.get("/tender/gettendersemdsd", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  
  return data;
};

export const useSecurityDeposit = (queryParams) => {
  return useQuery({
    queryKey: ["security-deposit-list", queryParams], // Unique key for this module
    queryFn: fetchDepositList,
    placeholderData: keepPreviousData, // Prevents table flicker
    staleTime: 60 * 1000, // 1 minute cache
  });
};

const updateDepositApi = async ({ tenderId, data }) => {
  const response = await api.post(`/tender/securitydepositamount/${tenderId}`, data);
  return response.data;
};

export const useEditSecurityDeposit = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDepositApi,
    onSuccess: () => {
      toast.success("Updated successfully ✅");
      // 1. Refresh the Security Deposit list automatically
      queryClient.invalidateQueries(["security-deposit-list"]);
      // 2. Call callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update Security Deposit ❌");
    },
  });
};

const fetchSDTrackingApi = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;
  const { data } = await api.get(`/tender/securitydeposittracking/${tenderId}`);
  // Return the specific array from the response
  return data.securityDepositTracking || []; 
};

export const useSecurityDepositTracking = (tenderId) => {
  return useQuery({
    queryKey: ["sd-tracking", tenderId], // Unique cache key
    queryFn: fetchSDTrackingApi,
    enabled: !!tenderId, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

const fetchPenaltyList = async ({ queryKey }) => {
  const [_, params] = queryKey;
  
  const { data } = await api.get("/tender/gettendersworkorder", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  
  return data; // Expecting { data: [...], totalPages: N }
};

export const useProjectPenalty = (queryParams) => {
  return useQuery({
    queryKey: ["project-penalty", queryParams], // Unique cache key
    queryFn: fetchPenaltyList,
    placeholderData: keepPreviousData, // Smooth pagination
    staleTime: 60 * 1000, // 1 minute cache
  });
};