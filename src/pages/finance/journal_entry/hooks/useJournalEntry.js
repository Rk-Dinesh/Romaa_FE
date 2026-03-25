import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Approve Journal Entry ──────────────────────────────────────────────── */
export const useApproveJE = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/journalentry/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Journal entry approved");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve journal entry"),
  });
};
