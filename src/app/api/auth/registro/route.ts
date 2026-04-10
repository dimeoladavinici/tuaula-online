import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, lastName, role } = await req.json();

    if (!email || !password || !name || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    const validRoles = ["STUDENT", "TEACHER"];
    const userRole = validRoles.includes(role) ? role : "STUDENT";

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        lastName,
        role: userRole,
        ...(userRole === "TEACHER" && {
          teacherProfile: { create: {} },
        }),
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada correctamente", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
