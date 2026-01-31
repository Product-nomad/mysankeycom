import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { FileText, Scale, AlertTriangle, Users, Gavel } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'January 31, 2026';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service | MySankey"
        description="Read MySankey's Terms of Service. Understand your rights, responsibilities, and acceptable use policies when using our data visualization platform."
      />
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
            {/* Acceptance */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing or using MySankey ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Description of Service */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Description of Service</h2>
              <p className="text-muted-foreground">
                MySankey is an AI-powered data visualization platform that generates interactive Sankey diagrams. The Service includes:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>AI-generated Sankey diagrams from natural language queries</li>
                <li>CSV/Excel data import and visualization</li>
                <li>Drill-down exploration and data analysis</li>
                <li>Saving, sharing, and exporting diagrams</li>
                <li>A public gallery of curated visualizations</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Accounts
              </h2>
              <p className="text-muted-foreground">
                To save and share diagrams, you must create an account. You are responsible for:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            {/* Data Ownership */}
            <section className="glass rounded-xl p-6 border border-border/30 bg-primary/5">
              <h2 className="text-xl font-semibold text-foreground mt-0">Data Ownership</h2>
              <p className="text-muted-foreground font-medium">
                You own your data. Here's how it works:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2 mt-4">
                <li>
                  <strong>Your Diagrams:</strong> Sankey diagrams you create are owned by you. You retain all intellectual property rights to your custom visualizations.
                </li>
                <li>
                  <strong>Uploaded Data:</strong> Any CSV or Excel data you upload remains your property. We process it temporarily to generate visualizations and do not retain it.
                </li>
                <li>
                  <strong>Public Sharing:</strong> When you make a diagram public, you grant MySankey a non-exclusive license to display it in our gallery. You can revoke this by making the diagram private.
                </li>
                <li>
                  <strong>AI-Generated Content:</strong> The underlying AI-generated data and analysis is provided under a Creative Commons license. You may use it for any purpose with attribution.
                </li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Acceptable Use
              </h2>
              <p className="text-muted-foreground">
                You agree NOT to use the Service to:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Generate or share misleading, deceptive, or fraudulent visualizations</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Attempt to reverse engineer, hack, or compromise the Service</li>
                <li>Overload the system with automated requests (scraping, bots)</li>
                <li>Share content that is harmful, abusive, or discriminatory</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Disclaimer</h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>The accuracy, completeness, or reliability of AI-generated data</li>
                <li>Uninterrupted or error-free operation of the Service</li>
                <li>That the Service will meet your specific requirements</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium">
                AI-generated visualizations are estimates and should not be used as the sole basis for financial, medical, legal, or other critical decisions. Always verify with primary sources.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MYSANKEY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.
              </p>
              <p className="text-muted-foreground mt-4">
                Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us (if any) in the 12 months prior to the claim.
              </p>
            </section>

            {/* Termination */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Termination</h2>
              <p className="text-muted-foreground">
                You may terminate your account at any time through your Settings page. Upon termination:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>Your account and all associated data will be deleted</li>
                <li>Public diagrams you created may be retained for historical purposes</li>
                <li>You will lose access to any saved diagrams or settings</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We may terminate or suspend your access for violations of these Terms without prior notice.
              </p>
            </section>

            {/* Governing Law */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mt-0">Contact</h2>
              <p className="text-muted-foreground">
                Questions about these Terms? Contact us at{' '}
                <a href="mailto:legal@mysankey.com" className="text-primary hover:underline">
                  legal@mysankey.com
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

export default TermsOfService;
