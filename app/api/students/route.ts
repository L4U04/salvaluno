import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const students = await prisma.student.findMany();

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      studentNumber,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      major,
    } = data;

    if (!studentNumber || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error: 'studentNumber, firstName, lastName, and email are required.',
        },
        { status: 400 },
      );
    }

    const allowedMajors = ['CCAB', 'CETEC'];
    if (major && !allowedMajors.includes(major)) {
      return NextResponse.json(
        { error: `Invalid major. Allowed values: ${allowedMajors.join(', ')}` },
        { status: 400 },
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        studentNumber,
        firstName,
        lastName,
        email,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        major: major || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create student.' },
      { status: 500 },
    );
  }
}
