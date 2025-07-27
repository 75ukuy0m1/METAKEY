import { useState } from "react";
import { Book, Download, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { useCreateDownload } from "@/hooks/use-downloads";
import { useToast } from "@/hooks/use-toast";
import type { Story, Settings, DownloadOptions } from "@shared/schema";

interface StoryPreviewProps {
  story: Story;
}

export function StoryPreview({ story }: StoryPreviewProps) {
  const [format, setFormat] = useState<DownloadOptions["format"]>("epub");
  const [includeReviews, setIncludeReviews] = useState(false);
  const [generateCover, setGenerateCover] = useState(true);
  const { toast } = useToast();

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const createDownloadMutation = useCreateDownload();

  const handleDownload = () => {
    const options: DownloadOptions = {
      format,
      includeReviews,
      generateCover,
    };

    createDownloadMutation.mutate(
      { storyId: story.id, options },
      {
        onSuccess: () => {
          toast({
            title: "Download started!",
            description: `${story.title} has been added to the download queue.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Download failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const formatOptions = [
    { value: "epub", label: "ePub", icon: "📚" },
    { value: "pdf", label: "PDF", icon: "📄" },
    { value: "txt", label: "TXT", icon: "📝" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "markdown", label: "Markdown", icon: "📋" },
  ] as const;

  return (
    <Card className="fade-in">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Story Cover Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-24 h-32 bg-gradient-to-br from-primary/40 to-primary/60 rounded-lg flex items-center justify-center text-white">
              <Book className="w-8 h-8" />
            </div>
          </div>
          
          {/* Story Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {story.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              by {story.author}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {story.fandom && Array.isArray(story.fandom) ? (
                story.fandom.map((fandom, index) => (
                  <Badge key={index} variant="secondary">{fandom}</Badge>
                ))
              ) : story.fandom && (
                <Badge variant="secondary">{story.fandom}</Badge>
              )}
              {story.status && (
                <Badge variant={story.status === "Complete" ? "default" : "outline"}>
                  {story.status}
                </Badge>
              )}
              {story.rating && (
                <Badge variant="outline">{story.rating}</Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center space-x-4">
                {story.chapters && <span>{story.chapters} chapter{story.chapters > 1 ? 's' : ''}</span>}
                {story.words && <span>{story.words.toLocaleString()} words</span>}
                {story.language && <span>{story.language}</span>}
              </div>
              {story.updated && (
                <div>Updated: {new Date(story.updated).toLocaleDateString()}</div>
              )}
              {story.published && (
                <div>Published: {new Date(story.published).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
        
        {story.summary && (
          <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="whitespace-pre-wrap">{story.summary}</div>
          </div>
        )}
      </CardContent>
      
      {/* Download Options */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Download Options</h4>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Export Format
            </Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as DownloadOptions["format"])}
              className="grid grid-cols-3 gap-2"
            >
              {formatOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:border-primary/50 transition-colors text-center ${
                      format === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-lg mb-1">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Advanced Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-reviews"
                checked={includeReviews}
                onCheckedChange={(checked) => setIncludeReviews(checked as boolean)}
              />
              <Label htmlFor="include-reviews" className="text-sm text-gray-700 dark:text-gray-300">
                Include reviews
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generate-cover"
                checked={generateCover}
                onCheckedChange={(checked) => setGenerateCover(checked as boolean)}
              />
              <Label htmlFor="generate-cover" className="text-sm text-gray-700 dark:text-gray-300">
                Generate cover
              </Label>
            </div>
          </div>
          
          <Button
            onClick={handleDownload}
            disabled={createDownloadMutation.isPending}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {createDownloadMutation.isPending ? "Starting Download..." : "Start Download"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
