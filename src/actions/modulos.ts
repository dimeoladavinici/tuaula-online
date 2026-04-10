"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function verifyTeacherOwnsCourse(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return null;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { teacher: true },
  });

  if (!course || course.teacher.userId !== session.user.id) return null;
  return course;
}

export async function createModule(courseId: string, data: { title: string; description?: string }) {
  const course = await verifyTeacherOwnsCourse(courseId);
  if (!course) return { error: "No tenés permisos" };

  const lastModule = await db.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const module = await db.module.create({
    data: {
      courseId,
      title: data.title,
      description: data.description || null,
      order: (lastModule?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/profesor/curso/${course.slug}`);
  return { success: true, moduleId: module.id };
}

export async function updateModule(moduleId: string, data: { title?: string; description?: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { teacher: true } } },
  });

  if (!module || module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.module.update({ where: { id: moduleId }, data });
  revalidatePath(`/profesor/curso/${module.course.slug}`);
  return { success: true };
}

export async function deleteModule(moduleId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { teacher: true } } },
  });

  if (!module || module.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.module.delete({ where: { id: moduleId } });
  revalidatePath(`/profesor/curso/${module.course.slug}`);
  return { success: true };
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const course = await verifyTeacherOwnsCourse(courseId);
  if (!course) return { error: "No tenés permisos" };

  await Promise.all(
    moduleIds.map((id, index) =>
      db.module.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath(`/profesor/curso/${course.slug}`);
  return { success: true };
}
