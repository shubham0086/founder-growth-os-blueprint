import { Link } from 'react-router-dom';
import { siteConfig } from '@/lib/siteConfig';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">{siteConfig.BRAND_NAME}</p>
            <p className="text-sm text-muted-foreground">{siteConfig.BRAND_TAGLINE}</p>
          </div>

          {/* Legal Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/refund" className="text-muted-foreground hover:text-foreground transition-colors">
              Refund Policy
            </Link>
          </nav>

          {/* Contact */}
          <div className="text-center md:text-right text-sm text-muted-foreground">
            <a href={`mailto:${siteConfig.CONTACT_EMAIL}`} className="hover:text-foreground transition-colors">
              {siteConfig.CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            {siteConfig.DISCLAIMER}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} {siteConfig.COMPANY_LEGAL_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
