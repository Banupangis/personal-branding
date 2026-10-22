import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { fetchAchievements } from '../data/achievementsApi';
import { Link } from 'react-router-dom';
import { getDocumentationImageUrl } from '../data/documentationStorage';

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
          ) : achievements.map((achievement) => (
              <Link to={`/achievement/${encodeURIComponent(achievement.id)}`} key={achievement.id} className="hover-card detail-card achievement-card">
                {achievement.thumbnail && (
                  <img className="achievement-card-thumbnail" src={getDocumentationImageUrl(achievement.thumbnail)} alt={`Thumbnail ${achievement.title}`} loading="lazy" />
                )}
                <p className="achievement-date">{achievement.date}</p>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <span className="experience-read-more">Lihat detail pencapaian →</span>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
