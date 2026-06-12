import { apiUrl } from './api';

export type ApiCourse = { id: string; title: string; description?: string | null; isPremium: boolean; lessons?: { id: string; title: string }[] };
export type StudentDashboardResponse = {
  stats: { enrolledCourses: number; averageProgress: number; certificates: number };
  enrollments: Array<{ id: string; progress: number; course: ApiCourse; certificate?: { verifyCode: string } | null }>;
};

export async function fetchCourses() {
  const res = await fetch(apiUrl('/api/courses'));
  if (!res.ok) throw new Error('Failed to load courses');
  return (await res.json()) as ApiCourse[];
}

export async function fetchStudentDashboard(token: string) {
  const res = await fetch(apiUrl('/api/student/dashboard'), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to load dashboard');
  return (await res.json()) as StudentDashboardResponse;
}

export async function verifyCertificate(code: string) {
  const res = await fetch(apiUrl(`/api/certificates/verify/${encodeURIComponent(code)}`));
  return await res.json();
}
