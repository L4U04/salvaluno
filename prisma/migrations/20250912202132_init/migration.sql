-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'ALUMNI');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('PENDING', 'ENROLLED', 'DROPPED', 'COMPLETED', 'FAILED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "public"."TeacherRole" AS ENUM ('LEAD_INSTRUCTOR', 'ASSISTANT_INSTRUCTOR', 'TEACHING_ASSISTANT', 'GUEST_LECTURER');

-- CreateEnum
CREATE TYPE "public"."Department" AS ENUM ('CCAB', 'CETEC');

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "department" "public"."Department" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "id" TEXT NOT NULL,
    "sectionNumber" VARCHAR(10) NOT NULL,
    "year" INTEGER NOT NULL,
    "maxEnrollment" INTEGER NOT NULL DEFAULT 30,
    "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "studentNumber" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "dateOfBirth" DATE,
    "address" TEXT,
    "major" "public"."Department",
    "status" "public"."StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "department" "public"."Department",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "grade" VARCHAR(5),
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_sections" (
    "id" TEXT NOT NULL,
    "role" "public"."TeacherRole" NOT NULL DEFAULT 'LEAD_INSTRUCTOR',
    "teacherId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "teacher_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "public"."courses"("code");

-- CreateIndex
CREATE INDEX "courses_code_idx" ON "public"."courses"("code");

-- CreateIndex
CREATE INDEX "courses_department_idx" ON "public"."courses"("department");

-- CreateIndex
CREATE INDEX "sections_courseId_idx" ON "public"."sections"("courseId");

-- CreateIndex
CREATE INDEX "sections_year_idx" ON "public"."sections"("year");

-- CreateIndex
CREATE UNIQUE INDEX "sections_courseId_sectionNumber_year_key" ON "public"."sections"("courseId", "sectionNumber", "year");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentNumber_key" ON "public"."students"("studentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE INDEX "students_studentNumber_idx" ON "public"."students"("studentNumber");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "public"."students"("email");

-- CreateIndex
CREATE INDEX "students_major_idx" ON "public"."students"("major");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "public"."students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "public"."teachers"("email");

-- CreateIndex
CREATE INDEX "teachers_email_idx" ON "public"."teachers"("email");

-- CreateIndex
CREATE INDEX "teachers_department_idx" ON "public"."teachers"("department");

-- CreateIndex
CREATE INDEX "enrollments_studentId_idx" ON "public"."enrollments"("studentId");

-- CreateIndex
CREATE INDEX "enrollments_sectionId_idx" ON "public"."enrollments"("sectionId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "public"."enrollments"("status");

-- CreateIndex
CREATE INDEX "enrollments_enrolledAt_idx" ON "public"."enrollments"("enrolledAt");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_sectionId_key" ON "public"."enrollments"("studentId", "sectionId");

-- CreateIndex
CREATE INDEX "teacher_sections_teacherId_idx" ON "public"."teacher_sections"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_sections_sectionId_idx" ON "public"."teacher_sections"("sectionId");

-- CreateIndex
CREATE INDEX "teacher_sections_role_idx" ON "public"."teacher_sections"("role");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_sections_teacherId_sectionId_key" ON "public"."teacher_sections"("teacherId", "sectionId");

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_sections" ADD CONSTRAINT "teacher_sections_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_sections" ADD CONSTRAINT "teacher_sections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
