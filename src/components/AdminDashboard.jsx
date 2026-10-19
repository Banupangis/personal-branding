import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Loader2, Pencil, X } from 'lucide-react';
import { API_URL, fetchProjects as getProjects } from '../data/projectsApi';
import { deleteExperience, fetchExperiences, saveExperience } from '../data/experienceApi';
import { deleteAchievement, fetchAchievements, saveAchievement } from '../data/achievementsApi';

const createEmptyActivity = () => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: '',
  description: '',
  documentation: []
});

const emptyExperienceForm = {
  organization: '',
  role: '',
  date: '',
  description: '',
  detail: '',
  contributions: '',
  activities: []
};

const emptyProjectForm = {
  title: '',
  category: '',
  description: '',
  status: 'Sedang dikerjakan',
  thumbnail: '',
  githubLink: '',
  demoLink: ''
};

const emptyAchievementForm = {
  title: '',
  date: '',
  description: ''
};

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAchievementId, setSelectedAchievementId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [projectActionError, setProjectActionError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [achievementError, setAchievementError] = useState('');
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState('');
  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [achievementForm, setAchievementForm] = useState(emptyAchievementForm);

  // Status formulir
  const [formData, setFormData] = useState(emptyProjectForm);

  const handleSelectProject = (project) => {
    setSelectedProjectId(String(project.id));
    setFormData({
      title: project.title || '',
      category: project.category || '',
      description: project.description || '',
      status: project.status || '',
      thumbnail: project.thumbnail || '',
      githubLink: project.githubLink || '',
      demoLink: project.demoLink || ''
    });
    setProjectActionError('');
  };

  const handleNewProject = () => {
    setSelectedProjectId('');
    setFormData({ ...emptyProjectForm });
    setProjectActionError('');
  };

  // Ambil data
  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      setLoadError('');
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setLoadError(error.message || "Gagal mengambil data proyek.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
          setLoadError('');
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil data:", error);
        if (isMounted) setLoadError(error.message || "Gagal mengambil data proyek.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchExperiences()
      .then((data) => {
        if (isMounted) setExperiences(data);
      })
      .catch((error) => {
        console.error('Gagal mengambil data pengalaman:', error);
        if (isMounted) setExperienceError(error.message || 'Gagal mengambil data pengalaman.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingExperiences(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchAchievements()
      .then((data) => {
        if (isMounted) setAchievements(data);
      })
      .catch((error) => {
        console.error('Gagal mengambil pencapaian:', error);
        if (isMounted) setAchievementError(error.message || 'Gagal mengambil pencapaian.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingAchievements(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectAchievement = (achievement) => {
    setSelectedAchievementId(String(achievement.id));
    setAchievementForm({
      title: achievement.title || '',
      date: achievement.date || '',
      description: achievement.description || ''
    });
    setAchievementError('');
  };

  const handleNewAchievement = () => {
    setSelectedAchievementId('');
    setAchievementForm({ ...emptyAchievementForm });
    setAchievementError('');
  };

  const handleSaveAchievement = async (event) => {
    event.preventDefault();
    setIsSavingAchievement(true);
    setAchievementError('');

    try {
      const achievement = {
        id: selectedAchievementId || `achievement-${Date.now()}`,
        title: achievementForm.title.trim(),
        date: achievementForm.date.trim(),
        description: achievementForm.description.trim()
      };
      await saveAchievement(achievement);
      setAchievements(await fetchAchievements());
      setSelectedAchievementId(String(achievement.id));
      setAchievementError('Pencapaian berhasil disimpan.');
    } catch (error) {
      console.error('Gagal menyimpan pencapaian:', error);
      setAchievementError(error.message || 'Gagal menyimpan pencapaian.');
    } finally {
      setIsSavingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (achievement) => {
    if (!window.confirm(`Hapus pencapaian "${achievement.title}"?`)) return;

    try {
      await deleteAchievement(achievement.id);
      setAchievements(await fetchAchievements());
      if (String(achievement.id) === selectedAchievementId) handleNewAchievement();
      setAchievementError('Pencapaian berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus pencapaian:', error);
      setAchievementError(error.message || 'Gagal menghapus pencapaian.');
    }
  };

  const handleSelectExperience = (experience) => {
    setSelectedExperienceId(String(experience.id));
    setExperienceForm({
      organization: experience.organization || '',
      role: experience.role || '',
      date: experience.date || '',
      description: experience.description || '',
      detail: experience.detail || experience.description || '',
      contributions: (experience.contributions || []).join('\n'),
      activities: (experience.activities || []).map((activity) => ({
        ...activity,
        id: activity.id || createEmptyActivity().id,
        title: activity.title || '',
        description: activity.description || '',
        documentation: Array.isArray(activity.documentation)
          ? activity.documentation.filter((url) => !/^\[Ljava\.lang\.Object;@[\da-f]+$/i.test(url))
          : activity.documentation && !/^\[Ljava\.lang\.Object;@[\da-f]+$/i.test(activity.documentation)
            ? [activity.documentation]
            : []
      }))
    });
    setExperienceError('');
  };

  const handleNewExperience = () => {
    setSelectedExperienceId('');
    setExperienceForm(emptyExperienceForm);
    setExperienceError('');
  };

  const handleSaveExperience = async (event) => {
    event.preventDefault();
    setIsSavingExperience(true);
    setExperienceError('');

    try {
      const activities = experienceForm.activities
        .map((activity) => ({
          ...activity,
          title: activity.title.trim(),
          description: activity.description.trim(),
          documentation: activity.documentation.map((url) => url.trim()).filter(Boolean)
        }))
        .filter((activity) => activity.title || activity.description || activity.documentation.length)
        .map((activity) => {
          if (!activity.title) {
            throw new Error('Nama setiap subkegiatan yang diisi harus dilengkapi.');
          }

          const documentation = activity.documentation.map((link) => {
            let url;
            try {
              url = new URL(link);
            } catch {
              throw new Error(`Tautan dokumentasi subkegiatan "${activity.title}" tidak valid.`);
            }
            if (!['http:', 'https:'].includes(url.protocol)) {
              throw new Error(`Tautan dokumentasi subkegiatan "${activity.title}" harus menggunakan http atau https.`);
            }
            return url.href;
          });
          return { ...activity, documentation };
        });
      const experience = {
        id: selectedExperienceId || `custom-${Date.now()}`,
        organization: experienceForm.organization.trim(),
        role: experienceForm.role.trim(),
        date: experienceForm.date.trim(),
        description: experienceForm.description.trim(),
        detail: experienceForm.detail.trim(),
        contributions: experienceForm.contributions.split('\n').map((item) => item.trim()).filter(Boolean),
        activities
      };
      await saveExperience(experience);
      setExperiences(await fetchExperiences());
      setSelectedExperienceId(String(experience.id));
      setExperienceError('Perubahan pengalaman berhasil disimpan.');
    } catch (error) {
      console.error('Gagal menyimpan data pengalaman:', error);
      setExperienceError(error.message || 'Gagal menyimpan data pengalaman.');
    } finally {
      setIsSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (experience) => {
    if (!window.confirm(`Hapus pengalaman "${experience.organization}"?`)) return;

    try {
      await deleteExperience(experience.id);
      setExperiences(await fetchExperiences());
      if (String(experience.id) === selectedExperienceId) handleNewExperience();
      setExperienceError('Pengalaman berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus data pengalaman:', error);
      setExperienceError(error.message || 'Gagal menghapus data pengalaman.');
    }
  };

  // Tambah data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProjectActionError('');
    try {
      const projectPayload = { ...formData, thumbnail: formData.thumbnail.trim() };
      if (projectPayload.thumbnail) {
        let thumbnailUrl;
        try {
          thumbnailUrl = new URL(projectPayload.thumbnail);
        } catch {
          throw new Error('Tautan thumbnail tidak valid.');
        }
        if (!['http:', 'https:'].includes(thumbnailUrl.protocol)) {
          throw new Error('Tautan thumbnail harus menggunakan http atau https.');
        }
        projectPayload.thumbnail = thumbnailUrl.href;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // WAJIB ADA AGAR TIDAK KENA CORS
        },
        redirect: "follow", // WAJIB ADA karena Apps Script melakukan redirect
        body: JSON.stringify({
          action: selectedProjectId ? 'update' : 'create',
          ...(selectedProjectId ? { id: selectedProjectId } : {}),
          ...projectPayload
        })
      });
      if (!response.ok) throw new Error(`Gagal menambahkan proyek (HTTP ${response.status}).`);
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error(result.message || 'Google Sheets gagal menambahkan proyek.');
      }
      if (selectedProjectId) {
        setProjects((currentProjects) => currentProjects.map((project) => (
          String(project.id) === selectedProjectId
            ? { ...project, ...projectPayload, id: selectedProjectId }
            : project
        )));
        handleNewProject();
        setProjectActionError('Perubahan proyek berhasil disimpan.');
      } else {
        handleNewProject();
        setIsLoading(true);
        await loadProjects();
      }
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      setProjectActionError(error.message || 'Gagal menambahkan proyek.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Hapus data
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus proyek ini?")) return;
    setProjectActionError('');

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        redirect: "follow",
        body: JSON.stringify({ action: "delete", id })
      });
      if (!response.ok) throw new Error(`Gagal menghapus proyek (HTTP ${response.status}).`);
      const result = await response.json();
      if (result.status !== 'deleted') {
        throw new Error(result.message || 'Google Sheets gagal menghapus proyek.');
      }
      setProjects((currentProjects) => currentProjects.filter((project) => String(project.id) !== String(id)));
      if (String(id) === selectedProjectId) handleNewProject();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      setProjectActionError(error.message || "Gagal menghapus proyek.");
      setIsLoading(true);
      loadProjects();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}>
      {/* Judul admin */}
      <header className="admin-header" style={{ backgroundColor: 'var(--color-dark-blue)', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
          Panel Admin Dhanu
        </h1>
      </header>

      <div className="admin-layout">
        
        {/* Formulir proyek */}
        <div className="admin-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--color-dark-blue)' }}>
            {selectedProjectId ? 'Edit Proyek' : 'Tambah Proyek'}
          </h2>
          {projectActionError && (
            <p role={projectActionError.includes('berhasil') ? 'status' : 'alert'} className={projectActionError.includes('berhasil') ? 'admin-success' : 'admin-error'}>
              {projectActionError}
            </p>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input required placeholder="Nama proyek" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
            <input required placeholder="Kategori (mis. Pengembangan Web · React)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle} />
            <textarea required placeholder="Deskripsi" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={inputStyle} />
            <input placeholder="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={inputStyle} />
            <input type="url" placeholder="Tautan thumbnail (opsional, https://...)" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} style={inputStyle} />
            <input placeholder="Tautan GitHub" value={formData.githubLink} onChange={e => setFormData({...formData, githubLink: e.target.value})} style={inputStyle} />
            <input placeholder="Tautan demo langsung" value={formData.demoLink} onChange={e => setFormData({...formData, demoLink: e.target.value})} style={inputStyle} />
            
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: '16px', justifyContent: 'center' }}>
              {isSubmitting ? <Loader2 className="spin" size={18} /> : selectedProjectId ? <Pencil size={18} /> : <Plus size={18} />}
              {isSubmitting ? 'Menyimpan...' : selectedProjectId ? 'Simpan Perubahan' : 'Tambah Proyek'}
            </button>
            {selectedProjectId && (
              <button type="button" className="btn btn-outline" onClick={handleNewProject}>
                <X size={18} /> Batal mengedit
              </button>
            )}
          </form>
        </div>

        {/* Tabel proyek */}
        <div className="admin-panel">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--color-dark-blue)' }}>Kelola Proyek</h2>
          
          {isLoading ? (
            <p>Memuat data dari Google Sheets...</p>
          ) : loadError ? (
            <p role="alert" style={{ color: '#b91c1c' }}>{loadError}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Nama</th>
                    <th style={{ padding: '12px' }}>Kategori</th>
                    <th style={{ padding: '12px', width: '100px' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{p.title}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.category}</td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectProject(p)}
                          aria-label={`Edit ${p.title}`}
                          style={{ background: 'none', border: 'none', color: 'var(--color-dark-blue)', cursor: 'pointer', marginRight: '8px' }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button type="button" onClick={() => handleDelete(p.id)} aria-label={`Hapus ${p.title}`} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada proyek.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="admin-panel admin-experience-panel">
          <div className="admin-experience-heading">
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-dark-blue)' }}>
                Kelola Organisasi & Pengalaman
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Tambahkan pengalaman atau lengkapi kegiatan yang sudah ada dengan cerita, dokumentasi, dan subkegiatan.
              </p>
            </div>
            <button type="button" className="btn btn-outline" onClick={handleNewExperience}>
              <Plus size={18} /> Pengalaman Baru
            </button>
          </div>

          {experienceError && (
            <p role="status" className={experienceError.includes('berhasil') ? 'admin-success' : 'admin-error'}>
              {experienceError}
            </p>
          )}

          <div className="admin-experience-layout">
            <div>
              <h3 className="admin-subheading">Daftar pengalaman</h3>
              {isLoadingExperiences ? (
                <p>Memuat pengalaman dari Google Sheets...</p>
              ) : experienceError && experiences.length === 0 ? (
                <p role="alert" className="admin-error">{experienceError}</p>
              ) : experiences.length === 0 ? (
                <p>Belum ada pengalaman. Tambahkan melalui formulir.</p>
              ) : (
                <ul className="admin-experience-list">
                  {experiences.map((experience) => (
                    <li key={experience.id} className={String(experience.id) === selectedExperienceId ? 'is-selected' : ''}>
                      <button type="button" className="admin-experience-select" onClick={() => handleSelectExperience(experience)}>
                        <span>
                          <strong>{experience.organization}</strong>
                          <small>{experience.role} · {experience.date}</small>
                        </span>
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        aria-label={`Hapus ${experience.organization}`}
                        onClick={() => handleDeleteExperience(experience)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleSaveExperience} className="admin-experience-form">
              <h3 className="admin-subheading">{selectedExperienceId ? 'Ubah pengalaman' : 'Tambah pengalaman'}</h3>
              <div className="admin-form-grid">
                <input required placeholder="Nama organisasi / kegiatan" value={experienceForm.organization} onChange={(event) => setExperienceForm({ ...experienceForm, organization: event.target.value })} style={inputStyle} />
                <input required placeholder="Peran / jabatan" value={experienceForm.role} onChange={(event) => setExperienceForm({ ...experienceForm, role: event.target.value })} style={inputStyle} />
                <input required placeholder="Periode (mis. 2025 — 2026)" value={experienceForm.date} onChange={(event) => setExperienceForm({ ...experienceForm, date: event.target.value })} style={inputStyle} />
                <textarea required rows="3" placeholder="Keterangan singkat untuk halaman utama" value={experienceForm.description} onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })} style={inputStyle} />
                <textarea rows="5" placeholder="Cerita lengkap: apa yang dilalui, tanggung jawab, dan hasil kegiatan" value={experienceForm.detail} onChange={(event) => setExperienceForm({ ...experienceForm, detail: event.target.value })} style={inputStyle} />
                <textarea rows="4" placeholder={'Kontribusi (satu per baris)\nContoh: Mengoordinasikan anggota'} value={experienceForm.contributions} onChange={(event) => setExperienceForm({ ...experienceForm, contributions: event.target.value })} style={inputStyle} />
              </div>
              <div className="admin-activities">
                <div className="admin-activities-heading">
                  <div>
                    <h4>Subkegiatan</h4>
                    <p>Setiap subkegiatan memiliki keterangan dan dokumentasinya sendiri.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setExperienceForm({
                      ...experienceForm,
                      activities: [...experienceForm.activities, createEmptyActivity()]
                    })}
                  >
                    <Plus size={18} /> Tambah sub kegiatan
                  </button>
                </div>

                {experienceForm.activities.map((activity, index) => (
                  <fieldset className="admin-activity-card" key={activity.id}>
                    <legend>Subkegiatan {index + 1}</legend>
                    <button
                      type="button"
                      className="admin-icon-button admin-activity-remove"
                      aria-label={`Hapus subkegiatan ${index + 1}`}
                      onClick={() => setExperienceForm({
                        ...experienceForm,
                        activities: experienceForm.activities.filter((item) => item.id !== activity.id)
                      })}
                    >
                      <X size={18} />
                    </button>
                    <input
                      aria-label={`Nama subkegiatan ${index + 1}`}
                      placeholder="Nama subkegiatan"
                      value={activity.title}
                      onChange={(event) => setExperienceForm({
                        ...experienceForm,
                        activities: experienceForm.activities.map((item) => item.id === activity.id
                          ? { ...item, title: event.target.value }
                          : item)
                      })}
                      style={inputStyle}
                    />
                    <textarea
                      aria-label={`Keterangan subkegiatan ${index + 1}`}
                      rows="3"
                      placeholder="Keterangan subkegiatan"
                      value={activity.description}
                      onChange={(event) => setExperienceForm({
                        ...experienceForm,
                        activities: experienceForm.activities.map((item) => item.id === activity.id
                          ? { ...item, description: event.target.value }
                          : item)
                      })}
                      style={inputStyle}
                    />
                    <div className="admin-activity-documentation">
                      <strong>Dokumentasi kegiatan</strong>
                      {activity.documentation.map((url, linkIndex) => (
                        <div className="admin-documentation-link-row" key={`${activity.id}-documentation-${linkIndex}`}>
                          <input
                            aria-label={`Tautan dokumentasi ${linkIndex + 1} subkegiatan ${index + 1}`}
                            type="url"
                            placeholder="Tautan dokumentasi (https://...)"
                            value={url}
                            onChange={(event) => setExperienceForm({
                              ...experienceForm,
                              activities: experienceForm.activities.map((item) => item.id === activity.id
                                ? {
                                    ...item,
                                    documentation: item.documentation.map((link, itemIndex) => itemIndex === linkIndex
                                      ? event.target.value
                                      : link)
                                  }
                                : item)
                            })}
                            style={inputStyle}
                          />
                          <button
                            type="button"
                            className="admin-icon-button"
                            aria-label={`Hapus tautan dokumentasi ${linkIndex + 1} subkegiatan ${index + 1}`}
                            onClick={() => setExperienceForm({
                              ...experienceForm,
                              activities: experienceForm.activities.map((item) => item.id === activity.id
                                ? { ...item, documentation: item.documentation.filter((_, itemIndex) => itemIndex !== linkIndex) }
                                : item)
                            })}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline admin-add-documentation"
                        onClick={() => setExperienceForm({
                          ...experienceForm,
                          activities: experienceForm.activities.map((item) => item.id === activity.id
                            ? { ...item, documentation: [...item.documentation, ''] }
                            : item)
                        })}
                      >
                        <Plus size={16} /> Tambah tautan dokumentasi
                      </button>
                    </div>
                  </fieldset>
                ))}
              </div>

              <button type="submit" disabled={isSavingExperience} className="btn btn-primary">
                {isSavingExperience ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                {isSavingExperience ? 'Menyimpan...' : 'Simpan Pengalaman'}
              </button>
              {selectedExperienceId && (
                <button type="button" className="btn btn-outline" onClick={handleNewExperience}>
                  <X size={18} /> Batal mengubah
                </button>
              )}
            </form>
          </div>
        </section>

        <section className="admin-panel admin-experience-panel">
          <div className="admin-experience-heading">
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-dark-blue)' }}>
                Kelola Pencapaian
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Tambahkan, edit, atau hapus pencapaian yang ditampilkan di halaman utama.
              </p>
            </div>
            <button type="button" className="btn btn-outline" onClick={handleNewAchievement}>
              <Plus size={18} /> Pencapaian Baru
            </button>
          </div>

          {achievementError && (
            <p role={achievementError.includes('berhasil') ? 'status' : 'alert'} className={achievementError.includes('berhasil') ? 'admin-success' : 'admin-error'}>
              {achievementError}
            </p>
          )}

          <div className="admin-experience-layout">
            <div>
              <h3 className="admin-subheading">Daftar pencapaian</h3>
              {isLoadingAchievements ? (
                <p>Memuat pencapaian dari Google Sheets...</p>
              ) : achievementError && achievements.length === 0 ? (
                <p role="alert" className="admin-error">{achievementError}</p>
              ) : achievements.length === 0 ? (
                <p>Belum ada pencapaian. Tambahkan melalui formulir.</p>
              ) : (
                <ul className="admin-experience-list">
                  {achievements.map((achievement) => (
                    <li key={achievement.id} className={String(achievement.id) === selectedAchievementId ? 'is-selected' : ''}>
                      <button type="button" className="admin-experience-select" onClick={() => handleSelectAchievement(achievement)}>
                        <span>
                          <strong>{achievement.title}</strong>
                          <small>{achievement.date}</small>
                        </span>
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        aria-label={`Hapus pencapaian ${achievement.title}`}
                        onClick={() => handleDeleteAchievement(achievement)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleSaveAchievement} className="admin-experience-form">
              <h3 className="admin-subheading">{selectedAchievementId ? 'Ubah pencapaian' : 'Tambah pencapaian'}</h3>
              <div className="admin-form-grid">
                <input
                  required
                  placeholder="Nama pencapaian"
                  value={achievementForm.title}
                  onChange={(event) => setAchievementForm({ ...achievementForm, title: event.target.value })}
                  style={inputStyle}
                />
                <input
                  required
                  placeholder="Tahun / tanggal"
                  value={achievementForm.date}
                  onChange={(event) => setAchievementForm({ ...achievementForm, date: event.target.value })}
                  style={inputStyle}
                />
                <textarea
                  required
                  rows="4"
                  placeholder="Keterangan pencapaian"
                  value={achievementForm.description}
                  onChange={(event) => setAchievementForm({ ...achievementForm, description: event.target.value })}
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={isSavingAchievement} className="btn btn-primary">
                {isSavingAchievement ? <Loader2 className="spin" size={18} /> : selectedAchievementId ? <Pencil size={18} /> : <Plus size={18} />}
                {isSavingAchievement ? 'Menyimpan...' : selectedAchievementId ? 'Simpan Perubahan' : 'Simpan Pencapaian'}
              </button>
              {selectedAchievementId && (
                <button type="button" className="btn btn-outline" onClick={handleNewAchievement}>
                  <X size={18} /> Batal mengedit
                </button>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

// Gaya input formulir
const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none'
};