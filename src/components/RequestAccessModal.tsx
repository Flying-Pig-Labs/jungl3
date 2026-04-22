import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FormState = {
  name: string;
  company: string;
  role: string;
  email: string;
  useCase: string;
};

const EMPTY: FormState = {
  name: "",
  company: "",
  role: "",
  email: "",
  useCase: "",
};

export function RequestAccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Persist the lead in Lovable Cloud. RLS allows anonymous inserts on
    // this table; reads are owner-only via the dashboard.
    const { error } = await supabase.from("access_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      use_case: form.useCase.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't send your request. Please try again.");
      return;
    }

    toast.success("Request sent. We'll be in touch.");
    onOpenChange(false);
    setForm(EMPTY);
  };

  const canSubmit =
    !submitting && form.name.trim().length > 0 && form.email.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Request access</DialogTitle>
          <DialogDescription>
            Tell us who you are and what you're trying to do. We'll get back
            to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="req-name">Name</Label>
            <Input
              id="req-name"
              value={form.name}
              onChange={update("name")}
              required
              autoComplete="name"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-email">Email</Label>
            <Input
              id="req-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              autoComplete="email"
              maxLength={320}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="req-company">Company</Label>
              <Input
                id="req-company"
                value={form.company}
                onChange={update("company")}
                autoComplete="organization"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-role">Role</Label>
              <Input
                id="req-role"
                value={form.role}
                onChange={update("role")}
                placeholder="CTO, VP Eng, etc."
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-use-case">What are you trying to do?</Label>
            <textarea
              id="req-use-case"
              value={form.useCase}
              onChange={update("useCase")}
              rows={4}
              maxLength={4000}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.4)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
