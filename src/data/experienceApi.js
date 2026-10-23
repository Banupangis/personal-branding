import { getSupabaseClient } from '../lib/supabaseClient';

function throwQueryError(error, action) {
  if (error) {
    throw new Error(`Gagal ${action} pengalaman di Supabase: ${error.message}`);
  }
}

export async function fetchExperiences() {
  const client = getSupabaseClient();
  const [experienceResult, activityResult] = await Promise.all([
    client
      .from('experiences')
      .select('id, organization, role, date, description, detail, link, contributions, created_at')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true }),
    client
      .from('experience_activities')
      .select('id, experience_id, title, description, documentation, sort_order')
      .order('experience_id', { ascending: true })
      .order('sort_order', { ascending: true })
  ]);

  throwQueryError(experienceResult.error, 'mengambil data');
  throwQueryError(activityResult.error, 'mengambil subkegiatan');

  const activitiesByExperience = new Map();
  for (const activity of activityResult.data) {
    const activities = activitiesByExperience.get(activity.experience_id) || [];
    activities.push({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      documentation: activity.documentation
    });
    activitiesByExperience.set(activity.experience_id, activities);
  }

  return experienceResult.data.map((experience) => ({
    id: String(experience.id),
    organization: experience.organization,
    role: experience.role,
    date: experience.date,
    description: experience.description,
    detail: experience.detail,
    link: experience.link,
    contributions: experience.contributions,
    activities: activitiesByExperience.get(experience.id) || []
  })).sort((left, right) => {
    const leftId = /^\d+$/.test(left.id) ? Number(left.id) : null;
    const rightId = /^\d+$/.test(right.id) ? Number(right.id) : null;
    if (leftId !== null && rightId !== null) return leftId - rightId;
    if (leftId !== null) return -1;
    if (rightId !== null) return 1;
    return 0;
  });
}

export async function saveExperience(experience) {
  const { error } = await getSupabaseClient().rpc('save_experience', {
    p_payload: {
      id: String(experience.id),
      organization: experience.organization.trim(),
      role: experience.role.trim(),
      date: experience.date.trim(),
      description: experience.description.trim(),
      detail: experience.detail.trim(),
      link: experience.link || '',
      contributions: experience.contributions,
      activities: experience.activities.map((activity) => ({
        id: String(activity.id),
        title: activity.title.trim(),
        description: activity.description.trim(),
        documentation: activity.documentation
      }))
    }
  });

  if (error) {
    throw new Error(`Gagal menyimpan pengalaman ke Supabase: ${error.message}`);
  }
}

export async function deleteExperience(id) {
  const { error } = await getSupabaseClient().rpc('delete_experience', {
    p_id: String(id),
    p_hide_default: false
  });

  if (error) {
    throw new Error(`Gagal menghapus pengalaman dari Supabase: ${error.message}`);
  }
}
