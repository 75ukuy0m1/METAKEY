import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, FileImage } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@shared/schema";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: Settings;
}

export function SettingsModal({ open, onOpenChange, settings }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    defaultFormat: "epub",
    filenameTemplate: "{author} - {title}",
    includeReviews: false,
    generateCovers: true,
    downloadDelay: 2,
    theme: "light",
    fontStyle: "sans-serif",
    fontSize: "Regular",
    customCoverImage: "",
    punctuationStyle: "Clean (automatic smart quotes)",
    paragraphStyle: "Space + Indent",
    justifyText: false,
    storyStatusOverride: "Auto (set by author)",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setFormData({
        defaultFormat: settings.defaultFormat || "epub",
        filenameTemplate: settings.filenameTemplate || "{author} - {title}",
        includeReviews: settings.includeReviews || false,
        generateCovers: settings.generateCovers || true,
        downloadDelay: settings.downloadDelay || 2,
        theme: settings.theme || "light",
        fontStyle: settings.fontStyle || "sans-serif",
        fontSize: settings.fontSize || "Regular",
        customCoverImage: settings.customCoverImage || "",
        punctuationStyle: settings.punctuationStyle || "Clean (automatic smart quotes)",
        paragraphStyle: settings.paragraphStyle || "Space + Indent",
        justifyText: settings.justifyText || false,
        storyStatusOverride: settings.storyStatusOverride || "Auto (set by author)",
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await apiRequest("PATCH", "/api/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const formatOptions = [
    { value: "epub", label: "ePub" },
    { value: "pdf", label: "PDF" },
    { value: "txt", label: "Plain Text" },
    { value: "html", label: "HTML" },
    { value: "markdown", label: "Markdown" },
  ];

  const fontStyleOptions = [
    { value: "serif", label: "Serif" },
    { value: "sans-serif", label: "Sans-serif" },
  ];

  const fontSizeOptions = [
    { value: "Unreadable", label: "Unreadable" },
    { value: "Tiny", label: "Tiny" },
    { value: "Extra Small", label: "Extra Small" },
    { value: "Small", label: "Small" },
    { value: "Regular", label: "Regular" },
    { value: "Large", label: "Large" },
    { value: "Extra Large", label: "Extra Large" },
    { value: "Enormous", label: "Enormous" },
    { value: "Billboard", label: "Billboard" },
  ];

  const punctuationOptions = [
    { value: "Clean (automatic smart quotes)", label: "Clean (automatic smart quotes)" },
    { value: "Clean (English-style smart quotes)", label: "Clean (English-style smart quotes)" },
    { value: "Clean (German-style smart quotes)", label: "Clean (German-style smart quotes)" },
    { value: "Clean (French-style smart quotes)", label: "Clean (French-style smart quotes)" },
    { value: "Clean (straight quotes)", label: "Clean (straight quotes)" },
    { value: "Original", label: "Original" },
  ];

  const paragraphStyleOptions = [
    { value: "Space + Indent", label: "Space + Indent" },
    { value: "Space Only", label: "Space Only" },
    { value: "Indent Only", label: "Indent Only" },
  ];

  const statusOverrideOptions = [
    { value: "Auto (set by author)", label: "Auto (set by author)" },
    { value: "Complete", label: "Complete" },
    { value: "In-Progress", label: "In-Progress" },
    { value: "On Hiatus", label: "On Hiatus" },
    { value: "Abandoned", label: "Abandoned" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, customCoverImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="py-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="formatting">Formatting</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Theme */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-sm text-gray-700 dark:text-gray-300">
                  Dark mode
                </Label>
                <Switch
                  id="dark-mode"
                  checked={formData.theme === "dark"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, theme: checked ? "dark" : "light" })
                  }
                />
              </div>
            </div>

            {/* Download Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Downloads</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="default-format" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Default format
                  </Label>
                  <Select
                    value={formData.defaultFormat}
                    onValueChange={(value) =>
                      setFormData({ ...formData, defaultFormat: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <div>
                  <Label htmlFor="filename-template" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filename template
                  </Label>
                  <Input
                    id="filename-template"
                    value={formData.filenameTemplate}
                    onChange={(e) =>
                      setFormData({ ...formData, filenameTemplate: e.target.value })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Available variables: {"{title}"}, {"{author}"}, {"{fandom}"}, {"{chapters}"}, {"{words}"}, {"{lang}"}, {"{published}"}, {"{updated}"}, {"{status}"}, {"{subject}"}, {"{date}"}
                  </p>
                </div>
              
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-reviews" className="text-sm text-gray-700 dark:text-gray-300">
                    Include reviews by default
                  </Label>
                  <Switch
                    id="include-reviews"
                    checked={formData.includeReviews}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, includeReviews: checked })
                    }
                  />
                </div>
              
                <div className="flex items-center justify-between">
                  <Label htmlFor="generate-covers" className="text-sm text-gray-700 dark:text-gray-300">
                    Generate covers automatically
                  </Label>
                  <Switch
                    id="generate-covers"
                    checked={formData.generateCovers}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, generateCovers: checked })
                    }
                  />
                </div>

                {/* Custom Cover Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Custom cover image
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </Button>
                    {formData.customCoverImage && (
                      <div className="flex items-center space-x-2">
                        <FileImage className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Image uploaded</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, customCoverImage: "" })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formatting" className="space-y-6 mt-6">
            {/* Font Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Font</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Font Style
                    </Label>
                    <Select
                      value={formData.fontStyle}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fontStyle: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontStyleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Font Size
                    </Label>
                    <Select
                      value={formData.fontSize}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fontSize: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Punctuation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Punctuation</h3>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Punctuation Style
                </Label>
                <Select
                  value={formData.punctuationStyle}
                  onValueChange={(value) =>
                    setFormData({ ...formData, punctuationStyle: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {punctuationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Paragraph Style */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Paragraph Style</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paragraph Style
                  </Label>
                  <Select
                    value={formData.paragraphStyle}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paragraphStyle: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paragraphStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="justify-text"
                    checked={formData.justifyText}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, justifyText: checked as boolean })
                    }
                  />
                  <Label htmlFor="justify-text" className="text-sm text-gray-700 dark:text-gray-300">
                    Justify text
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            {/* Story Status Override */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Story Status</h3>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Override
                </Label>
                <Select
                  value={formData.storyStatusOverride}
                  onValueChange={(value) =>
                    setFormData({ ...formData, storyStatusOverride: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOverrideOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Override the story status regardless of what the author set
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-6">
            {/* Performance */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Performance</h3>
              <div>
                <Label htmlFor="download-delay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Download delay (seconds)
                </Label>
                <Input
                  id="download-delay"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.downloadDelay}
                  onChange={(e) =>
                    setFormData({ ...formData, downloadDelay: parseInt(e.target.value) || 2 })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Delay between chapter downloads to respect site policies
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
