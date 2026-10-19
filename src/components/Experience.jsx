import SectionHeading from './SectionHeading';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchExperiences } from '../data/experienceApi';

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.resolve()
      .then(fetchExperiences)
      .then((data) => {
        if (isMounted) setExperiences(data);
      })
      .catch((error) => {
        console.error('Gagal mengambil data pengalaman:', error);
        if (isMounted) setLoadError(error.message || 'Gagal mengambil data pengalaman.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="experience">
      <div className="container">
        <SectionHeading title="Organisasi & Pengalaman" />
        <div style={{ maxWidth: '800px' }}>
          {loadError ? (
            <p role="alert" style={{ color: '#b91c1c' }}>{loadError}</p>
          ) : experiences.map((exp, index) => (
            <Link to={`/detail/${encodeURIComponent(exp.id)}`} key={exp.id} className="hover-item experience-link" style={{
              marginBottom: '16px',
              borderBottom: index !== experiences.length - 1 ? '1px solid var(--border-color)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--color-dark-blue)' }}>{exp.organization}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{exp.date}</span>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--color-orange)', marginBottom: '12px' }}>{exp.role}</p>
              <p style={{ marginBottom: '16px' }}>{exp.description}</p>
              <ul style={{ paddingLeft: '20px' }}>
                {exp.contributions.map((cont, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{cont}</li>
                ))}
              </ul>
              <span className="experience-read-more">Lihat detail kegiatan →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}