import { useQuery } from "@tanstack/react-query";
import { Book, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Story } from "@shared/schema";

export function RecentStories() {
  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3 p-3 animate-pulse">
                <div className="w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentStories = stories.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Downloads</CardTitle>
      </CardHeader>
      <CardContent>
        {recentStories.length === 0 ? (
          <div className="text-center py-8">
            <Book className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No stories downloaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentStories.map((story) => (
              <div
                key={story.id}
                className="flex space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors story-card"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-16 bg-gradient-to-br from-primary/40 to-primary/60 rounded flex items-center justify-center text-white">
                    <Book className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {story.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {story.author}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap">
                    {story.fandom && Array.isArray(story.fandom) ? (
                      story.fandom.slice(0, 2).map((fandom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {fandom}
                        </Badge>
                      ))
                    ) : story.fandom && (
                      <Badge variant="secondary" className="text-xs">
                        {story.fandom}
                      </Badge>
                    )}
                    {story.fandom && Array.isArray(story.fandom) && story.fandom.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{story.fandom.length - 2} more
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {story.chapters && `${story.chapters} chapter${story.chapters > 1 ? 's' : ''}`}
                      {story.chapters && story.words && ' • '}
                      {story.words ? `${story.words.toLocaleString()} words` : story.chapters ? '' : 'Unknown length'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-gray-400 hover:text-primary"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
