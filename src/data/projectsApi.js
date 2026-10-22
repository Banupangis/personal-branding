import { getSupabaseClient } from '../lib/supabaseClient';

const PROJECT_COLUMNS = 'id, title, category, description, status, thumbnail, github_link, demo_link, created_at';

function mapProject(project) {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    status: project.status,
    thumbnail: project.thumbnail,
    githubLink: project.github_link,
    demoLink: project.demo_link
  };
}

export async function fetchProjects() {
  const { data, error } = await getSupabaseClient()
    .from('projects')
    .select(PROJECT_COLUMNS)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil proyek dari Supabase: ${error.message}`);
  }

  return data.map(mapProject);
}

export async function saveProject(project) {
  const payload = {
    title: project.title.trim(),
    category: project.category.trim(),
    description: project.description.trim(),
    status: project.status.trim(),
    thumbnail: project.thumbnail.trim(),
    github_link: project.githubLink.trim(),
    demo_link: project.demoLink.trim()
  };
  const client = getSupabaseClient();
  const query = project.id
    ? client.from('projects').update(payload).eq('id', String(project.id))
    : client.from('projects').insert(payload);
  const { data, error } = await query.select(PROJECT_COLUMNS).single();

  if (error) {
    throw new Error(`Gagal menyimpan proyek ke Supabase: ${error.message}`);
  }

  return mapProject(data);
}

export async function deleteProject(id) {
  const { error } = await getSupabaseClient()
    .from('projects')
    .delete()
    .eq('id', String(id));

  if (error) {
    throw new Error(`Gagal menghapus proyek dari Supabase: ${error.message}`);
  }
}
