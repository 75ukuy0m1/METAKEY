import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Download, InsertDownload, DownloadOptions } from "@shared/schema";

export function useDownloads() {
  return useQuery<Download[]>({
    queryKey: ["/api/downloads"],
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { storyId: string; options: DownloadOptions }) => {
      const downloadData: InsertDownload = {
        storyId: data.storyId,
        status: "pending",
        format: data.options.format,
        progress: 0,
        totalChapters: 0,
        options: data.options,
        filePath: null,
        fileSize: null,
        error: null,
      };
      
      const response = await apiRequest("POST", "/api/downloads", downloadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
  });
}

export function useUpdateDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Download> }) => {
      const response = await apiRequest("PATCH", `/api/downloads/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/downloads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
  });
}
