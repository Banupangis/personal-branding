import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { fetchAchievements } from '../data/achievementsApi';

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
              <article key={achievement.id} className="hover-card detail-card">
                <p className="achievement-date">{achievement.date}</p>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
