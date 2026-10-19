import { EXPERIENCE } from './content';
import { API_URL } from './projectsApi';

const EXPERIENCE_QUERY = '?type=experiences';

function mergeExperiences(remoteData) {
  if (remoteData && remoteData.status === 'error') {
    throw new Error(remoteData.message || 'Google Sheets gagal mengambil data pengalaman.');
  }
  if (!remoteData || !Array.isArray(remoteData.experiences) || !Array.isArray(remoteData.deletedIds)) {
    throw new Error('Format data pengalaman dari Google Sheets tidak valid.');
  }

  const remoteById = new Map(remoteData.experiences.map((experience) => [String(experience.id), experience]));
  const deletedIds = new Set(remoteData.deletedIds.map(String));
  const defaultIds = new Set(EXPERIENCE.map((experience) => String(experience.id)));
  const defaults = EXPERIENCE
    .filter((experience) => !deletedIds.has(String(experience.id)))
    .map((experience) => ({
      ...experience,
      detail: experience.description,
      activities: [],
      ...remoteById.get(String(experience.id))
    }));
  const additions = remoteData.experiences.filter((experience) => !defaultIds.has(String(experience.id)));

  return [...defaults, ...additions.filter((experience) => !deletedIds.has(String(experience.id)))];
}

async function postExperience(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'follow',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gagal menyimpan data pengalaman (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (result.status !== 'success' && result.status !== 'deleted') {
    throw new Error(result.message || 'Google Sheets gagal memproses data pengalaman.');
  }
}

export async function fetchExperiences() {
  const response = await fetch(`${API_URL}${EXPERIENCE_QUERY}`);
  if (!response.ok) {
    throw new Error(`Gagal mengambil data pengalaman (HTTP ${response.status}).`);
  }

  return mergeExperiences(await response.json());
}

export function saveExperience(experience) {
  return postExperience({ action: 'saveExperience', experience });
}

export function deleteExperience(id) {
  return postExperience({ action: 'deleteExperience', id: String(id) });
}
