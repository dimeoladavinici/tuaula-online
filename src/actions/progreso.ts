"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autenticado" };

  // Verify enrollment
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) return { error: "No estás inscripto en este curso" };

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
      lastViewedAt: new Date(),
    },
    update: {
      completed: true,
      completedAt: new Date(),
      lastViewedAt: new Date(),
    },
  });

  // Track event
  await db.analyticsEvent.create({
    data: {
      userId: session.user.id,
      courseId,
      lessonId,
      type: "LESSON_COMPLETED",
    },
  });

  const course = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  if (course) revalidatePath(`/alumno/curso/${course.slug}`);

  return { success: true };
}

export async function trackLessonView(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user) return;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: {
      userId: session.user.id,
      lessonId,
      lastViewedAt: new Date(),
    },
    update: {
      lastViewedAt: new Date(),
    },
  });

  await db.analyticsEvent.create({
    data: {
      userId: session.user.id,
      courseId,
      lessonId,
      type: "LESSON_VIEWED",
    },
  });
}
