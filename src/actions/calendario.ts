"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLiveClass(
  courseId: string,
  data: {
    title: string;
    description?: string;
    dateTime: string;
    meetingUrl: string;
    isRecurring?: boolean;
    recurrenceDay?: number;
    recurrenceTime?: string;
  }
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

  await db.liveClassEvent.create({
    data: {
      courseId,
      title: data.title,
      description: data.description || null,
      dateTime: new Date(data.dateTime),
      meetingUrl: data.meetingUrl,
      isRecurring: data.isRecurring ?? false,
      recurrenceDay: data.recurrenceDay ?? null,
      recurrenceTime: data.recurrenceTime ?? null,
    },
  });

  revalidatePath(`/profesor/curso/${course.slug}`);
  return { success: true };
}

export async function deleteLiveClass(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") return { error: "No tenés permisos" };

  const liveClass = await db.liveClassEvent.findUnique({
    where: { id },
    include: { course: { include: { teacher: true } } },
  });

  if (!liveClass || liveClass.course.teacher.userId !== session.user.id) {
    return { error: "No encontrado" };
  }

  await db.liveClassEvent.delete({ where: { id } });
  revalidatePath(`/profesor/curso/${liveClass.course.slug}`);
  return { success: true };
}
