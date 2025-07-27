import { useQuery } from "@tanstack/react-query";
import { Book, X, ExternalLink, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDeleteDownload } from "@/hooks/use-downloads";
import { useToast } from "@/hooks/use-toast";
import type { Download, Story } from "@shared/schema";

interface DownloadWithStory extends Download {
  story?: Story;
}

export function DownloadQueue() {
  const { data: downloads = [], isLoading } = useQuery<Download[]>({
    queryKey: ["/api/downloads"],
    refetchInterval: 2000, // Poll for updates
  });

  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  // Join downloads with story data
  const downloadsWithStories: DownloadWithStory[] = downloads.map(download => ({
    ...download,
    story: stories.find(story => story.id === download.storyId)
  }));

  const deleteDownloadMutation = useDeleteDownload();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteDownloadMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Download removed",
          description: "The download has been removed from the queue.",
        });
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500";
      case "downloading":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "downloading":
        return <Book className="w-5 h-5 text-white" />;
      case "error":
        return <X className="w-5 h-5 text-white" />;
      default:
        return <Book className="w-5 h-5 text-white" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Download Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading downloads...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (downloadsWithStories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Download Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Book className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No downloads in queue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {downloadsWithStories.map((download, index) => (
          <div
            key={download.id}
            className={`p-4 ${index !== downloadsWithStories.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-12 h-16 ${getStatusColor(download.status)} rounded flex items-center justify-center`}>
                  {getStatusIcon(download.status)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {download.story?.title || `Download #${download.id.slice(0, 8)}`}
                </h4>
                {download.story?.author && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {download.story.author}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {download.format.toUpperCase()}
                  </Badge>
                  <Badge variant={download.status === "complete" ? "default" : "secondary"} className="text-xs">
                    {download.status}
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                {download.status === "downloading" && download.totalChapters && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Downloading chapters...</span>
                      <span>{download.progress}/{download.totalChapters} chapters</span>
                    </div>
                    <Progress 
                      value={((download.progress || 0) / (download.totalChapters || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {download.status === "complete" && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                    Download complete
                    {download.fileSize && (
                      <span className="text-gray-500 ml-2">
                        ({(download.fileSize / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    )}
                  </p>
                )}

                {download.status === "error" && download.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Error: {download.error}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 flex space-x-2">
                {download.status === "complete" && download.filePath && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary/80"
                    title="Open file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(download.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
