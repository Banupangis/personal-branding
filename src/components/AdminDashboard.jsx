import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, Pencil, X } from 'lucide-react';
import { deleteProject, fetchProjects, saveProject } from '../data/projectsApi';
import { deleteExperience, fetchExperiences, saveExperience } from '../data/experienceApi';
import { deleteAchievement, fetchAchievements, saveAchievement } from '../data/achievementsApi';
import {
  getDocumentationImageUrl,
  isStoredDocumentationImage,
  removeDocumentationImages,
  uploadAchievementImage,
  uploadDocumentationImage
} from '../data/documentationStorage';
import { getSupabaseClient } from '../lib/supabaseClient';

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
  description: '',
  thumbnail: '',
  detail: '',
  documentation: []
};

function AdminContent({ onSignOut, signOutError }) {
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
  const [uploadedDocumentation, setUploadedDocumentation] = useState([]);
  const [documentationImageSizes, setDocumentationImageSizes] = useState({});
  const [isUploadingDocumentation, setIsUploadingDocumentation] = useState(false);
  const [achievementForm, setAchievementForm] = useState(emptyAchievementForm);
  const [uploadedAchievementImages, setUploadedAchievementImages] = useState([]);
  const [achievementImageSizes, setAchievementImageSizes] = useState({});
  const [isUploadingAchievementImage, setIsUploadingAchievementImage] = useState(false);

  // Status formulir
  const [formData, setFormData] = useState(emptyProjectForm);

  const clearImageSizes = (references, setSizes) => {
    if (!references.length) return;
    setSizes((current) => {
      const next = { ...current };
      references.forEach((reference) => delete next[reference]);
      return next;
    });
  };

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

  useEffect(() => {
    let isMounted = true;

    fetchProjects()
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
    if (isUploadingAchievementImage) return;
    void (async () => {
      if (!await discardUnsavedAchievementImages()) return;
      setSelectedAchievementId(String(achievement.id));
      setAchievementForm({
        title: achievement.title || '',
        date: achievement.date || '',
        description: achievement.description || '',
        thumbnail: achievement.thumbnail || '',
        detail: achievement.detail || achievement.description || '',
        documentation: Array.isArray(achievement.documentation) ? achievement.documentation : []
      });
      setAchievementError('');
    })();
  };

  const discardUnsavedAchievementImages = async () => {
    if (!uploadedAchievementImages.length) return true;
    try {
      await removeDocumentationImages(uploadedAchievementImages);
      setUploadedAchievementImages([]);
      clearImageSizes(uploadedAchievementImages, setAchievementImageSizes);
      return true;
    } catch (error) {
      setAchievementError(error.message || 'Gagal membersihkan gambar yang belum disimpan.');
      return false;
    }
  };

  const removeUnsavedAchievementImage = async (reference) => {
    if (!uploadedAchievementImages.includes(reference)) return;
    try {
      await removeDocumentationImages([reference]);
      setUploadedAchievementImages((current) => current.filter((item) => item !== reference));
      clearImageSizes([reference], setAchievementImageSizes);
    } catch (error) {
      setAchievementError(error.message || 'Gagal menghapus gambar yang belum disimpan.');
    }
  };

  const handleNewAchievement = async () => {
    if (isUploadingAchievementImage || !await discardUnsavedAchievementImages()) return;
    setSelectedAchievementId('');
    setAchievementForm({ ...emptyAchievementForm });
    setAchievementError('');
  };

  const handleSaveAchievement = async (event) => {
    event.preventDefault();
    setIsSavingAchievement(true);
    setAchievementError('');

    let achievementWasSaved = false;
    try {
      const existingAchievement = achievements.find((item) => String(item.id) === selectedAchievementId);
      const thumbnail = achievementForm.thumbnail.trim();
      if (thumbnail && !isStoredDocumentationImage(thumbnail)) {
        let thumbnailUrl;
        try { thumbnailUrl = new URL(thumbnail); } catch { throw new Error('Tautan thumbnail tidak valid.'); }
        if (!['http:', 'https:'].includes(thumbnailUrl.protocol)) throw new Error('Tautan thumbnail harus menggunakan http atau https.');
      }
      const documentation = achievementForm.documentation.filter(Boolean);
      const retainedImages = new Set([thumbnail, ...documentation]);
      const removedImages = [existingAchievement?.thumbnail, ...(existingAchievement?.documentation || [])]
        .filter((reference) => reference && !retainedImages.has(reference));
      const achievement = {
        id: selectedAchievementId || `achievement-${Date.now()}`,
        title: achievementForm.title.trim(),
        date: achievementForm.date.trim(),
        description: achievementForm.description.trim(),
        thumbnail,
        detail: achievementForm.detail.trim(),
        documentation
      };
      await saveAchievement(achievement);
      achievementWasSaved = true;
      setAchievements(await fetchAchievements());
      setSelectedAchievementId(String(achievement.id));
      setUploadedAchievementImages([]);
      if (removedImages.length) await removeDocumentationImages(removedImages);
      setAchievementError('Pencapaian berhasil disimpan.');
    } catch (error) {
      console.error('Gagal menyimpan pencapaian:', error);
      setAchievementError(achievementWasSaved
        ? `Pencapaian tersimpan, tetapi operasi lanjutan gagal: ${error.message}`
        : error.message || 'Gagal menyimpan pencapaian.');
      if (!achievementWasSaved && uploadedAchievementImages.length) {
        try {
          await removeDocumentationImages(uploadedAchievementImages);
          clearImageSizes(uploadedAchievementImages, setAchievementImageSizes);
          const removedUploads = new Set(uploadedAchievementImages);
          setAchievementForm((current) => ({
            ...current,
            thumbnail: removedUploads.has(current.thumbnail) ? '' : current.thumbnail,
            documentation: current.documentation.filter((reference) => !removedUploads.has(reference))
          }));
          setUploadedAchievementImages([]);
      clearImageSizes(uploadedAchievementImages, setAchievementImageSizes);
        } catch (cleanupError) {
          setAchievementError(`${error.message || 'Gagal menyimpan pencapaian.'} ${cleanupError.message}`);
        }
      }
    } finally {
      setIsSavingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (achievement) => {
    if (!window.confirm(`Hapus pencapaian "${achievement.title}"?`)) return;
    if (isUploadingAchievementImage || !await discardUnsavedAchievementImages()) return;

    try {
      await deleteAchievement(achievement.id);
      setAchievements(await fetchAchievements());
      if (String(achievement.id) === selectedAchievementId) handleNewAchievement();
      try {
        await removeDocumentationImages([achievement.thumbnail, ...(achievement.documentation || [])].filter(isStoredDocumentationImage));
      } catch (error) {
        setAchievementError(`Pencapaian terhapus, tetapi gambar gagal dihapus: ${error.message}`);
        return;
      }
      setAchievementError('Pencapaian berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus pencapaian:', error);
      setAchievementError(error.message || 'Gagal menghapus pencapaian.');
    }
  };

  const handleUploadAchievementImage = async (file, destination) => {
    if (!file) return;
    setIsUploadingAchievementImage(true);
    setAchievementError('');
    try {
      const upload = await uploadAchievementImage(file);
      const { reference } = upload;
      setAchievementForm((current) => ({
        ...current,
        ...(destination === 'thumbnail'
          ? { thumbnail: reference }
          : { documentation: [...current.documentation, reference] })
      }));
      setUploadedAchievementImages((current) => [...current, reference]);
      setAchievementImageSizes((current) => ({ ...current, [reference]: upload }));
    } catch (error) {
      setAchievementError(error.message || 'Gagal mengunggah gambar pencapaian.');
    } finally {
      setIsUploadingAchievementImage(false);
    }
  };

  const discardUnsavedDocumentation = async () => {
    if (!uploadedDocumentation.length) return true;
    try {
      await removeDocumentationImages(uploadedDocumentation);
      setUploadedDocumentation([]);
      clearImageSizes(uploadedDocumentation, setDocumentationImageSizes);
      return true;
    } catch (error) {
      console.error('Gagal membersihkan gambar yang belum disimpan:', error);
      setExperienceError(error.message || 'Gagal membersihkan gambar yang belum disimpan.');
      return false;
    }
  };

  const handleSelectExperience = async (experience) => {
    if (isUploadingDocumentation) return;
    if (!await discardUnsavedDocumentation()) return;
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

  const handleNewExperience = async () => {
    if (isUploadingDocumentation) return;
    if (!await discardUnsavedDocumentation()) return;
    setSelectedExperienceId('');
    setExperienceForm(emptyExperienceForm);
    setExperienceError('');
  };

  const handleUploadDocumentation = async (activityId, file) => {
    if (!file) return;

    setIsUploadingDocumentation(true);
    setExperienceError('');
    try {
      const upload = await uploadDocumentationImage(file);
      const { reference } = upload;
      setExperienceForm((current) => ({
        ...current,
        activities: current.activities.map((activity) => (
          activity.id === activityId
            ? { ...activity, documentation: [...activity.documentation, reference] }
            : activity
        ))
      }));
      setUploadedDocumentation((current) => [...current, reference]);
      setDocumentationImageSizes((current) => ({ ...current, [reference]: upload }));
    } catch (error) {
      console.error('Gagal mengunggah gambar dokumentasi:', error);
      setExperienceError(error.message || 'Gagal mengunggah gambar dokumentasi.');
    } finally {
      setIsUploadingDocumentation(false);
    }
  };

  const handleSaveExperience = async (event) => {
    event.preventDefault();
    setIsSavingExperience(true);
    setExperienceError('');
    let experienceWasSaved = false;

    try {
      const activities = experienceForm.activities
        .map((activity) => ({
          ...activity,
          title: activity.title.trim(),
          description: activity.description.trim(),
          documentation: activity.documentation.filter(Boolean)
        }))
        .filter((activity) => activity.title || activity.description || activity.documentation.length)
        .map((activity) => {
          if (!activity.title) {
            throw new Error('Nama setiap subkegiatan yang diisi harus dilengkapi.');
          }

          return activity;
        });
      const existingExperience = experiences.find(
        (item) => String(item.id) === selectedExperienceId
      );
      const retainedDocumentation = new Set(
        activities.flatMap((activity) => activity.documentation)
      );
      const removedDocumentation = (existingExperience?.activities || [])
        .flatMap((activity) => activity.documentation || [])
        .filter((reference) => !retainedDocumentation.has(reference));
      const unretainedUploads = uploadedDocumentation.filter(
        (reference) => !retainedDocumentation.has(reference)
      );
      const experience = {
        id: selectedExperienceId || `custom-${Date.now()}`,
        link: existingExperience?.link || '',
        organization: experienceForm.organization.trim(),
        role: experienceForm.role.trim(),
        date: experienceForm.date.trim(),
        description: experienceForm.description.trim(),
        detail: experienceForm.detail.trim(),
        contributions: experienceForm.contributions.split('\n').map((item) => item.trim()).filter(Boolean),
        activities
      };
      await saveExperience(experience);
      experienceWasSaved = true;
      setExperiences(await fetchExperiences());
      setSelectedExperienceId(String(experience.id));
      setUploadedDocumentation([]);
      clearImageSizes(uploadedDocumentation, setDocumentationImageSizes);
      try {
        await removeDocumentationImages([...removedDocumentation, ...unretainedUploads]);
      } catch (error) {
        console.error('Data tersimpan, tetapi gambar lama gagal dihapus:', error);
        setExperienceError(`Perubahan tersimpan, tetapi gambar lama gagal dihapus: ${error.message}`);
        return;
      }
      setExperienceError('Perubahan pengalaman berhasil disimpan.');
    } catch (error) {
      console.error('Gagal menyimpan data pengalaman:', error);
      setExperienceError(experienceWasSaved
        ? `Perubahan tersimpan, tetapi gagal memuat ulang data: ${error.message}`
        : error.message || 'Gagal menyimpan data pengalaman.');
      if (experienceWasSaved) {
        setUploadedDocumentation([]);
      } else if (uploadedDocumentation.length) {
        try {
          await removeDocumentationImages(uploadedDocumentation);
          clearImageSizes(uploadedDocumentation, setDocumentationImageSizes);
          setExperienceForm((current) => ({
            ...current,
            activities: current.activities.map((activity) => ({
              ...activity,
              documentation: activity.documentation.filter(
                (reference) => !uploadedDocumentation.includes(reference)
              )
            }))
          }));
          setUploadedDocumentation([]);
        } catch (cleanupError) {
          console.error('Gagal membersihkan gambar yang belum tersimpan:', cleanupError);
          setExperienceError(
            `${error.message || 'Gagal menyimpan data pengalaman.'} ${cleanupError.message}`
          );
        }
      }
    } finally {
      setIsSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (experience) => {
    if (!window.confirm(`Hapus pengalaman "${experience.organization}"?`)) return;
    if (!await discardUnsavedDocumentation()) return;

    try {
      await deleteExperience(experience.id);
      setExperiences((current) => current.filter((item) => String(item.id) !== String(experience.id)));
      if (String(experience.id) === selectedExperienceId) await handleNewExperience();
      const documentation = (experience.activities || [])
        .flatMap((activity) => activity.documentation || [])
        .filter(isStoredDocumentationImage);
      try {
        await removeDocumentationImages(documentation);
      } catch (error) {
        console.error('Pengalaman terhapus, tetapi gambar dokumentasi gagal dihapus:', error);
        setExperienceError(`Pengalaman terhapus, tetapi gambar gagal dihapus: ${error.message}`);
      }
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

      const savedProject = await saveProject({
        ...projectPayload,
        ...(selectedProjectId ? { id: selectedProjectId } : {})
      });
      if (selectedProjectId) {
        setProjects((currentProjects) => currentProjects.map((project) => (
          String(project.id) === selectedProjectId
            ? savedProject
            : project
        )));
        handleNewProject();
        setProjectActionError('Perubahan proyek berhasil disimpan.');
      } else {
        setProjects((currentProjects) => [...currentProjects, savedProject]);
        handleNewProject();
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
      await deleteProject(id);
      setProjects((currentProjects) => currentProjects.filter((project) => String(project.id) !== String(id)));
      if (String(id) === selectedProjectId) handleNewProject();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      setProjectActionError(error.message || "Gagal menghapus proyek.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}>
      {/* Judul admin */}
      <header
        className="admin-header"
        style={{
          backgroundColor: 'var(--color-dark-blue)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
          Panel Admin Dhanu
        </h1>
        <button type="button" className="btn btn-outline" onClick={onSignOut}>
          Keluar
        </button>
      </header>
      {signOutError && <p role="alert" className="admin-error">{signOutError}</p>}

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
            <p>Memuat data proyek...</p>
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
                <p>Memuat pengalaman...</p>
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
                      {activity.documentation.map((reference, linkIndex) => (
                        <div className="admin-documentation-image-row" key={`${activity.id}-documentation-${linkIndex}`}>
                          {isStoredDocumentationImage(reference) ? (
                            <img
                              src={getDocumentationImageUrl(reference)}
                              alt={`Dokumentasi ${linkIndex + 1} subkegiatan ${index + 1}`}
                            />
                          ) : (
                            <a href={reference} target="_blank" rel="noreferrer">
                              Dokumentasi lama (tautan)
                            </a>
                          )}
                          {documentationImageSizes[reference] && (
                            <small className="admin-image-size">
                              {formatFileSize(documentationImageSizes[reference].originalSize)} → {formatFileSize(documentationImageSizes[reference].uploadedSize)}
                              {documentationImageSizes[reference].wasCompressed ? ' (dikompres)' : ' (ukuran tetap)'}
                            </small>
                          )}
                          <button
                            type="button"
                            className="admin-icon-button"
                            aria-label={`Hapus gambar dokumentasi ${linkIndex + 1} subkegiatan ${index + 1}`}
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
                      <label className="btn btn-outline admin-add-documentation">
                        <Plus size={16} /> Tambah gambar
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          aria-label={`Unggah gambar dokumentasi subkegiatan ${index + 1}`}
                          disabled={isUploadingDocumentation || isSavingExperience}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            void handleUploadDocumentation(activity.id, file);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      <small>JPG, PNG, WebP, atau GIF; maksimal 5 MB per gambar.</small>
                    </div>
                  </fieldset>
                ))}
              </div>

              <button type="submit" disabled={isSavingExperience || isUploadingDocumentation} className="btn btn-primary">
                {isSavingExperience || isUploadingDocumentation ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                {isUploadingDocumentation ? 'Mengunggah gambar...' : isSavingExperience ? 'Menyimpan...' : 'Simpan Pengalaman'}
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
          <button type="button" className="btn btn-outline" onClick={handleNewAchievement} disabled={isUploadingAchievementImage || isSavingAchievement}>
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
                <p>Memuat pencapaian...</p>
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
                <textarea
                  rows="6"
                  placeholder="Cerita lengkap pencapaian: proses, peran, dan hasil"
                  value={achievementForm.detail}
                  onChange={(event) => setAchievementForm({ ...achievementForm, detail: event.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="admin-activity-documentation">
                <strong>Thumbnail pencapaian</strong>
                {achievementForm.thumbnail && (
                  <div className="admin-documentation-image-row">
                    <img
                      src={getDocumentationImageUrl(achievementForm.thumbnail)}
                      alt="Thumbnail pencapaian"
                    />
                    {achievementImageSizes[achievementForm.thumbnail] && (
                      <small className="admin-image-size">
                        {formatFileSize(achievementImageSizes[achievementForm.thumbnail].originalSize)} → {formatFileSize(achievementImageSizes[achievementForm.thumbnail].uploadedSize)}
                        {achievementImageSizes[achievementForm.thumbnail].wasCompressed ? ' (dikompres)' : ' (ukuran tetap)'}
                      </small>
                    )}
                    <button
                      type="button"
                      className="admin-icon-button"
                      aria-label="Hapus thumbnail pencapaian"
                      onClick={() => {
                        const reference = achievementForm.thumbnail;
                        setAchievementForm({ ...achievementForm, thumbnail: '' });
                        void removeUnsavedAchievementImage(reference);
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                <label className="btn btn-outline admin-add-documentation">
                  <Plus size={16} /> Unggah thumbnail
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Unggah thumbnail pencapaian"
                    disabled={isUploadingAchievementImage || isSavingAchievement}
                    onChange={(event) => {
                      void handleUploadAchievementImage(event.target.files?.[0], 'thumbnail');
                      event.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="url"
                  placeholder="Atau tautan thumbnail (https://...)"
                  value={isStoredDocumentationImage(achievementForm.thumbnail) ? '' : achievementForm.thumbnail}
                  onChange={(event) => setAchievementForm({ ...achievementForm, thumbnail: event.target.value })}
                  style={inputStyle}
                />
                <small>JPG, PNG, WebP, atau GIF; maksimal 5 MB per gambar.</small>
              </div>
              <div className="admin-activity-documentation">
                <strong>Dokumentasi pencapaian</strong>
                {achievementForm.documentation.map((reference, index) => (
                  <div className="admin-documentation-image-row" key={`achievement-documentation-${index}`}>
                    {isStoredDocumentationImage(reference) ? (
                      <img src={getDocumentationImageUrl(reference)} alt={`Dokumentasi pencapaian ${index + 1}`} />
                    ) : (
                      <a href={reference} target="_blank" rel="noreferrer">Dokumentasi lama (tautan)</a>
                    )}
                    {achievementImageSizes[reference] && (
                      <small className="admin-image-size">
                        {formatFileSize(achievementImageSizes[reference].originalSize)} → {formatFileSize(achievementImageSizes[reference].uploadedSize)}
                        {achievementImageSizes[reference].wasCompressed ? ' (dikompres)' : ' (ukuran tetap)'}
                      </small>
                    )}
                    <button
                      type="button"
                      className="admin-icon-button"
                      aria-label={`Hapus dokumentasi pencapaian ${index + 1}`}
                      onClick={() => {
                        setAchievementForm({
                          ...achievementForm,
                          documentation: achievementForm.documentation.filter((_, itemIndex) => itemIndex !== index)
                        });
                        void removeUnsavedAchievementImage(reference);
                      }}
                    ><X size={18} /></button>
                  </div>
                ))}
                <label className="btn btn-outline admin-add-documentation">
                  <Plus size={16} /> Tambah gambar
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Unggah dokumentasi pencapaian"
                    disabled={isUploadingAchievementImage || isSavingAchievement}
                    onChange={(event) => {
                      void handleUploadAchievementImage(event.target.files?.[0], 'documentation');
                      event.target.value = '';
                    }}
                  />
                </label>
                <small>JPG, PNG, WebP, atau GIF; maksimal 5 MB per gambar.</small>
              </div>
              <button type="submit" disabled={isSavingAchievement || isUploadingAchievementImage} className="btn btn-primary">
                {isSavingAchievement || isUploadingAchievementImage ? <Loader2 className="spin" size={18} /> : selectedAchievementId ? <Pencil size={18} /> : <Plus size={18} />}
                {isUploadingAchievementImage ? 'Mengunggah gambar...' : isSavingAchievement ? 'Menyimpan...' : selectedAchievementId ? 'Simpan Perubahan' : 'Simpan Pencapaian'}
              </button>
              {selectedAchievementId && (
                <button type="button" className="btn btn-outline" onClick={handleNewAchievement} disabled={isUploadingAchievementImage || isSavingAchievement}>
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

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [clientError] = useState(() => {
    try {
      getSupabaseClient();
      return '';
    } catch (error) {
      return error.message || 'Konfigurasi Supabase belum tersedia.';
    }
  });
  const [isCheckingSession, setIsCheckingSession] = useState(!clientError);
  const [adminCheck, setAdminCheck] = useState({ accessToken: '', isAdmin: false, error: '' });
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (clientError) return undefined;

    let isMounted = true;
    const client = getSupabaseClient();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setAuthError('');
      }
    });

    client.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (isMounted) setSession(data.session);
      })
      .catch((error) => {
        if (isMounted) setAuthError(`Gagal memeriksa sesi: ${error.message}`);
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clientError]);

  useEffect(() => {
    if (!session || clientError) return undefined;

    let isMounted = true;
    const accessToken = session.access_token;

    getSupabaseClient().rpc('is_admin')
      .then(({ data, error }) => {
        if (error) throw error;
        if (isMounted) setAdminCheck({ accessToken, isAdmin: data === true, error: '' });
      })
      .catch((error) => {
        if (isMounted) {
          setAdminCheck({
            accessToken,
            isAdmin: false,
            error: `Gagal memverifikasi hak admin: ${error.message}`
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session, clientError]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError('');

    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
      setPassword('');
    } catch (error) {
      setAuthError(`Gagal masuk: ${error.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError('');
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
    } catch (error) {
      setAuthError(`Gagal keluar: ${error.message}`);
    }
  };

  const hasAdminCheck = session && adminCheck.accessToken === session.access_token;

  if (!clientError && (isCheckingSession || (session && !hasAdminCheck))) {
    return <main className="container" style={{ padding: '64px 24px' }}>Memeriksa sesi admin...</main>;
  }

  if (!session) {
    return (
      <main className="container" style={{ maxWidth: '440px', padding: '64px 24px' }}>
        <section className="admin-panel">
          <h1 style={{ marginTop: 0, color: 'var(--color-dark-blue)' }}>Masuk ke panel admin</h1>
          <p>Gunakan akun yang telah diizinkan sebagai administrator.</p>
          {(clientError || authError) && <p role="alert" className="admin-error">{clientError || authError}</p>}
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
              />
            </label>
            <label>
              Kata sandi
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSigningIn || Boolean(clientError)}
            >
              {isSigningIn ? <Loader2 className="spin" size={18} /> : null}
              {isSigningIn ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!adminCheck.isAdmin) {
    return (
      <main className="container" style={{ maxWidth: '560px', padding: '64px 24px' }}>
        <section className="admin-panel">
          <h1 style={{ marginTop: 0, color: 'var(--color-dark-blue)' }}>Akses admin tidak tersedia</h1>
          <p>Akun ini belum tercantum dalam allowlist administrator Supabase.</p>
          {(adminCheck.error || authError) && (
            <p role="alert" className="admin-error">{adminCheck.error || authError}</p>
          )}
          <button type="button" className="btn btn-outline" onClick={handleSignOut}>Keluar</button>
        </section>
      </main>
    );
  }

  return <AdminContent onSignOut={handleSignOut} signOutError={authError} />;
}
