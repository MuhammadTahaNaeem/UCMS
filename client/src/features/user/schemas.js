import { z } from "zod";

const fileSchema = typeof File !== "undefined" ? z.instanceof(File).optional() : z.any().optional();

export const ComplaintFormSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  department: z.string().trim().min(1, "Please select a department."),
  description: z.string().trim().min(20, "Description must be at least 20 characters."),
  suggestedPriority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  attachment: fileSchema,
});

export const ProfileSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters."),
  email: z.string().trim().email("Enter a valid email address."),
});

export function buildComplaintPayload(values) {
  if (values?.attachment instanceof File) {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("department", values.department);
    formData.append("description", values.description);
    formData.append("suggestedPriority", values.suggestedPriority || "medium");
    formData.append("attachment", values.attachment);
    return formData;
  }

  const payload = { ...values };
  delete payload.attachment;
  return payload;
}
