"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function joinCourse(accessCode: string) {
  const session = await auth();
  if (!session?.user) return { error: "Necesitás iniciar sesión" };

  const course = await db.course.findUnique({
    where: { accessCode: accessCode.toUpperCase() },
  });

  if (!course) return { error: "No se encontró un curso con ese código" };
  if (!course.published) return { error: "Este curso todavía no está disponible" };

  // Check if already enrolled
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (existing) {
    return { success: true, slug: course.slug, alreadyEnrolled: true };
  }

  await db.enrollment.create({
    data: { userId: session.user.id, courseId: course.id },
  });

  // Track event
  await db.analyticsEvent.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      type: "COURSE_ENROLLED",
    },
  });

  revalidatePath("/alumno");
  return { success: true, slug: course.slug };
}

export async function getStudentEnrollments() {
  const session = await auth();
  if (!session?.user) return [];

  return db.enrollment.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      course: {
        include: {
          teacher: { include: { user: { select: { name: true, lastName: true } } } },
          modules: {
            include: { lessons: { select: { id: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function getStudentProgress(courseId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const progress = await db.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { module: { courseId } } },
  });

  return progress;
}
