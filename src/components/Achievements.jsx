import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { fetchAchievements } from '../data/achievementsApi';
import { Link } from 'react-router-dom';
import { getDocumentationImageUrl } from '../data/documentationStorage';
import { getDocumentationPreview } from '../data/documentationPreview';

function getAchievementThumbnail(achievement) {
  if (achievement.thumbnail) return getDocumentationImageUrl(achievement.thumbnail);

  const documentation = Array.isArray(achievement.documentation)
    ? achievement.documentation
    : [achievement.documentation];
  for (const reference of documentation) {
    if (typeof reference !== 'string' || !reference.trim()) continue;

    const preview = getDocumentationPreview(getDocumentationImageUrl(reference.trim()));
    if (preview.type === 'image') return (preview.urls || [preview.url])[0];
  }

  return '';
}

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchAchievements()
      .then((data) => {
        if (isMounted) setAchievements(data);
      })
      .catch((error) => {
        console.error('Gagal mengambil pencapaian:', error);
        if (isMounted) setLoadError(error.message || 'Gagal mengambil pencapaian.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="achievements">
      <div className="container">
        <SectionHeading title="Pencapaian" />
        <div className="details-grid">
          {loadError ? (
            <p role="alert" className="admin-error">{loadError}</p>
          ) : achievements.map((achievement) => {
            const thumbnail = getAchievementThumbnail(achievement);

            return (
              <Link to={`/achievement/${encodeURIComponent(achievement.id)}`} key={achievement.id} className="hover-card detail-card achievement-card">
                {thumbnail && (
                  <img className="achievement-card-thumbnail" src={thumbnail} alt={`Thumbnail ${achievement.title}`} loading="lazy" />
                )}
                <p className="achievement-date">{achievement.date}</p>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <span className="experience-read-more">Lihat detail pencapaian →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
