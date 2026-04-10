"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function verifyTeacherOwnsModule(moduleId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return null;

  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { teacher: true } } },
  });

  if (!module || module.course.teacher.userId !== session.user.id) return null;
  return module;
}

export async function createLesson(
  moduleId: string,
  data: {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    quizRequired?: boolean;
  }
) {
  const module = await verifyTeacherOwnsModule(moduleId);
  if (!module) return { error: "No tenés permisos" };

  const lastLesson = await db.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });

  const lesson = await db.lesson.create({
    data: {
      moduleId,
      title: data.title,
      description: data.description || null,
      estimatedMinutes: data.estimatedMinutes || null,
      quizRequired: data.quizRequired ?? false,
      order: (lastLesson?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/profesor/curso/${module.course.slug}`);
  return { success: true, lessonId: lesson.id };
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    description?: string;
    estimatedMinutes?: number;
    quizRequired?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { teacher: true } } } } },
  });

  if (!lesson || lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.lesson.update({ where: { id: lessonId }, data });
  revalidatePath(`/profesor/curso/${lesson.module.course.slug}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { teacher: true } } } } },
  });

  if (!lesson || lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/profesor/curso/${lesson.module.course.slug}`);
  return { success: true };
}

// ─── VIDEOS ─────────────────────────────────────────────

export async function addVideo(
  lessonId: string,
  data: { title: string; type: "GOOGLE_DRIVE" | "LOOM_LINK" | "LOOM_EMBED"; url: string }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { teacher: true } } } } },
  });

  if (!lesson || lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  const lastVideo = await db.lessonVideo.findFirst({
    where: { lessonId },
    orderBy: { order: "desc" },
  });

  await db.lessonVideo.create({
    data: {
      lessonId,
      title: data.title,
      type: data.type,
      url: data.url,
      order: (lastVideo?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/profesor/curso/${lesson.module.course.slug}`);
  return { success: true };
}

export async function deleteVideo(videoId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const video = await db.lessonVideo.findUnique({
    where: { id: videoId },
    include: { lesson: { include: { module: { include: { course: { include: { teacher: true } } } } } } },
  });

  if (!video || video.lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.lessonVideo.delete({ where: { id: videoId } });
  revalidatePath(`/profesor/curso/${video.lesson.module.course.slug}`);
  return { success: true };
}

// ─── RESOURCES ──────────────────────────────────────────

export async function addResource(
  lessonId: string,
  data: {
    title: string;
    description?: string;
    url: string;
    resourceType?: "PDF" | "DOCUMENT" | "GUIDE" | "TEMPLATE" | "OTHER";
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { teacher: true } } } } },
  });

  if (!lesson || lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  const lastResource = await db.lessonResource.findFirst({
    where: { lessonId },
    orderBy: { order: "desc" },
  });

  await db.lessonResource.create({
    data: {
      lessonId,
      title: data.title,
      description: data.description || null,
      url: data.url,
      resourceType: data.resourceType || "OTHER",
      order: (lastResource?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/profesor/curso/${lesson.module.course.slug}`);
  return { success: true };
}

export async function deleteResource(resourceId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const resource = await db.lessonResource.findUnique({
    where: { id: resourceId },
    include: { lesson: { include: { module: { include: { course: { include: { teacher: true } } } } } } },
  });

  if (!resource || resource.lesson.module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.lessonResource.delete({ where: { id: resourceId } });
  revalidatePath(`/profesor/curso/${resource.lesson.module.course.slug}`);
  return { success: true };
}
