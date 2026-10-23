import { HERO } from '../data/content';

export default function Hero() {
  return (
    <section id="hero" style={{ border: 'none', padding: 0 }}>
      <div className="container hero-content">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            {HERO.eyebrow}
          </p>
          <h1 className="hero-title">
            {HERO.headline}
          </h1>
          <h2 className="hero-subtitle">
            {HERO.subhead}
          </h2>
          <p className="hero-description">
            {HERO.description}
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">Lihat proyek</a>
            <a href="#about" className="btn btn-outline">Kenali saya</a>
          </div>
        </div>
        <img className="hero-photo" src="/profile.jpg" alt="Foto Dhanu Fa'iz Sugara" />
      </div>
    </section>
  );
}