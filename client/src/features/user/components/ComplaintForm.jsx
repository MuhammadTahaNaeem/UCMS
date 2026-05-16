import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { fetchDepartments } from "@/features/user/userApi";
import { ComplaintFormSchema, buildComplaintPayload } from "@/features/user/schemas";

export function ComplaintForm({ defaultValues, onSubmit, isSubmitting = false, submitLabel = "Submit Complaint", secondaryAction }) {
  const { data: departmentsResponse = {} } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const departments = departmentsResponse?.data || [];

  const form = useForm({
    resolver: zodResolver(ComplaintFormSchema),
    defaultValues: defaultValues ?? {
      title: "",
      department: "",
      description: "",      suggestedPriority: "medium",      attachment: undefined,
    },
  });

  const fileRef = React.useRef(null);
  const [attachment, setAttachment] = React.useState(() => form.getValues("attachment"));

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "attachment") setAttachment(value.attachment);
    });
    return () => subscription.unsubscribe?.();
  }, [form]);

  const handleSubmit = async (values) => {
    await onSubmit?.(buildComplaintPayload(values));
  };

  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <div className="p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormFieldWrapper label="Title" htmlFor="title" required error={form.formState.errors.title?.message}>
            <Input id="title" placeholder="Briefly describe the complaint" {...form.register("title")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Department" htmlFor="department" required error={form.formState.errors.department?.message}>
            <Controller
              control={form.control}
              name="department"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department.name}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Description" htmlFor="description" required error={form.formState.errors.description?.message} hint="Include key context, dates, and any supporting details.">
            <Textarea id="description" placeholder="Describe the issue in detail" className="min-h-32" {...form.register("description")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Suggested Priority" htmlFor="suggestedPriority" hint="Help admins understand the urgency of your complaint.">
            <Controller
              control={form.control}
              name="suggestedPriority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="suggestedPriority" className="w-full">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                        High
                      </span>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                        Critical
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormFieldWrapper>

          <div className="space-y-2">
            <p className="text-sm font-medium">Attachment</p>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4">
              <Input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  form.setValue("attachment", file || undefined, { shouldValidate: true });
                }}
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                <Paperclip className="size-4" />
                Choose file
              </Button>
              <p className="text-sm text-muted-foreground">{attachment?.name || "Optional supporting document, image, or PDF."}</p>
              {attachment ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    form.setValue("attachment", undefined, { shouldValidate: true });
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {secondaryAction}
            <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
              {isSubmitting || form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
