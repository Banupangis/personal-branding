import { ACHIEVEMENTS } from './content';
import { API_URL } from './projectsApi';

function mergeAchievements(remoteData) {
  if (remoteData && remoteData.status === 'error') {
    throw new Error(remoteData.message || 'Google Sheets gagal mengambil data pencapaian.');
  }
  if (!remoteData || !Array.isArray(remoteData.achievements) || !Array.isArray(remoteData.deletedIds)) {
    throw new Error('Format data pencapaian dari Google Sheets tidak valid.');
  }

  const remoteById = new Map(remoteData.achievements.map((achievement) => [String(achievement.id), achievement]));
  const deletedIds = new Set(remoteData.deletedIds.map(String));
  const defaultIds = new Set(ACHIEVEMENTS.map((achievement) => String(achievement.id)));
  const defaults = ACHIEVEMENTS
    .filter((achievement) => !deletedIds.has(String(achievement.id)))
    .map((achievement) => ({
      ...achievement,
      ...remoteById.get(String(achievement.id))
    }));
  const additions = remoteData.achievements.filter((achievement) => !defaultIds.has(String(achievement.id)));

  return [...defaults, ...additions.filter((achievement) => !deletedIds.has(String(achievement.id)))];
}

async function postAchievement(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'follow',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gagal menyimpan pencapaian (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (result.status !== 'success' && result.status !== 'deleted') {
    throw new Error(result.message || 'Google Sheets gagal memproses pencapaian.');
  }
  return result;
}

export async function fetchAchievements() {
  const response = await fetch(`${API_URL}?type=achievements`);
  if (!response.ok) {
    throw new Error(`Gagal mengambil pencapaian (HTTP ${response.status}).`);
  }

  return mergeAchievements(await response.json());
}

export function saveAchievement(achievement) {
  return postAchievement({ action: 'saveAchievement', achievement });
}

export function deleteAchievement(id) {
  return postAchievement({ action: 'deleteAchievement', id: String(id) });
}
