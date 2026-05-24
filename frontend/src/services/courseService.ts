const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export type ApiLesson = {
  id: string;
  title: string;
};

export type ApiCourse = {
  id: string;
  title: string;
  description?: string | null;
  isPremium: boolean;
  lessons?: ApiLesson[];
};

export type DashboardEnrollment = {
  id: string;
  progress: number;
  course: ApiCourse;
  certificate?: {
    id: string;
    verifyCode: string;
    url: string;
    createdAt: string;
  } | null;
};

export type StudentDashboardResponse = {
  stats: {
    enrolledCourses: number;
    averageProgress: number;
    certificates: number;
  };
  enrollments: DashboardEnrollment[];
};

export type CertificateVerification = {
  valid: boolean;
  verifyCode?: string;
  issuedAt?: string;
  student?: {
    id: string;
    email: string;
    name?: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
  message?: string;
};

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses`);

  if (!res.ok) {
    throw new Error(`Failed to load courses: ${res.status}`);
  }

  return (await res.json()) as ApiCourse[];
}

export async function fetchStudentDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/student/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load dashboard: ${res.status}`);
  }

  return (await res.json()) as StudentDashboardResponse;
}

export async function verifyCertificate(code: string) {
  const res = await fetch(`${API_BASE}/api/certificates/verify/${encodeURIComponent(code)}`);
  const json = await res.json();

  if (!res.ok && res.status !== 404) {
    throw new Error(json.message || `Verification failed: ${res.status}`);
  }

  return json as CertificateVerification;
}
