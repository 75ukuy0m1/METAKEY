import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { UrlInput } from "@/components/url-input";
import { StoryPreview } from "@/components/story-preview";
import { DownloadQueue } from "@/components/download-queue";
import { RecentStories } from "@/components/recent-stories";
import { SettingsModal } from "@/components/settings-modal";
import type { Story, Settings as SettingsType } from "@shared/schema";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: settings } = useQuery<SettingsType>({
    queryKey: ["/api/settings"],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* App Bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">METAKEY</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* URL Input */}
        <section className="p-4">
          <UrlInput onStoryAnalyzed={setSelectedStory} />
        </section>

        {/* Story Preview */}
        {selectedStory && (
          <section className="px-4 pb-4">
            <StoryPreview story={selectedStory} />
          </section>
        )}

        {/* Download Queue */}
        <section className="px-4 pb-4">
          <DownloadQueue />
        </section>

        {/* Recent Stories */}
        <section className="px-4 pb-6">
          <RecentStories />
        </section>
      </main>
      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
      />
    </div>
  );
}
