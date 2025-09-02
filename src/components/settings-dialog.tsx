'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings, Eye, EyeOff, Download, Upload, AlertCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { AVAILABLE_MODELS } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SettingsDialog() {
  const { 
    settings, 
    isLoading,
    isStorageAvailable,
    updateSettings, 
    resetToDefaults,
    exportSettings,
    importSettings
  } = useSettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModel, setTempModel] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize temp values when dialog opens or settings change
  useEffect(() => {
    if (isOpen && !isLoading) {
      setTempApiKey(settings.aiConfig.apiKey);
      setTempModel(settings.aiConfig.model);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, isLoading, settings]);

  // Track unsaved changes
  useEffect(() => {
    if (isOpen && !isLoading) {
      const hasChanges = tempApiKey !== settings.aiConfig.apiKey || tempModel !== settings.aiConfig.model;
      setHasUnsavedChanges(hasChanges);
    }
  }, [tempApiKey, tempModel, settings, isOpen, isLoading]);

  const handleSave = () => {
    updateSettings({
      aiConfig: {
        apiKey: tempApiKey,
        model: tempModel,
      },
    });
    
    toast({
      title: "Settings Saved",
      description: isStorageAvailable 
        ? "Your AI configuration has been updated and saved locally."
        : "Settings updated (localStorage not available, changes won't persist).",
    });
    
    setHasUnsavedChanges(false);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setTempApiKey('');
    setTempModel('googleai/gemini-1.5-flash');
    setHasUnsavedChanges(false);
    
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults.",
    });
  };

  const handleExport = () => {
    try {
      const settingsJson = exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumeai-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Settings Exported",
        description: "Your settings have been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export settings.",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importSettings(content)) {
        toast({
          title: "Settings Imported",
          description: "Your settings have been imported successfully.",
        });
        setIsOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Failed to import settings. Please check the file format.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // Reset to original values
      setTempApiKey(settings.aiConfig.apiKey);
      setTempModel(settings.aiConfig.model);
      setHasUnsavedChanges(false);
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Settings className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>AI Configuration</DialogTitle>
            <DialogDescription>
              Configure your AI model and API key settings. Changes are saved automatically.
            </DialogDescription>
          </DialogHeader>
          
          {!isStorageAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Local storage is not available. Your settings won't persist after closing the browser.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={tempModel} onValueChange={setTempModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="apikey">Gemini API Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to use the default API key. Changes are saved locally.
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Import/Export Settings</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasUnsavedChanges}
              className={hasUnsavedChanges ? 'bg-primary' : ''}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
