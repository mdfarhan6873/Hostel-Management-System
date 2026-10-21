import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CustomForm, FormResponse } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const form = await CustomForm.findById(id).lean();
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status === "CLOSED" || form.status === "DRAFT") {
      return NextResponse.json(
        { error: "This form is currently closed for submissions." },
        { status: 403 }
      );
    }

    const now = new Date();
    if (now < new Date(form.startDate)) {
      return NextResponse.json(
        { error: `This form opens for submissions on ${new Date(form.startDate).toLocaleString()}` },
        { status: 403 }
      );
    }
    if (now > new Date(form.endDate)) {
      return NextResponse.json(
        { error: `The submission deadline for this form closed on ${new Date(form.endDate).toLocaleString()}` },
        { status: 403 }
      );
    }

    // Optional auth: if logged in student, link their student ID
    const auth = await verifyAuth();
    let studentId: string | undefined = undefined;
    if (auth && auth.role === "student") {
      studentId = auth.userId;
    }

    const body = await req.json();
    const { applicantInfo, responses } = body;

    if (!applicantInfo || !applicantInfo.name || !applicantInfo.email || !applicantInfo.phone) {
      return NextResponse.json(
        { error: "Applicant name, email, and mobile number are required." },
        { status: 400 }
      );
    }

    // Server-side validation of required custom fields
    const responseMap: Record<string, any> = {};
    if (Array.isArray(responses)) {
      responses.forEach((r: any) => {
        responseMap[r.fieldId] = r.value;
      });
    }

    for (const field of form.fields || []) {
      if (field.required) {
        const val = responseMap[field.id];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          return NextResponse.json(
            { error: `Field "${field.label}" is required.` },
            { status: 400 }
          );
        }
      }
    }

    const newResponse: any = await (FormResponse as any).create({
      formId: form._id.toString(),
      formTitle: form.title,
      formType: form.formType,
      ...(studentId ? { submittedBy: studentId } : {}),
      applicantInfo: {
        name: applicantInfo.name.trim(),
        email: applicantInfo.email.trim().toLowerCase(),
        phone: applicantInfo.phone.trim(),
        rollNo: (applicantInfo.rollNo || "").trim(),
        branch: (applicantInfo.branch || "").trim(),
        session: (applicantInfo.session || "").trim(),
      },
      responses: Array.isArray(responses) ? responses : [],
      status: "PENDING",
      wardenNotes: "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your application has been successfully submitted!",
        responseId: newResponse?._id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/forms/[id]/submit error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit form" }, { status: 500 });
  }
}
