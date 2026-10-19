import SectionHeading from './SectionHeading';
import { ABOUT } from '../data/content';

export default function About() {
  return (
    <section id="about">
      <div className="container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <SectionHeading title="Tentang Saya" />
        <div className="about-copy">
          {ABOUT.split('\n\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}