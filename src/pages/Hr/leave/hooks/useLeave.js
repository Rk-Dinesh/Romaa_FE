import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// HR: Get all pending leaves company-wide
export const useAllPendingLeaves = (params = {}) => {
  return useQuery({
    queryKey: ["hr-leaves", params],
    queryFn: async () => {
      const { data } = await api.get("/leave/all-pending", { params });
      return data;
    },
    staleTime: 30 * 1000,
  });
};

// HR: Action on a leave (approve/reject)
export const useLeaveAction = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/leave/action", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Leave ${variables.action === "Approve" ? "approved" : "rejected"}!`);
      queryClient.invalidateQueries(["hr-leaves"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Action failed");
    },
  });
};

// Holiday CRUD
export const useAddHoliday = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/calendar/add", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Holiday added!");
      queryClient.invalidateQueries(["holidays"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add holiday");
    },
  });
};

export const useUpdateHoliday = ({ id, onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/calendar/update/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Holiday updated!");
      queryClient.invalidateQueries(["holidays"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update holiday");
    },
  });
};

export const useDeleteHoliday = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/calendar/delete/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Holiday deleted!");
      queryClient.invalidateQueries(["holidays"]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete holiday");
    },
  });
};
