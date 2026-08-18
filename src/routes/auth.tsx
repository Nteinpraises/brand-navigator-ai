import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Content Intelligence Console" },
      {
        name: "description",
        content:
          "Sign in to the AI content intelligence and personal brand automation console for Ntein Praises.",
      },
      { property: "og:title", content: "Sign in — Content Intelligence Console" },
      {
        property: "og:description",
        content: "Access your research, opportunities, drafts and automation runs.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent.");
  }

  return (
    <div className="grid-backdrop flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Content Intelligence
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Personal brand automation console
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Research, opportunities, drafts and visuals — orchestrated by your n8n workflows.
          </p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="space-y-4 pt-4" onSubmit={signIn}>
              <Field email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
              <button
                type="button"
                onClick={resetPassword}
                className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4 pt-4" onSubmit={signUp}>
              <Field email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function Field({
  email,
  password,
  setEmail,
  setPassword,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
    </>
  );
}
