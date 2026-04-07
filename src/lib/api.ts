/**
 * API layer - placeholder functions ready for Supabase integration.
 * Replace mock implementations with actual Supabase queries.
 */

import {
  mockCourses,
  mockQuizzes,
  mockLeaderboard,
  mockUser,
  mockActivities,
  type Course,
  type Lesson,
  type QuizQuestion,
  type LeaderboardEntry,
  type User,
  type Activity,
} from "./mock-data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchCurrentUser(): Promise<User> {
  await delay(300);
  return mockUser;
}

export async function fetchCourses(): Promise<Course[]> {
  await delay(500);
  return mockCourses;
}

export async function fetchCourseById(courseId: string): Promise<Course | undefined> {
  await delay(300);
  return mockCourses.find((c) => c.id === courseId);
}

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  await delay(300);
  const course = mockCourses.find((c) => c.id === courseId);
  return course?.lessons ?? [];
}

export async function fetchLessonById(lessonId: string): Promise<Lesson | undefined> {
  await delay(200);
  for (const course of mockCourses) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export async function fetchQuiz(lessonId: string): Promise<QuizQuestion[]> {
  await delay(400);
  return mockQuizzes[lessonId] ?? [];
}

export async function submitQuiz(
  lessonId: string,
  answers: Record<string, number>
): Promise<{ score: number; total: number; correct: boolean[]; pointsEarned: number }> {
  await delay(500);
  const questions = mockQuizzes[lessonId] ?? [];
  const correct = questions.map((q) => answers[q.id] === q.correctAnswer);
  const score = correct.filter(Boolean).length;
  const pointsEarned = score * 50;
  return { score, total: questions.length, correct, pointsEarned };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(400);
  return mockLeaderboard;
}

export async function fetchActivities(): Promise<Activity[]> {
  await delay(300);
  return mockActivities;
}

export async function loginUser(email: string, password: string): Promise<User> {
  await delay(800);
  // Placeholder: Replace with supabase.auth.signInWithPassword
  if (email && password) {
    return mockUser;
  }
  throw new Error("Invalid credentials");
}

export async function signupUser(name: string, email: string, password: string): Promise<User> {
  await delay(800);
  // Placeholder: Replace with supabase.auth.signUp
  if (name && email && password) {
    return { ...mockUser, name, email };
  }
  throw new Error("Signup failed");
}

export async function logoutUser(): Promise<void> {
  await delay(300);
  // Placeholder: Replace with supabase.auth.signOut
}
