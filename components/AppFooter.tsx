import Link from 'next/link';
import BrandMark from './BrandMark';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <Link className="app-footer-brand" href="/" aria-label="Outranka home">
          <BrandMark size={24} />
          <span>Outranka</span>
        </Link>
        <p className="app-footer-tagline">Clear, actionable search insights for better content.</p>
        <p className="app-footer-copyright">© {new Date().getFullYear()} Outranka. All rights reserved.</p>
      </div>
    </footer>
  );
}
