"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addContactChannel(
  courseId: string,
  data: { type: string; label: string; url: string; isPrimary?: boolean }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { teacher: true },
  });

  if (!course || course.teacher.userId !== session.user.id) {
    return { error: "Curso no encontrado" };
  }

  // If marking as primary, unmark others
  if (data.isPrimary) {
    await db.contactChannel.updateMany({
      where: { courseId },
      data: { isPrimary: false },
    });
  }

  await db.contactChannel.create({
    data: {
      courseId,
      type: data.type as any,
      label: data.label,
      url: data.url,
      isPrimary: data.isPrimary ?? false,
    },
  });

  revalidatePath(`/profesor/curso/${course.slug}`);
  return { success: true };
}

export async function deleteContactChannel(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const channel = await db.contactChannel.findUnique({
    where: { id },
    include: { course: { include: { teacher: true } } },
  });

  if (!channel || channel.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.contactChannel.delete({ where: { id } });
  revalidatePath(`/profesor/curso/${channel.course.slug}`);
  return { success: true };
}
