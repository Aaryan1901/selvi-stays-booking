import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? search["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Staff Sign In — Selvi Residency" },
      {
        name: "description",
        content:
          "Sign in to the Selvi Residency admin dashboard to manage bookings, rooms, coupons and reviews.",
      },
      { property: "og:title", content: "Staff Sign In — Selvi Residency" },
      { property: "og:description", content: "Admin access for Selvi Residency staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const destination = safeNext(next);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${destination}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email", {
            description: "Confirm your address to finish creating the account.",
          });
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: destination });
    } catch (err) {
      toast.error("Sign in failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: destination });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-32 sm:pt-40">
      <p className="eyebrow">Staff area</p>
      <h1 className="gold-rule mt-2 font-display text-4xl">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full rounded-full">
          {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
        <Button type="button" variant="outline" onClick={google} className="w-full rounded-full">
          Continue with Google
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
