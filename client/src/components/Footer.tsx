
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-stormy-dark border-t border-stormy-light/30 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Legal Links */}
          <div className="flex justify-center space-x-6">
            <Link href="/privacy-policy" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/terms-of-service" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Branding and Mission */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/src/assets/r8-logo.png"
                alt="R8 Logo" 
                className="w-6 h-6 mr-2"
              />
              <span className="text-lg font-bold text-white">R8</span>
            </div>
            <p className="text-white/60 text-sm mb-2">
              Emergency Response • Resilient Communities • Regenerative Solutions
            </p>
            <p className="text-white/50 text-xs">
              Thank you for helping build resilient communities! 🌱
            </p>
          </div>

          {/* Draft Notice */}
          <div className="text-center text-xs text-white/40 border-t border-white/10 pt-4 w-full">
            <p>Draft legal documents for demonstration purposes.</p>
            <p>Final versions will be reviewed by legal experts before production deployment.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
