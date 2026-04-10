import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentEnrollments } from "@/actions/enrollment";
import { db } from "@/lib/db";
import { AlumnoDashboardClient } from "./dashboard-client";

export default async function AlumnoDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrollments = await getStudentEnrollments();

  // Get progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );
      const completedLessons = await db.lessonProgress.count({
        where: {
          userId: session.user.id,
          completed: true,
          lesson: { module: { courseId: enrollment.courseId } },
        },
      });

      const lastProgress = await db.lessonProgress.findFirst({
        where: {
          userId: session.user.id,
          lesson: { module: { courseId: enrollment.courseId } },
        },
        orderBy: { lastViewedAt: "desc" },
        include: { lesson: { include: { module: true } } },
      });

      return {
        ...enrollment,
        totalLessons,
        completedLessons,
        lastLesson: lastProgress?.lesson || null,
      };
    })
  );

  return (
    <AlumnoDashboardClient
      enrollments={enrollmentsWithProgress}
      userName={session.user.name}
    />
  );
}
