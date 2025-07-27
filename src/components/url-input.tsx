import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StoryParser } from "@/lib/story-parser";
import type { Story } from "@shared/schema";

interface UrlInputProps {
  onStoryAnalyzed: (story: Story) => void;
}

export function UrlInput({ onStoryAnalyzed }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [validationState, setValidationState] = useState<"idle" | "valid" | "invalid">("idle");
  const { toast } = useToast();

  const analyzeStoryMutation = useMutation({
    mutationFn: (url: string) => StoryParser.analyzeUrl(url),
    onSuccess: (story) => {
      // Add required fields for Story type
      const completeStory: Story = {
        id: Date.now().toString(),
        createdAt: new Date(),
        ...story,
        fandom: story.fandom || null,
        summary: story.summary || null,
        status: story.status || null,
        rating: story.rating || null,
        chapters: story.chapters || null,
        words: story.words || null,
        language: story.language || null,
        published: story.published || null,
        updated: story.updated || null,
        metadata: story.metadata || null,
      };
      onStoryAnalyzed(completeStory);
      toast({
        title: "Story analyzed successfully!",
        description: `Found "${story.title}" by ${story.author}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUrlChange = (value: string) => {
    setUrl(value);
    
    if (!value.trim()) {
      setValidationState("idle");
      return;
    }

    if (StoryParser.isValidStoryUrl(value)) {
      setValidationState("valid");
    } else {
      setValidationState("invalid");
    }
  };

  const handleAnalyze = () => {
    if (!url.trim() || validationState !== "valid") return;
    analyzeStoryMutation.mutate(url);
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case "valid":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "invalid":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const supportedSites = [
    "Archive of Our Own",
    "FanFiction.Net",
    "FictionPress",
    "FIMFiction",
    "Wattpad"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add Story
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="story-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Story URL
            </Label>
            <div className="relative mt-2">
              <Input
                id="story-url"
                type="url"
                placeholder="Paste story URL from AO3, FFN, FictionPress, FIMFiction, or Wattpad..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {analyzeStoryMutation.isPending ? (
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  getValidationIcon()
                )}
              </div>
            </div>
          </div>

          {/* Supported Sites */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Supported sites:</span>
            <div className="flex flex-wrap gap-1">
              {supportedSites.map((site) => (
                <Badge key={site} variant="secondary" className="text-xs">
                  {site}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={validationState !== "valid" || analyzeStoryMutation.isPending}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {analyzeStoryMutation.isPending ? "Analyzing..." : "Analyze Story"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
