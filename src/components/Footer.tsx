import { Link } from 'react-router-dom';
import { GitBranch, Mail, Cookie } from 'lucide-react';
import { openCookiePreferences } from './CookieConsent';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 border-t border-border/30 bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">MySankey</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Transform complex data relationships into beautiful, interactive Sankey diagrams.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Explore Gallery
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookiePreferences}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Cookie className="w-3 h-3" />
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:feedback@mysankey.com"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  feedback@mysankey.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} MySankey. Built with ❤️ for data visualization enthusiasts.
          </p>
          <p className="text-xs text-muted-foreground">
            Data visualizations are AI-generated. Always verify with primary sources.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
