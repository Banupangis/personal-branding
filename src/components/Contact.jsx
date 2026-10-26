import { CONTACT } from '../data/content';
import { FileText, Mail, Phone } from 'lucide-react';
import { normalizeProfileLink } from '../data/profileLinks';

export default function Contact() {
  const githubUrl = normalizeProfileLink(CONTACT.github);
  const linkedinUrl = normalizeProfileLink(CONTACT.linkedin);
  const cvUrl = normalizeProfileLink(CONTACT.cv);

  return (
    <section id="contact" style={{ backgroundColor: 'var(--color-dark-blue)', color: '#FFFFFF' }}>
      <div className="container contact-content">
        <h2 className="contact-title">Hubungi Saya</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-light-blue)', maxWidth: '600px', margin: '0 auto 48px' }}>
          {CONTACT.location} · Terbuka untuk berdiskusi dan berkolaborasi.
        </p>
        
        <div className="contact-actions">
          <a href={`mailto:${CONTACT.email}`} className="btn btn-primary" style={{ border: 'none' }}>
            <Mail size={18} /> Email
          </a>
          {CONTACT.phone && (
            <a href={`tel:${CONTACT.phone}`} className="btn btn-outline" style={{ borderColor: 'var(--color-light-blue)', color: 'var(--color-light-blue)' }}>
              <Phone size={18} /> {CONTACT.phone}
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: 'var(--color-light-blue)', color: 'var(--color-light-blue)' }}>
              GitHub
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: 'var(--color-light-blue)', color: 'var(--color-light-blue)' }}>
              LinkedIn
            </a>
          )}
          {cvUrl && (
            <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: 'var(--color-light-blue)', color: 'var(--color-light-blue)' }}>
              <FileText size={18} /> Unduh CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
}