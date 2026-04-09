import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// Monthly report for all employees (HR view)
export const useMonthlyAttendanceReport = ({ month, year }) => {
  return useQuery({
    queryKey: ["attendance-monthly", month, year],
    queryFn: async () => {
      const { data } = await api.get("/attendance/get-monthly-report", {
        params: { month, year },
      });
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!month && !!year,
  });
};

// Daily report for all employees (HR view)
export const useDailyAttendanceReport = (date) => {
  return useQuery({
    queryKey: ["attendance-daily", date],
    queryFn: async () => {
      const { data } = await api.get("/attendance/get-daily-report", {
        params: { date },
      });
      return data;
    },
    staleTime: 60 * 1000,
    enabled: !!date,
  });
};

// Regularization requests for HR
export const useRegularizationRequests = (queryParams = {}) => {
  return useQuery({
    queryKey: ["regularizations", queryParams],
    queryFn: async () => {
      const { data } = await api.get("/attendance/regularization-list", {
        params: queryParams,
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// Apply regularization (employee)
export const useApplyRegularization = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/attendance/apply-regularization", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Regularization request submitted!");
      queryClient.invalidateQueries(["regularizations"]);
      queryClient.invalidateQueries(["attendance-monthly"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit regularization");
    },
  });
};

// Action on regularization (HR/Manager)
export const useActionRegularization = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/attendance/action-regularization", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Regularization ${variables.action === "Approved" ? "approved" : "rejected"}!`);
      queryClient.invalidateQueries(["regularizations"]);
      queryClient.invalidateQueries(["attendance-monthly"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to process regularization");
    },
  });
};
