import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { FlaskConical, Bot, Filter, CheckCircle, Database, AlertTriangle } from 'lucide-react';

const Methodology = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Methodology | MySankey"
        description="Learn how MySankey generates accurate, verified Sankey diagrams. Our transparent data pipeline combines AI with rule-based validation."
      />
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Methodology</h1>
                <p className="text-sm text-muted-foreground">How we generate accurate Sankey diagrams</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              MySankey combines artificial intelligence with rule-based validation to produce insightful, 
              data-driven flow visualizations. Here's our transparent approach to data generation and verification.
            </p>
          </div>

          <div className="space-y-8">
            {/* Pipeline Overview */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4">The Data Pipeline</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">1. AI Fetch</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Query interpreted by Google Gemini
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Filter className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">2. Rule-Based Cleaning</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Validation and normalization
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">3. Verification</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source citation and confidence scoring
                  </p>
                </div>
              </div>
            </section>

            {/* Step 1: AI Fetch */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Step 1: AI Data Fetch
              </h2>
              <p className="text-muted-foreground mb-4">
                When you enter a query, it's processed by Google Gemini (via the Lovable AI Gateway) with a specialized system prompt that:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2">
                <li>Instructs the model to use the most recent available data (2025-2026)</li>
                <li>Requires realistic numerical values with appropriate units</li>
                <li>Demands proper flow structure (sources → intermediaries → destinations)</li>
                <li>Requests confidence levels for each data point</li>
                <li>Asks for verifiable source citations with real URLs</li>
              </ul>
              <div className="mt-4 p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Model Used:</strong> google/gemini-3-flash-preview<br />
                  <strong>Response Format:</strong> Structured JSON with nodes, links, sources
                </p>
              </div>
            </section>

            {/* Step 2: Rule-Based Cleaning */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Step 2: Rule-Based Cleaning
              </h2>
              <p className="text-muted-foreground mb-4">
                Raw AI output undergoes automated validation and cleaning:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2">
                <li><strong>Schema Validation:</strong> Ensures all required fields exist (nodes, links, unit)</li>
                <li><strong>Node Matching:</strong> Verifies all link sources/targets reference valid nodes</li>
                <li><strong>Value Normalization:</strong> Converts values to consistent units</li>
                <li><strong>Orphan Removal:</strong> Removes nodes not connected to any links</li>
                <li><strong>Default Assignment:</strong> Applies fallback confidence ("projected") if missing</li>
              </ul>
            </section>

            {/* Step 3: Verification */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Step 3: Verification & Confidence Scoring
              </h2>
              <p className="text-muted-foreground mb-4">
                Each data point receives a confidence classification:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">Verified</h4>
                    <p className="text-xs text-muted-foreground">
                      Data from official sources: SEC filings, government statistics, audited financial reports
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1"></div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">Estimated</h4>
                    <p className="text-xs text-muted-foreground">
                      Calculated from partial data, industry benchmarks, or analyst consensus
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">Projected</h4>
                    <p className="text-xs text-muted-foreground">
                      AI-generated estimates based on patterns, trends, and contextual inference
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery Verification */}
            <section className="glass rounded-xl p-6 border border-border/30 bg-primary/5">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Gallery of Truth: Enhanced Verification
              </h2>
              <p className="text-muted-foreground mb-4">
                Our curated gallery flows undergo additional quality checks:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2">
                <li>Generation uses enhanced prompts requiring 2026 baseline data</li>
                <li>Sources must cite specific reports (e.g., "IMF World Economic Outlook Jan 2026")</li>
                <li>URLs are validated for realistic domain structures</li>
                <li>Flows highlight at least 3 numerical anomalies or insights</li>
                <li>300-word SEO analysis is generated and reviewed</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 font-medium">
                Gallery flows are marked with a "Verified by MySankey" badge to indicate this enhanced process.
              </p>
            </section>

            {/* Limitations */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Limitations & Disclaimer
              </h2>
              <p className="text-muted-foreground mb-4">
                While we strive for accuracy, users should be aware of inherent limitations:
              </p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2">
                <li><strong>AI Hallucination:</strong> Language models can generate plausible but incorrect data</li>
                <li><strong>Temporal Lag:</strong> AI training data has a knowledge cutoff; recent events may not be reflected</li>
                <li><strong>Source Availability:</strong> Not all sources have publicly accessible URLs</li>
                <li><strong>Rounding:</strong> Values are often rounded for readability</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 font-medium bg-amber-500/10 p-3 rounded-lg">
                ⚠️ MySankey visualizations are for informational purposes only. Always verify critical data with primary sources before making decisions.
              </p>
            </section>

            {/* Contact */}
            <section className="glass rounded-xl p-6 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-4">Feedback & Corrections</h2>
              <p className="text-muted-foreground">
                Found an error or have suggestions for improving our methodology? We'd love to hear from you:
              </p>
              <p className="text-muted-foreground mt-2">
                <a href="mailto:data@mysankey.com" className="text-primary hover:underline">
                  data@mysankey.com
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

export default Methodology;
