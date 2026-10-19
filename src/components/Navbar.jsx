import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/content';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="site-nav">
      <div className="container site-nav-inner">
        <a href="#hero" className="site-brand">
          Portfolio
        </a>

        <div className="desktop-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <div
        id="mobile-navigation"
        className={`mobile-menu${isMenuOpen ? ' is-open' : ''}`}
        hidden={!isMenuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}