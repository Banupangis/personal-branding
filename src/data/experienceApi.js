import { EXPERIENCE } from './content';
import { getSupabaseClient } from '../lib/supabaseClient';

function mergeExperiences(remoteExperiences, hiddenIds) {
  const remoteById = new Map(remoteExperiences.map((experience) => [String(experience.id), experience]));
  const defaultIds = new Set(EXPERIENCE.map((experience) => String(experience.id)));
  const defaults = EXPERIENCE
    .filter((experience) => !hiddenIds.has(String(experience.id)))
    .map((experience) => ({
      ...experience,
      detail: experience.description,
      activities: [],
      ...remoteById.get(String(experience.id))
    }));
  const additions = remoteExperiences.filter((experience) => (
    !defaultIds.has(String(experience.id)) && !hiddenIds.has(String(experience.id))
  ));

  return [...defaults, ...additions];
}

function throwQueryError(error, action) {
  if (error) {
    throw new Error(`Gagal ${action} pengalaman di Supabase: ${error.message}`);
  }
}

export async function fetchExperiences() {
  const client = getSupabaseClient();
  const [experienceResult, activityResult, hiddenResult] = await Promise.all([
    client
      .from('experiences')
      .select('id, organization, role, date, description, detail, link, contributions, created_at')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true }),
    client
      .from('experience_activities')
      .select('id, experience_id, title, description, documentation, sort_order')
      .order('experience_id', { ascending: true })
      .order('sort_order', { ascending: true }),
    client
      .from('hidden_default_content')
      .select('content_id')
      .eq('entity_type', 'experience')
  ]);

  throwQueryError(experienceResult.error, 'mengambil data');
  throwQueryError(activityResult.error, 'mengambil subkegiatan');
  throwQueryError(hiddenResult.error, 'mengambil status penghapusan');

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

  const remoteExperiences = experienceResult.data.map((experience) => ({
    id: String(experience.id),
    organization: experience.organization,
    role: experience.role,
    date: experience.date,
    description: experience.description,
    detail: experience.detail,
    link: experience.link,
    contributions: experience.contributions,
    activities: activitiesByExperience.get(experience.id) || []
  }));
  const hiddenIds = new Set(hiddenResult.data.map((item) => String(item.content_id)));

  return mergeExperiences(remoteExperiences, hiddenIds);
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
  const defaultIds = new Set(EXPERIENCE.map((experience) => String(experience.id)));
  const { error } = await getSupabaseClient().rpc('delete_experience', {
    p_id: String(id),
    p_hide_default: defaultIds.has(String(id))
  });

  if (error) {
    throw new Error(`Gagal menghapus pengalaman dari Supabase: ${error.message}`);
  }
}
