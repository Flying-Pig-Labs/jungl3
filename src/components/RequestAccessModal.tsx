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

const CONTACT_EMAIL = "priorww@gmail.com";

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

// mailto handoff rather than a backend: matches the page's pre-sales
// posture (one person on the other end) and avoids standing up an API
// just to collect a handful of leads.
function buildMailto(form: FormState): string {
  const subject = `Jungle3 access request — ${form.company || form.name || "unnamed"}`;
  const body = [
    `Name: ${form.name}`,
    `Company: ${form.company}`,
    `Role: ${form.role}`,
    `Email: ${form.email}`,
    "",
    "Use case:",
    form.useCase,
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function RequestAccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);

  const update = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = buildMailto(form);
    onOpenChange(false);
    setForm(EMPTY);
  };

  const canSubmit = form.name.trim().length > 0 && form.email.trim().length > 0;

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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-role">Role</Label>
              <Input
                id="req-role"
                value={form.role}
                onChange={update("role")}
                placeholder="CTO, VP Eng, etc."
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
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.4)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send request
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
