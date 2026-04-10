import { redirect } from "next/navigation";
import { getCourseBySlug, getTeacherCourse } from "@/actions/curso";
import { auth } from "@/lib/auth";
import { CursoManager } from "@/components/curso/curso-manager";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProfesorCursoPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getCourseBySlug(slug);
  if (!course) redirect("/profesor");

  // Verify ownership
  if (course.teacher.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
    redirect("/profesor");
  }

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
          {course.subtitle && (
            <p className="text-gray-500 mt-1">{course.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Código de acceso</p>
            <p className="font-mono font-bold text-lg tracking-wider text-blue-600">
              {course.accessCode}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              course.published
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {course.published ? "Publicado" : "Borrador"}
          </span>
        </div>
      </div>

      <CursoManager course={course} />
    </main>
  );
}
