import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExperiences } from '../data/experienceApi';

function getDocumentationPreview(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { type: 'link', url };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { type: 'link', url };
  }

  if (/\.(avif|gif|jpe?g|png|webp|svg)$/i.test(parsedUrl.pathname)) {
    return { type: 'image', url: parsedUrl.href };
  }

  const host = parsedUrl.hostname.toLowerCase();
  let videoId = '';
  if (host === 'youtu.be') {
    videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
  } else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (parsedUrl.pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v') || '';
    } else {
      videoId = parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
    }
  }
  if (videoId && /^[\w-]+$/.test(videoId)) {
    return { type: 'embed', url: `https://www.youtube-nocookie.com/embed/${videoId}` };
  }

  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const fileId = parsedUrl.pathname.match(/\/d\/([^/]+)/)?.[1]
      || parsedUrl.searchParams.get('id');
    if (fileId) {
      if (host === 'drive.google.com') {
        return {
          type: 'image',
          urls: [
            `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1200`,
            `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`
          ]
        };
      }
      if (host === 'docs.google.com') {
        return { type: 'embed', url: `https://docs.google.com${parsedUrl.pathname.replace(/\/(?:edit|view|pubhtml)\/?$/, '/preview')}` };
      }
    }
  }

  return { type: 'embed', url: parsedUrl.href };
}

function DocumentationPreview({ url, title }) {
  const [imageSourceIndex, setImageSourceIndex] = useState(0);
  const preview = getDocumentationPreview(url);
  const imageSources = preview.type === 'image' ? (preview.urls || [preview.url]) : [];
  const hasImageError = imageSourceIndex >= imageSources.length;

  return (
    <article className={`experience-documentation-item${preview.type === 'image' ? ' is-image' : ''}`}>
      {preview.type === 'image' && !hasImageError ? (
        <img
          src={imageSources[imageSourceIndex]}
          alt={`Dokumentasi ${title}`}
          loading="lazy"
          onError={() => setImageSourceIndex((index) => index + 1)}
        />
      ) : preview.type === 'embed' ? (
        <iframe
          src={preview.url}
          title={`Preview dokumentasi ${title}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <p className="experience-documentation-unavailable">
          {preview.type === 'image'
            ? 'Foto dokumentasi tidak dapat dimuat.'
            : 'Preview tidak tersedia untuk tautan ini. Buka dokumentasi melalui tombol di bawah.'}
        </p>
      )}
      {preview.type !== 'image' && (
        <a href={url} target="_blank" rel="noreferrer" className="experience-activity-documentation">
          Buka dokumentasi
          <ExternalLink size={16} />
        </a>
      )}
    </article>
  );
}

function DocumentationGallery({ documentation, title }) {
  const links = (Array.isArray(documentation) ? documentation : [documentation])
    .filter((url) => typeof url === 'string' && url.trim() && !/^\[Ljava\.lang\.Object;@[\da-f]+$/i.test(url.trim()))
    .map((url) => url.trim());

  if (!links.length) return null;

  return (
    <div className="experience-documentation-gallery">
      {links.map((url, index) => (
        <DocumentationPreview key={`${url}-${index}`} url={url} title={`${title}, dokumentasi ${index + 1}`} />
      ))}
    </div>
  );
}

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchExperiences()
      .then((experiences) => {
        if (isMounted) setExperience(experiences.find((item) => String(item.id) === id) || null);
      })
      .catch((error) => {
        console.error('Gagal mengambil data pengalaman:', error);
        if (isMounted) setLoadError(error.message || 'Gagal mengambil data pengalaman.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <main className="experience-detail-page">
      <div className="container">
        <Link to="/#experience" className="btn btn-outline">
          <ArrowLeft size={18} />
          Kembali ke pengalaman
        </Link>

        {isLoading ? (
          <p style={{ marginTop: '32px' }}>Memuat detail kegiatan...</p>
        ) : loadError ? (
          <p role="alert" style={{ marginTop: '32px', color: '#b91c1c' }}>{loadError}</p>
        ) : !experience ? (
          <div className="experience-detail-empty">
            <h1>Pengalaman tidak ditemukan</h1>
            <p>Data kegiatan ini mungkin sudah dihapus atau tautannya tidak valid.</p>
          </div>
        ) : (
          <article className="experience-detail-content">
            <span className="tag">{experience.date}</span>
            <h1>{experience.organization}</h1>
            <h2>{experience.role}</h2>
            <p className="experience-detail-intro">{experience.detail || experience.description}</p>

            {experience.contributions?.length > 0 && (
              <section className="experience-detail-section">
                <h3>Peran dan kontribusi</h3>
                <ul>
                  {experience.contributions.map((contribution, index) => (
                    <li key={`${index}-${contribution}`}>{contribution}</li>
                  ))}
                </ul>
              </section>
            )}

            {experience.activities?.length > 0 && (
              <section className="experience-detail-section">
                <h3>Sub Kegiatan</h3>
                <div className="experience-activity-list">
                  {experience.activities.map((activity, index) => (
                    <article key={`${index}-${activity.title}`} className="hover-card experience-activity">
                      <h4>{activity.title}</h4>
                      {activity.description && <p>{activity.description}</p>}
                      <DocumentationGallery
                        documentation={activity.documentation}
                        title={activity.title || 'kegiatan'}
                      />
                    </article>
                  ))}
                </div>
              </section>
            )}

          </article>
        )}
      </div>
    </main>
  );
}
