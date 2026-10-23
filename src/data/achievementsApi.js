import { getSupabaseClient } from '../lib/supabaseClient';

export async function fetchAchievements() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('achievements')
    .select('id, title, date, description, thumbnail, detail, documentation, created_at')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil pencapaian dari Supabase: ${error.message}`);
  }

  return data.map((achievement) => ({
    id: String(achievement.id),
    title: achievement.title,
    date: achievement.date,
    description: achievement.description,
    thumbnail: achievement.thumbnail || '',
    detail: achievement.detail || achievement.description,
    documentation: achievement.documentation || []
  }));
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
  const { error } = await getSupabaseClient().rpc('delete_achievement', {
    p_id: String(id),
    p_hide_default: false
  });

  if (error) {
    throw new Error(`Gagal menghapus pencapaian dari Supabase: ${error.message}`);
  }
}
