"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAccessCode, slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: {
  title: string;
  subtitle?: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "No tenés permisos para crear un curso" };
  }

  const profile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { courses: { select: { id: true } } },
  });

  if (!profile) {
    return { error: "No se encontró tu perfil de profesor" };
  }

  // MVP: limit to 1 course
  if (profile.courses.length >= 1) {
    return { error: "En esta versión podés crear un solo curso. Próximamente habrá planes para más." };
  }

  let slug = slugify(formData.title);
  const existingSlug = await db.course.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  let accessCode = generateAccessCode();
  let attempts = 0;
  while (await db.course.findUnique({ where: { accessCode } })) {
    accessCode = generateAccessCode();
    attempts++;
    if (attempts > 10) break;
  }

  const course = await db.course.create({
    data: {
      teacherId: profile.id,
      title: formData.title,
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      slug,
      accessCode,
    },
  });

  revalidatePath("/profesor");
  return { success: true, slug: course.slug };
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    minProgressForCert?: number;
    certTitle?: string;
    certText?: string;
    published?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "No tenés permisos" };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { teacher: true },
  });

  if (!course || course.teacher.userId !== session.user.id) {
    return { error: "Curso no encontrado" };
  }

  await db.course.update({ where: { id: courseId }, data });
  revalidatePath(`/profesor/curso/${course.slug}`);
  return { success: true };
}

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      teacher: { include: { user: { select: { name: true, lastName: true } } } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              videos: { orderBy: { order: "asc" } },
              resources: { orderBy: { order: "asc" } },
              quiz: { include: { questions: { orderBy: { order: "asc" } } } },
            },
          },
        },
      },
      contactChannels: true,
      liveClasses: { orderBy: { dateTime: "asc" } },
      finalExam: { include: { questions: { orderBy: { order: "asc" } } } },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function getTeacherCourse() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return null;

  const profile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return null;

  return db.course.findFirst({
    where: { teacherId: profile.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
}
