import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ConsentPreferences {
  essential: boolean; // Always true
  analytics: boolean;
  personalization: boolean;
}

const CONSENT_KEY = 'mysankey_cookie_consent';
const PREFERENCES_KEY = 'mysankey_cookie_preferences';

export const getConsentPreferences = (): ConsentPreferences | null => {
  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const hasConsented = (): boolean => {
  return localStorage.getItem(CONSENT_KEY) === 'true';
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    personalization: false,
  });

  useEffect(() => {
    // Check if user has already consented
    if (!hasConsented()) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const saved = getConsentPreferences();
      if (saved) {
        setPreferences(saved);
      }
    }
  }, []);

  // Listen for preference center open requests from footer
  useEffect(() => {
    const handler = () => setShowPreferences(true);
    window.addEventListener('openCookiePreferences', handler);
    return () => window.removeEventListener('openCookiePreferences', handler);
  }, []);

  const savePreferences = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_KEY, 'true');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);
    
    // Dispatch event for analytics initialization
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      personalization: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      personalization: false,
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  // Preference center dialog (can be opened from footer)
  const PreferenceCenter = () => (
    <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. Essential cookies are required for the site to function.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Essential Cookies */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label className="font-medium">Essential Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Required for authentication, security, and basic functionality.
              </p>
            </div>
            <Switch checked disabled />
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="font-medium">Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Help us understand how visitors interact with our site.
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, analytics: checked }))
              }
            />
          </div>

          {/* Personalization Cookies */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="font-medium">Personalization Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Remember your preferences and provide tailored experiences.
              </p>
            </div>
            <Switch
              checked={preferences.personalization}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, personalization: checked }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleRejectAll}>
            Reject All
          </Button>
          <Button onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!isVisible && !showPreferences) return null;

  return (
    <>
      {/* Banner */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
          <Card className="max-w-4xl mx-auto p-4 sm:p-6 glass border-border/50 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">We value your privacy</h3>
                <p className="text-xs text-muted-foreground">
                  We use cookies to enhance your browsing experience and analyze site traffic. 
                  By clicking "Accept All", you consent to our use of cookies.{' '}
                  <a href="/cookie-policy" className="text-primary hover:underline">
                    Learn more
                  </a>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="flex-1 sm:flex-none"
                >
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <PreferenceCenter />
    </>
  );
};

// Export a function to open preferences from footer
export const openCookiePreferences = () => {
  window.dispatchEvent(new CustomEvent('openCookiePreferences'));
};

// Hook to listen for preference center open requests
export const useCookiePreferencesListener = (setShowPreferences: (show: boolean) => void) => {
  useEffect(() => {
    const handler = () => setShowPreferences(true);
    window.addEventListener('openCookiePreferences', handler);
    return () => window.removeEventListener('openCookiePreferences', handler);
  }, [setShowPreferences]);
};

export default CookieConsent;
