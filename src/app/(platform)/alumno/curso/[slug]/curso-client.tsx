"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, ProgressBar, Button, Badge } from "@/components/ui";
import { calculateProgress, formatDateTime } from "@/lib/utils";
import { markLessonComplete } from "@/actions/progreso";

interface AlumnoCursoClientProps {
  course: any;
  progress: any[];
  quizAttempts: any[];
  examAttempts: any[];
  certificate: any;
}

export function AlumnoCursoClient({
  course,
  progress,
  quizAttempts,
  examAttempts,
  certificate,
}: AlumnoCursoClientProps) {
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const totalLessons = allLessons.length;
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const completedCount = completedIds.size;
  const progressPercent = calculateProgress(completedCount, totalLessons);

  // Find next incomplete lesson
  const nextLesson = allLessons.find((l: any) => !completedIds.has(l.id));

  // Upcoming live classes
  const now = new Date();
  const upcomingClasses = course.liveClasses.filter((lc: any) => new Date(lc.dateTime) >= now).slice(0, 2);

  // Primary contact
  const primaryContact = course.contactChannels.find((c: any) => c.isPrimary) || course.contactChannels[0];

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      {/* Course header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
        {course.subtitle && <p className="text-gray-500 mt-1">{course.subtitle}</p>}
      </div>

      {/* Progress + quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-2">Tu progreso</p>
          <ProgressBar value={progressPercent} size="lg" />
          <p className="text-xs text-gray-400 mt-2">
            {completedCount} de {totalLessons} clases completadas
          </p>
          {progressPercent < course.minProgressForCert && (
            <p className="text-xs text-amber-600 mt-1">
              Te falta {course.minProgressForCert - progressPercent}% para habilitar el certificado
            </p>
          )}
        </Card>

        {nextLesson && (
          <Card
            hover
            className="cursor-pointer border-blue-100 bg-blue-50/30"
            onClick={() => setActiveLesson(nextLesson)}
          >
            <p className="text-sm text-blue-600 font-medium mb-1">Seguí por acá</p>
            <p className="font-semibold text-gray-800">{nextLesson.title}</p>
            {nextLesson.estimatedMinutes && (
              <p className="text-xs text-gray-400 mt-1">{nextLesson.estimatedMinutes} min</p>
            )}
          </Card>
        )}

        {upcomingClasses.length > 0 && (
          <Card className="border-emerald-100 bg-emerald-50/30">
            <p className="text-sm text-emerald-600 font-medium mb-1">Próxima clase en vivo</p>
            <p className="font-semibold text-gray-800">{upcomingClasses[0].title}</p>
            <p className="text-xs text-gray-500 mt-1">{formatDateTime(new Date(upcomingClasses[0].dateTime))}</p>
            <a
              href={upcomingClasses[0].meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-emerald-600 hover:underline"
            >
              Ingresar a la clase
            </a>
          </Card>
        )}

        {certificate && certificate.valid && (
          <Card className="border-amber-100 bg-amber-50/30">
            <p className="text-sm text-amber-600 font-medium mb-1">Tu certificado está listo</p>
            <Button size="sm" variant="secondary" onClick={() => router.push(`/alumno/curso/${course.slug}/certificado`)}>
              Ver certificado
            </Button>
          </Card>
        )}
      </div>

      {/* Main content: Modules + Active lesson */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar: Module list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-800 mb-2">Contenido</h2>
          {course.modules.map((module: any, mIdx: number) => (
            <div key={module.id}>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                Módulo {mIdx + 1}: {module.title}
              </p>
              <div className="space-y-1">
                {module.lessons.map((lesson: any, lIdx: number) => {
                  const isComplete = completedIds.has(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {isComplete ? (
                        <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Community link */}
          {primaryContact && (
            <a
              href={primaryContact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-sm text-emerald-700 hover:bg-emerald-100 transition-colors mt-4"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              {primaryContact.label}
            </a>
          )}
        </div>

        {/* Main: Lesson content */}
        <div className="lg:col-span-2">
          {activeLesson ? (
            <LessonView
              lesson={activeLesson}
              isComplete={completedIds.has(activeLesson.id)}
              quizAttempts={quizAttempts.filter((a) => a.quizId === activeLesson.quiz?.id)}
              courseId={course.id}
              primaryContact={primaryContact}
            />
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-400">Elegí una clase del menú para empezar</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function LessonView({
  lesson,
  isComplete,
  quizAttempts,
  courseId,
  primaryContact,
}: {
  lesson: any;
  isComplete: boolean;
  quizAttempts: any[];
  courseId: string;
  primaryContact: any;
}) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);

  async function handleMarkComplete() {
    setMarking(true);
    await markLessonComplete(lesson.id, courseId);
    setMarking(false);
    router.refresh();
  }

  const failCount = quizAttempts.filter((a) => !a.passed).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-gray-800">{lesson.title}</h2>
          {isComplete && <Badge variant="success">Completada</Badge>}
        </div>
        {lesson.description && <p className="text-gray-500">{lesson.description}</p>}
      </div>

      {/* Videos */}
      {lesson.videos.length > 0 && (
        <div className="space-y-3">
          {lesson.videos.map((video: any) => (
            <VideoPlayer key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recursos</h3>
          <div className="space-y-2">
            {lesson.resources.map((resource: any) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">{resource.title}</p>
                  {resource.description && <p className="text-xs text-gray-400">{resource.description}</p>}
                </div>
                <span className="ml-auto text-xs text-gray-400">{resource.resourceType}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mark as complete or quiz prompt */}
      {!isComplete && (
        <div className="border-t border-gray-100 pt-4">
          {lesson.quiz && lesson.quizRequired ? (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-700 mb-1">Evaluación requerida</p>
              <p className="text-xs text-blue-600">
                Aprobá la evaluación para completar esta clase.
              </p>
              {failCount >= 3 && primaryContact && (
                <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                  ¿Te trabaste? <a href={primaryContact.url} target="_blank" rel="noopener noreferrer" className="underline font-medium">Pedí ayuda en la comunidad</a>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={handleMarkComplete} loading={marking} variant="secondary">
              Marcar como vista
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ video }: { video: any }) {
  if (video.type === "LOOM_EMBED") {
    // Try to extract Loom ID and create embed
    const loomMatch = video.url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
      return (
        <div className="rounded-xl overflow-hidden bg-black aspect-video">
          <iframe
            src={`https://www.loom.com/embed/${loomMatch[1]}`}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  if (video.type === "GOOGLE_DRIVE") {
    const driveMatch = video.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return (
        <div className="rounded-xl overflow-hidden bg-black aspect-video">
          <iframe
            src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  // Fallback: external link button
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      <div>
        <p className="text-sm font-medium text-gray-700">{video.title}</p>
        <p className="text-xs text-gray-400">Abrir video</p>
      </div>
    </a>
  );
}
