import SectionHeading from './SectionHeading';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchExperiences } from '../data/experienceApi';
import { getDocumentationImageUrl } from '../data/documentationStorage';
import { getDocumentationPreview } from '../data/documentationPreview';

function getFirstExperienceImage(experience) {
  for (const activity of experience.activities || []) {
    const references = Array.isArray(activity.documentation)
      ? activity.documentation
      : [activity.documentation];

    for (const reference of references) {
      if (typeof reference !== 'string' || !reference.trim()) continue;

      const preview = getDocumentationPreview(getDocumentationImageUrl(reference.trim()));
      if (preview.type === 'image') return (preview.urls || [preview.url])[0];
    }
  }

  return '';
}

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
          ) : experiences.map((exp, index) => {
            const thumbnail = getFirstExperienceImage(exp);

            return (
              <Link
                to={`/detail/${encodeURIComponent(exp.id)}`}
                key={exp.id}
                className={`hover-item experience-link${thumbnail ? ' has-thumbnail' : ''}`}
                style={{
                marginBottom: '16px',
                borderBottom: index !== experiences.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div className="experience-link-content">
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
                </div>
                {thumbnail && (
                  <img
                    className="experience-card-thumbnail"
                    src={thumbnail}
                    alt={`Dokumentasi ${exp.organization}`}
                    loading="lazy"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}