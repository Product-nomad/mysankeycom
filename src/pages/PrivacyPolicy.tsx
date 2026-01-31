import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Shield, Database, Bot, Lock, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = 'January 31, 2026';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy | MySankey"
        description="Learn how MySankey collects, uses, and protects your personal information. We are committed to transparency and your data privacy."
      />
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground">
                MySankey ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our interactive data visualization platform.
              </p>
              <p className="text-muted-foreground">
                By using MySankey, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-medium text-foreground">Account Information</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Email address (for authentication)</li>
                <li>Display name (optional)</li>
                <li>Account creation date</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">Usage Data</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Diagram queries and generated visualizations</li>
                <li>Interaction patterns (drill-downs, exports)</li>
                <li>Browser type, device information, and IP address</li>
                <li>Pages visited and time spent on the platform</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">User-Generated Content</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Sankey diagrams you create and save</li>
                <li>CSV/Excel data you upload (processed temporarily, not stored permanently)</li>
                <li>Custom settings and preferences</li>
              </ul>
            </section>

            {/* AI Disclosure */}
            <section className="glass rounded-xl p-6 border border-border/30 bg-primary/5">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Data Processing Disclosure
              </h2>
              <p className="text-muted-foreground">
                MySankey uses artificial intelligence to generate Sankey diagrams and analysis. Here's how your data interacts with AI systems:
              </p>
              
              <h3 className="text-lg font-medium text-foreground mt-4">AI Providers</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li><strong>Google Gemini:</strong> Powers diagram generation and data analysis</li>
                <li><strong>Lovable AI Gateway:</strong> Routes and manages AI requests securely</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">Data Handling</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Your search queries are sent to AI models to generate diagrams</li>
                <li>Uploaded CSV data is processed in-memory and not retained by AI providers</li>
                <li>AI-generated content is stored in our database, associated with your account</li>
                <li>We do not use your personal data to train AI models</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">Accuracy Notice</h3>
              <p className="text-muted-foreground">
                AI-generated diagrams and analyses are estimates based on available data. We provide source citations where possible, but users should verify critical data with primary sources.
              </p>
            </section>

            {/* Data Storage */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Data Storage & Security
              </h2>
              <p className="text-muted-foreground">
                Your data is stored securely using industry-standard practices:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Database hosted on Supabase (PostgreSQL) with encryption at rest</li>
                <li>All data transfers use TLS 1.3 encryption</li>
                <li>Row-Level Security (RLS) ensures you can only access your own data</li>
                <li>Regular security audits and vulnerability assessments</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">Data Retention</h3>
              <p className="text-muted-foreground">
                We retain your account data as long as your account is active. You can delete your account and all associated data at any time from your Settings page. Public flows may be retained for historical purposes unless you request deletion.
              </p>
            </section>

            {/* Your Rights */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Your Rights
              </h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Data Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Withdraw Consent:</strong> Opt out of non-essential data processing</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, visit your Settings page or contact us at{' '}
                <a href="mailto:privacy@mysankey.com" className="text-primary hover:underline">
                  privacy@mysankey.com
                </a>.
              </p>
            </section>

            {/* Contact */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Email: <a href="mailto:privacy@mysankey.com" className="text-primary hover:underline">privacy@mysankey.com</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
