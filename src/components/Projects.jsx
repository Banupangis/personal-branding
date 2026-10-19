import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { fetchProjects } from '../data/projectsApi';
import { ArrowUpRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchProjects()
      .then((data) => {
        if (isMounted) setProjects(data);
      })
      .catch((error) => {
        console.error("Gagal mengambil proyek:", error);
        if (isMounted) setLoadError(error.message || "Gagal mengambil proyek.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: '40px'
  };

  const previewStyles = {
    position: 'relative',
    height: '220px',
    backgroundColor: 'var(--bg-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid var(--border-color)',
    // Pola grid samar menggunakan Light Blue yang ditipiskan
    backgroundImage: 'radial-gradient(rgba(96, 165, 250, 0.2) 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  };

  return (
    <section id="projects">
      <div className="container">
        <SectionHeading title="Proyek" />
        {isLoading ? (
          <p>Memuat proyek...</p>
        ) : loadError ? (
          <p role="alert" style={{ color: '#b91c1c' }}>{loadError}</p>
        ) : projects.length === 0 ? (
          <p>Belum ada proyek untuk ditampilkan.</p>
        ) : (
          <div style={gridStyles}>
          {projects.map((project) => (
            <article key={project.id} className="hover-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={previewStyles}>
                {project.thumbnail && (
                  <img
                    className="project-thumbnail"
                    src={project.thumbnail}
                    alt={`Thumbnail ${(project.title || '?').charAt(0)}`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
              </div>
              <div className="project-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ marginBottom: '16px' }}>
                  <span className="tag">{project.category}</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--color-dark-blue)' }}>{project.title}</h3>
                <p style={{ fontSize: '0.95rem', flexGrow: 1, marginBottom: '24px' }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {project.status}
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{fontSize: '0.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '4px 4px', borderRadius: '8px'}} >
                      {project.githubLink && <a href={project.githubLink} className="nav-link" title="GitHub"><ArrowUpRight size={10} />Github repository</a>}
                    </div>
                    <div style={{fontSize: '0.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '4px 4px', borderRadius: '10px', }}>
                      {project.demoLink && <a href={project.demoLink} className="nav-link" title="Github"><ArrowUpRight size={10} />Link Demo</a>}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}