import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourseBySlug } from "@/actions/curso";
import { db } from "@/lib/db";
import { AlumnoCursoClient } from "./curso-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AlumnoCursoPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getCourseBySlug(slug);
  if (!course) redirect("/alumno");

  // Verify enrollment
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (!enrollment) redirect("/alumno");

  // Get progress
  const progress = await db.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { module: { courseId: course.id } } },
  });

  // Get quiz attempts
  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: session.user.id, quiz: { lesson: { module: { courseId: course.id } } } },
    orderBy: { createdAt: "desc" },
  });

  // Get certificate
  const certificate = await db.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  // Get final exam attempts
  const examAttempts = course.finalExam
    ? await db.finalExamAttempt.findMany({
        where: { userId: session.user.id, examId: course.finalExam.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <AlumnoCursoClient
      course={course}
      progress={progress}
      quizAttempts={quizAttempts}
      examAttempts={examAttempts}
      certificate={certificate}
    />
  );
}
