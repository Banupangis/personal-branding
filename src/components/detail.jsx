import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExperiences } from '../data/experienceApi';
import { fetchAchievements } from '../data/achievementsApi';
import { getDocumentationImageUrl } from '../data/documentationStorage';

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

function DocumentationPreview({ url, title, onImageClick }) {
  const [imageSourceIndex, setImageSourceIndex] = useState(0);
  const preview = getDocumentationPreview(url);
  const imageSources = preview.type === 'image' ? (preview.urls || [preview.url]) : [];
  const hasImageError = imageSourceIndex >= imageSources.length;

  return (
    <article className={`experience-documentation-item${preview.type === 'image' ? ' is-image' : ''}`}>
      {preview.type === 'image' && !hasImageError ? (
        <button
          type="button"
          className="experience-documentation-image-button"
          onClick={() => onImageClick(imageSources[imageSourceIndex], `Dokumentasi ${title}`)}
          aria-label={`Perbesar dokumentasi ${title}`}
        >
          <img
            src={imageSources[imageSourceIndex]}
            alt={`Dokumentasi ${title}`}
            loading="lazy"
            onError={() => setImageSourceIndex((index) => index + 1)}
          />
        </button>
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

function DocumentationGallery({ documentation, title, onImageClick }) {
  const links = (Array.isArray(documentation) ? documentation : [documentation])
    .filter((url) => typeof url === 'string' && url.trim() && !/^\[Ljava\.lang\.Object;@[\da-f]+$/i.test(url.trim()))
    .map((url) => getDocumentationImageUrl(url.trim()));

  if (!links.length) return null;

  return (
    <div className="experience-documentation-gallery">
      {links.map((url, index) => (
        <DocumentationPreview
          key={`${url}-${index}`}
          url={url}
          title={`${title}, dokumentasi ${index + 1}`}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

export default function ExperienceDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const isAchievementRoute = pathname.startsWith('/achievement/');
  const [experience, setExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!selectedImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedImage(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  useEffect(() => {
    let isMounted = true;

    (isAchievementRoute ? fetchAchievements() : fetchExperiences())
      .then((items) => {
        if (isMounted) setExperience(items.find((item) => String(item.id) === id) || null);
      })
      .catch((error) => {
        console.error('Gagal mengambil detail:', error);
        if (isMounted) setLoadError(error.message || 'Gagal mengambil detail.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isAchievementRoute]);

  return (
    <main className="experience-detail-page">
      <div className="container">
        <Link to={isAchievementRoute ? '/#achievements' : '/#experience'} className="btn btn-outline">
          <ArrowLeft size={18} />
          {isAchievementRoute ? 'Kembali ke pencapaian' : 'Kembali ke pengalaman'}
        </Link>

        {isLoading ? (
          <p style={{ marginTop: '32px' }}>Memuat detail kegiatan...</p>
        ) : loadError ? (
          <p role="alert" style={{ marginTop: '32px', color: '#b91c1c' }}>{loadError}</p>
        ) : !experience ? (
          <div className="experience-detail-empty">
            <h1>{isAchievementRoute ? 'Pencapaian tidak ditemukan' : 'Pengalaman tidak ditemukan'}</h1>
            <p>Data ini mungkin sudah dihapus atau tautannya tidak valid.</p>
          </div>
        ) : (
          <article className="experience-detail-content">
            {isAchievementRoute ? (
              <>
                <span className="tag">{experience.date}</span>
                <h1>{experience.title}</h1>
                {experience.thumbnail && (
                  <button
                    type="button"
                    className="achievement-detail-thumbnail-button"
                    onClick={() => setSelectedImage({
                      url: getDocumentationImageUrl(experience.thumbnail),
                      alt: `Thumbnail ${experience.title}`
                    })}
                    aria-label={`Perbesar thumbnail ${experience.title}`}
                  >
                    <img
                      className="achievement-detail-thumbnail"
                      src={getDocumentationImageUrl(experience.thumbnail)}
                      alt={`Thumbnail ${experience.title}`}
                    />
                  </button>
                )}
                <p className="experience-detail-intro">{experience.detail || experience.description}</p>
                <DocumentationGallery
                  documentation={experience.documentation}
                  title={experience.title}
                  onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                />
              </>
            ) : (
              <>
                <span className="tag">{experience.date}</span>
                <h1>{experience.organization}</h1>
                <h2>{experience.role}</h2>
                <p className="experience-detail-intro">{experience.detail || experience.description}</p>
              </>
            )}

            {!isAchievementRoute && experience.contributions?.length > 0 && (
              <section className="experience-detail-section">
                <h3>Peran dan kontribusi</h3>
                <ul>
                  {experience.contributions.map((contribution, index) => (
                    <li key={`${index}-${contribution}`}>{contribution}</li>
                  ))}
                </ul>
              </section>
            )}

            {!isAchievementRoute && experience.activities?.length > 0 && (
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
                        onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                      />
                    </article>
                  ))}
                </div>
              </section>
            )}

          </article>
        )}
      </div>
      {selectedImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar ukuran penuh"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="image-lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Tutup gambar"
            autoFocus
          >
            <X size={24} />
          </button>
          <img
            className="image-lightbox-image"
            src={selectedImage.url}
            alt={selectedImage.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
