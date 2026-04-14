import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

export const usePurchaseOrders = (queryParams = {}) => {
  return useQuery({
    queryKey: ["purchase-orders", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/purchaseorderrequest/api/getbyIdQuotationApproved`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          fromdate: queryParams.fromdate,
          todate: queryParams.todate,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};
