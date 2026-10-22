import { ACHIEVEMENTS } from './content';
import { getSupabaseClient } from '../lib/supabaseClient';

function mergeAchievements(remoteAchievements, hiddenIds) {
  const remoteById = new Map(remoteAchievements.map((achievement) => [String(achievement.id), achievement]));
  const defaultIds = new Set(ACHIEVEMENTS.map((achievement) => String(achievement.id)));
  const defaults = ACHIEVEMENTS
    .filter((achievement) => !hiddenIds.has(String(achievement.id)))
    .map((achievement) => ({
      ...achievement,
      ...remoteById.get(String(achievement.id))
    }));
  const additions = remoteAchievements.filter((achievement) => (
    !defaultIds.has(String(achievement.id)) && !hiddenIds.has(String(achievement.id))
  ));

  return [...defaults, ...additions];
}

export async function fetchAchievements() {
  const client = getSupabaseClient();
  const [achievementResult, hiddenResult] = await Promise.all([
    client
      .from('achievements')
      .select('id, title, date, description, thumbnail, detail, documentation, created_at')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true }),
    client
      .from('hidden_default_content')
      .select('content_id')
      .eq('entity_type', 'achievement')
  ]);

  if (achievementResult.error) {
    throw new Error(`Gagal mengambil pencapaian dari Supabase: ${achievementResult.error.message}`);
  }
  if (hiddenResult.error) {
    throw new Error(`Gagal mengambil status penghapusan pencapaian dari Supabase: ${hiddenResult.error.message}`);
  }

  const remoteAchievements = achievementResult.data.map((achievement) => ({
    id: String(achievement.id),
    title: achievement.title,
    date: achievement.date,
    description: achievement.description,
    thumbnail: achievement.thumbnail || '',
    detail: achievement.detail || achievement.description,
    documentation: achievement.documentation || []
  }));
  const hiddenIds = new Set(hiddenResult.data.map((item) => String(item.content_id)));

  return mergeAchievements(remoteAchievements, hiddenIds);
}

export async function saveAchievement(achievement) {
  const { error } = await getSupabaseClient().rpc('save_achievement', {
    p_id: String(achievement.id),
    p_title: achievement.title.trim(),
    p_date: achievement.date.trim(),
    p_description: achievement.description.trim(),
    p_thumbnail: achievement.thumbnail || '',
    p_detail: achievement.detail || '',
    p_documentation: achievement.documentation || []
  });

  if (error) {
    throw new Error(`Gagal menyimpan pencapaian ke Supabase: ${error.message}`);
  }
}

export async function deleteAchievement(id) {
  const defaultIds = new Set(ACHIEVEMENTS.map((achievement) => String(achievement.id)));
  const { error } = await getSupabaseClient().rpc('delete_achievement', {
    p_id: String(id),
    p_hide_default: defaultIds.has(String(id))
  });

  if (error) {
    throw new Error(`Gagal menghapus pencapaian dari Supabase: ${error.message}`);
  }
}
