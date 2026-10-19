export const API_URL = "https://script.google.com/macros/s/AKfycbxH3ScRaOoIsu2QANI7XL40h1ueZ5Tu0iK-n8Ic15JErIaLyuKFhUk-tVpWDeV8HepOmg/exec";

export async function fetchProjects() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Gagal mengambil proyek (HTTP ${response.status}).`);
  }

  const projects = await response.json();
  if (projects && projects.status === 'error') {
    throw new Error(projects.message || 'Google Sheets gagal mengambil data proyek.');
  }
  if (!Array.isArray(projects)) {
    throw new Error("Format data proyek dari Google Sheets tidak valid.");
  }

  return projects;
}
