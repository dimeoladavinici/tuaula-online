import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTeacherCourse } from "@/actions/curso";
import { ProfesorDashboardClient } from "./dashboard-client";

export default async function ProfesorDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getTeacherCourse();

  return <ProfesorDashboardClient course={course} userName={session.user.name} />;
}
