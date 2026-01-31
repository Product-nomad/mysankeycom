import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Cookie, Clock, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openCookiePreferences } from '@/components/CookieConsent';

const CookiePolicy = () => {
  const lastUpdated = 'January 31, 2026';

  const cookies = [
    {
      name: 'sb-*-auth-token',
      category: 'Essential',
      purpose: 'Maintains your authentication session',
      duration: '7 days',
      provider: 'Supabase',
    },
    {
      name: 'mysankey_cookie_consent',
      category: 'Essential',
      purpose: 'Remembers your cookie consent choice',
      duration: '1 year',
      provider: 'MySankey',
    },
    {
      name: 'mysankey_cookie_preferences',
      category: 'Essential',
      purpose: 'Stores your detailed cookie preferences',
      duration: '1 year',
      provider: 'MySankey',
    },
    {
      name: 'theme',
      category: 'Personalization',
      purpose: 'Remembers your dark/light mode preference',
      duration: 'Persistent',
      provider: 'MySankey',
    },
    {
      name: 'mysankey_settings',
      category: 'Personalization',
      purpose: 'Stores chart display preferences',
      duration: 'Persistent',
      provider: 'MySankey',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cookie Policy | MySankey"
        description="Learn about the cookies MySankey uses, their purposes, and how to manage your preferences."
      />
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
            {/* What Are Cookies */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and provide personalized experiences.
              </p>
              <p className="text-muted-foreground">
                MySankey uses cookies to provide essential functionality and improve your experience. We are committed to transparency about what data we collect and why.
              </p>
            </section>

            {/* Cookie Categories */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Cookie Categories
              </h2>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="text-lg font-medium text-foreground mt-0 mb-2">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Required for the website to function. These cookies enable core features like authentication, security, and remembering your consent preferences. They cannot be disabled.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium text-foreground mt-0 mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website. We use this data to improve the user experience and identify popular features. Currently, MySankey does not use third-party analytics services.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium text-foreground mt-0 mb-2">Personalization Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Remember your preferences like dark mode and chart settings. These enhance your experience but are not required for the site to function.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie Table */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Cookies We Use
              </h2>
              
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-foreground font-medium">Cookie Name</th>
                      <th className="text-left py-2 px-3 text-foreground font-medium">Category</th>
                      <th className="text-left py-2 px-3 text-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 px-3 text-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookies.map((cookie, index) => (
                      <tr key={index} className="border-b border-border/30">
                        <td className="py-2 px-3 text-muted-foreground font-mono text-xs">
                          {cookie.name}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            cookie.category === 'Essential' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {cookie.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">
                          {cookie.purpose}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">
                          {cookie.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Managing Preferences */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Managing Your Preferences
              </h2>
              <p className="text-muted-foreground">
                You can manage your cookie preferences at any time by clicking the button below or using the "Cookie Settings" link in our footer.
              </p>
              <div className="mt-4">
                <Button onClick={openCookiePreferences} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Manage Cookie Preferences
                </Button>
              </div>

              <h3 className="text-lg font-medium text-foreground mt-6">Browser Settings</h3>
              <p className="text-muted-foreground">
                You can also control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>View what cookies are stored on your device</li>
                <li>Delete individual or all cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies (note: this may affect site functionality)</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Questions?</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:privacy@mysankey.com" className="text-primary hover:underline">
                  privacy@mysankey.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
