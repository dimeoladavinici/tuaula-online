"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, ProgressBar, Button, Badge, Tabs } from "@/components/ui";
import { calculateProgress, formatDateTime } from "@/lib/utils";
import { markLessonComplete } from "@/actions/progreso";

interface AlumnoCursoClientProps {
  course: any;
  progress: any[];
  quizAttempts: any[];
  examAttempts: any[];
  certificate: any;
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const tabs = [
  { id: "clases", label: "Clases" },
  { id: "calendario", label: "Calendario" },
  { id: "comunidad", label: "Comunidad" },
  { id: "certificado", label: "Certificado" },
];

export function AlumnoCursoClient({
  course,
  progress,
  quizAttempts,
  examAttempts,
  certificate,
}: AlumnoCursoClientProps) {
  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const totalLessons = allLessons.length;
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const completedCount = completedIds.size;
  const progressPercent = calculateProgress(completedCount, totalLessons);
  const nextLesson = allLessons.find((l: any) => !completedIds.has(l.id));

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      {/* Course header with progress */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
        {course.subtitle && <p className="text-gray-500 mt-1">{course.subtitle}</p>}
        <div className="mt-4">
          <ProgressBar value={progressPercent} size="md" />
          <p className="text-xs text-gray-400 mt-1">
            {completedCount} de {totalLessons} clases completadas
            {progressPercent < course.minProgressForCert && (
              <span className="text-amber-600 ml-2">
                — Te falta {course.minProgressForCert - progressPercent}% para el certificado
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="clases">
        {(activeTab) => (
          <>
            {activeTab === "clases" && (
              <ClasesTab
                course={course}
                completedIds={completedIds}
                nextLesson={nextLesson}
                quizAttempts={quizAttempts}
                primaryContact={course.contactChannels.find((c: any) => c.isPrimary) || course.contactChannels[0]}
              />
            )}
            {activeTab === "calendario" && <CalendarioAlumnoTab course={course} />}
            {activeTab === "comunidad" && <ComunidadAlumnoTab course={course} />}
            {activeTab === "certificado" && (
              <CertificadoAlumnoTab
                course={course}
                progressPercent={progressPercent}
                certificate={certificate}
                examAttempts={examAttempts}
              />
            )}
          </>
        )}
      </Tabs>
    </main>
  );
}

// ─── TAB: CLASES ────────────────────────────────────────

function ClasesTab({
  course,
  completedIds,
  nextLesson,
  quizAttempts,
  primaryContact,
}: {
  course: any;
  completedIds: Set<string>;
  nextLesson: any;
  quizAttempts: any[];
  primaryContact: any;
}) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const activeLesson = course.modules
    .flatMap((m: any) => m.lessons)
    .find((l: any) => l.id === activeLessonId);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar: lesson list */}
      <div className="lg:col-span-1">
        {/* Next lesson card */}
        {nextLesson && !activeLessonId && (
          <button
            onClick={() => setActiveLessonId(nextLesson.id)}
            className="w-full mb-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 text-left hover:border-blue-300 transition-colors"
          >
            <p className="text-xs font-medium text-blue-600 mb-1">Seguí por acá</p>
            <p className="font-semibold text-gray-800">{nextLesson.title}</p>
          </button>
        )}

        {/* Module list */}
        <div className="space-y-4">
          {course.modules.map((module: any, mIdx: number) => (
            <div key={module.id}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Módulo {mIdx + 1} — {module.title}
              </p>
              <div className="space-y-0.5">
                {module.lessons.map((lesson: any) => {
                  const isComplete = completedIds.has(lesson.id);
                  const isActive = activeLessonId === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {isComplete ? (
                        <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: lesson content */}
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
          <Card className="text-center py-16">
            <p className="text-gray-400 mb-2">Elegí una clase del menú para empezar</p>
            {nextLesson && (
              <Button size="sm" onClick={() => setActiveLessonId(nextLesson.id)}>
                Ir a la siguiente clase
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── TAB: CALENDARIO ────────────────────────────────────

function CalendarioAlumnoTab({ course }: { course: any }) {
  const now = new Date();
  const recurring = course.liveClasses.filter((lc: any) => lc.isRecurring);
  const oneTime = course.liveClasses.filter((lc: any) => !lc.isRecurring);
  const upcoming = oneTime.filter((lc: any) => new Date(lc.dateTime) >= now);
  const past = oneTime.filter((lc: any) => new Date(lc.dateTime) < now);

  if (course.liveClasses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No hay clases en vivo programadas por ahora.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {recurring.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Clases fijas semanales</h3>
          <div className="space-y-2">
            {recurring.map((lc: any) => (
              <Card key={lc.id} className="border-blue-100 bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{lc.title}</p>
                    <p className="text-sm text-gray-500">
                      Todos los {dayNames[lc.recurrenceDay]} a las {lc.recurrenceTime}hs
                    </p>
                  </div>
                  <a
                    href={lc.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button size="sm">Ingresar</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Próximas clases</h3>
          <div className="space-y-2">
            {upcoming.map((lc: any) => (
              <Card key={lc.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{lc.title}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(new Date(lc.dateTime))}</p>
                  </div>
                  <a href={lc.meetingUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button size="sm">Ingresar</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Clases pasadas</h3>
          <div className="space-y-2 opacity-60">
            {past.map((lc: any) => (
              <Card key={lc.id}>
                <p className="font-medium text-gray-800">{lc.title}</p>
                <p className="text-sm text-gray-500">{formatDateTime(new Date(lc.dateTime))}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: COMUNIDAD ─────────────────────────────────────

function ComunidadAlumnoTab({ course }: { course: any }) {
  const primary = course.contactChannels.find((c: any) => c.isPrimary);
  const others = course.contactChannels.filter((c: any) => !c.isPrimary);

  if (course.contactChannels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">El profesor todavía no configuró canales de contacto.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <p className="text-gray-500 text-sm mb-4">
        Conectá con tu profesor y compañeros a través de estos canales.
      </p>

      {/* Primary channel - big CTA */}
      {primary && (
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 p-5 hover:bg-emerald-100 transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <ChannelIcon type={primary.type} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{primary.label}</p>
            <p className="text-sm text-emerald-600">Abrir {channelLabel(primary.type)}</p>
          </div>
        </a>
      )}

      {/* Other channels */}
      {others.length > 0 && (
        <div className="space-y-2">
          {others.map((ch: any) => (
            <a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ChannelIcon type={ch.type} small />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{ch.label}</p>
                <p className="text-xs text-gray-400">{channelLabel(ch.type)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function channelLabel(type: string) {
  const labels: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    TELEGRAM: "Telegram",
    INSTAGRAM: "Instagram",
    WEBSITE: "Sitio web",
    OTHER: "Enlace",
  };
  return labels[type] || "Enlace";
}

function ChannelIcon({ type, small }: { type: string; small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-6 w-6";
  const color = small ? "text-gray-500" : "text-white";
  return (
    <svg className={`${size} ${color}`} fill="currentColor" viewBox="0 0 24 24">
      {type === "WHATSAPP" ? (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      )}
    </svg>
  );
}

// ─── TAB: CERTIFICADO ───────────────────────────────────

function CertificadoAlumnoTab({
  course,
  progressPercent,
  certificate,
  examAttempts,
}: {
  course: any;
  progressPercent: number;
  certificate: any;
  examAttempts: any[];
}) {
  const hasPassedExam = examAttempts.some((a) => a.passed);
  const meetsProgress = progressPercent >= course.minProgressForCert;
  const canGetCertificate = meetsProgress && hasPassedExam;

  if (certificate && certificate.valid) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¡Felicitaciones!</h3>
        <p className="text-gray-500 mb-6">Tu certificado está listo para descargar.</p>
        <Button size="lg">Descargar certificado PDF</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Tu camino al certificado
      </h3>

      <div className="space-y-3">
        {/* Progress requirement */}
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${meetsProgress ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
          {meetsProgress ? (
            <svg className="h-6 w-6 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              Completar al menos {course.minProgressForCert}% de las clases
            </p>
            <p className="text-xs text-gray-400">Progreso actual: {progressPercent}%</p>
          </div>
        </div>

        {/* Exam requirement */}
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${hasPassedExam ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
          {hasPassedExam ? (
            <svg className="h-6 w-6 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">Aprobar el examen final</p>
            <p className="text-xs text-gray-400">
              {course.finalExam
                ? hasPassedExam
                  ? "Aprobado"
                  : meetsProgress
                    ? "Ya podés rendir el examen"
                    : "Se habilita al completar las clases"
                : "El profesor todavía no configuró el examen"
              }
            </p>
          </div>
        </div>
      </div>

      {!canGetCertificate && (
        <p className="text-center text-sm text-gray-400 mt-6">
          Completá los requisitos para obtener tu certificado.
        </p>
      )}
    </div>
  );
}

// ─── LESSON VIEW ────────────────────────────────────────

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
    <Card className="p-0 overflow-hidden">
      {/* Lesson header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">{lesson.title}</h2>
          {isComplete && <Badge variant="success">Completada</Badge>}
        </div>
        {lesson.description && <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>}
        {lesson.estimatedMinutes && (
          <p className="text-xs text-gray-400 mt-1">{lesson.estimatedMinutes} min estimados</p>
        )}
      </div>

      {/* Videos */}
      {lesson.videos.length > 0 && (
        <div className="px-6 py-5 space-y-4">
          {lesson.videos.map((video: any) => (
            <VideoPlayer key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <div className="px-6 py-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Material de apoyo</h3>
          <div className="space-y-2">
            {lesson.resources.map((resource: any) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                  {resource.description && <p className="text-xs text-gray-400 truncate">{resource.description}</p>}
                </div>
                <span className="text-xs text-gray-300 flex-shrink-0">{resource.resourceType}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action area */}
      <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
        {isComplete ? (
          <p className="text-sm text-emerald-600 font-medium">Clase completada</p>
        ) : lesson.quiz && lesson.quizRequired ? (
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">
              Aprobá la evaluación para completar esta clase
            </p>
            {/* TODO: Quiz component will go here */}
            <p className="text-xs text-gray-400">Evaluación pendiente de implementación</p>
            {failCount >= 3 && primaryContact && (
              <a
                href={primaryContact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors"
              >
                ¿Te trabaste? Pedí ayuda en la comunidad
              </a>
            )}
          </div>
        ) : (
          <Button onClick={handleMarkComplete} loading={marking} variant="secondary">
            Marcar como vista
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── VIDEO PLAYER ───────────────────────────────────────

function VideoPlayer({ video }: { video: any }) {
  // YouTube embed
  if (video.type === "YOUTUBE") {
    const ytId = extractYouTubeId(video.url);
    if (ytId) {
      return (
        <div>
          {video.title && <p className="text-sm font-medium text-gray-700 mb-2">{video.title}</p>}
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      );
    }
  }

  // Loom embed
  if (video.type === "LOOM_LINK") {
    const loomId = video.url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)?.[1];
    if (loomId) {
      return (
        <div>
          {video.title && <p className="text-sm font-medium text-gray-700 mb-2">{video.title}</p>}
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={`https://www.loom.com/embed/${loomId}`}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      );
    }
  }

  // Google Drive embed
  if (video.type === "GOOGLE_DRIVE") {
    const driveId = video.url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (driveId) {
      return (
        <div>
          {video.title && <p className="text-sm font-medium text-gray-700 mb-2">{video.title}</p>}
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      );
    }
  }

  // Fallback: external link
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{video.title}</p>
        <p className="text-xs text-gray-400">Abrir video en nueva pestaña</p>
      </div>
    </a>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
