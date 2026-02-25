import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../services/api";


// ==========================================
// 1. Fetch ALL Projects (For Dropdowns, etc.)
// ==========================================
const fetchAllProjects = async () => {
  const { data } = await api.get("/tender/all");
  return data?.data || []; // Ensure it always returns an array
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ["all-projects"], // Unique key for caching
    queryFn: fetchAllProjects,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });
};

// ==========================================
// 2. Fetch PAGINATED Projects (For Tables)
// ==========================================
const fetchProjects = async ({ queryKey }) => {
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

  return data;
};

export const useProjects = (queryParams) => {
  return useQuery({
    queryKey: ["projects", queryParams],
    queryFn: fetchProjects,
    placeholderData: keepPreviousData, // Keeps table stable while loading next page
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};