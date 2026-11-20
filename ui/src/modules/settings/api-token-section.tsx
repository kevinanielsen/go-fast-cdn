import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, type APITokenScope } from "@/services/authService";
import type { IErrorResponse } from "@/types/response";

const scopes: Record<APITokenScope, string> = {
  "cdn:upload": "Upload files",
  "cdn:rename": "Rename files",
  "cdn:resize": "Resize images",
  "cdn:delete": "Delete files",
};

function showError(error: unknown, fallback: string) {
  toast.error(isAxiosError<IErrorResponse>(error) ? error.response?.data?.error || fallback : fallback);
}

export default function APITokenSection({ userId, twoFactorEnabled }: {
  userId: number;
  twoFactorEnabled: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["profile-api-tokens", userId];
  const tokens = useQuery({
    queryKey,
    queryFn: authService.listAPITokens,
    retry: false,
    refetchInterval: 60_000,
  });
  const [secret, setSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);

  async function createToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selectedScopes = (Object.keys(scopes) as APITokenScope[]).filter((key) =>
      data.getAll("scopes").includes(key)
    );
    if (selectedScopes.length === 0) {
      toast.error("Choose at least one token permission.");
      return;
    }
    setCreating(true);
    try {
      const { token } = await authService.createAPIToken({
        name: String(data.get("name") ?? ""),
        scopes: selectedScopes,
        expires_in_days: Number(data.get("expiry")),
        current_password: String(data.get("password") ?? ""),
        two_fa_token: twoFactorEnabled ? String(data.get("code") ?? "") : undefined,
      });
      form.reset();
      setSecret(token);
      void queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      showError(error, "Could not create API token.");
    } finally {
      for (const field of form.querySelectorAll<HTMLInputElement>('input[name="password"], input[name="code"]')) {
        field.value = "";
      }
      setCreating(false);
    }
  }

  async function revokeToken(id: number) {
    setRevoking(id);
    try {
      await authService.revokeAPIToken(id);
      setSecret(null);
      toast.success("API token revoked.");
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      showError(error, "Could not revoke API token.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <section aria-labelledby="api-token-title" className="space-y-4">
      <div>
        <h3 id="api-token-title" className="text-lg font-medium">API tokens</h3>
        <p className="text-sm text-muted-foreground">
          Select only the CDN operations this token needs. Tokens cannot access your profile or admin settings.
        </p>
      </div>
      {secret ? (
        <div className="space-y-3 rounded-md border p-4">
          <p role="status">Copy this token now. It will not be shown again.</p>
          <Input aria-label="New API token" readOnly value={secret} onFocus={(event) => event.target.select()} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(secret);
                toast.success("API token copied.");
              } catch {
                toast.error("Clipboard unavailable. Select and copy the token manually.");
              }
            }}>Copy token</Button>
            <Button type="button" variant="outline" onClick={() => setSecret(null)}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={createToken} className="space-y-3">
          <fieldset disabled={creating || revoking !== null} className="space-y-3">
            <Label htmlFor="api-token-name">Token name</Label>
            <Input id="api-token-name" name="name" required maxLength={64} placeholder="e.g. Build uploads" />
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Permissions</legend>
              {(Object.entries(scopes) as [APITokenScope, string][]).map(([scope, label]) => (
                <div key={scope} className="flex items-center gap-2">
                  <Checkbox id={`api-token-${scope}`} name="scopes" value={scope} />
                  <Label htmlFor={`api-token-${scope}`}>{label}</Label>
                </div>
              ))}
            </fieldset>
            <Label htmlFor="api-token-expiry">Expires in</Label>
            <select id="api-token-expiry" name="expiry" defaultValue="30" className="block h-9 w-full rounded-md border bg-background px-2">
              {[7, 30, 90].map((days) => <option key={days} value={days}>{days} days</option>)}
            </select>
            <Label htmlFor="api-token-password">Current password</Label>
            <Input id="api-token-password" name="password" type="password" autoComplete="current-password" required />
            {twoFactorEnabled && (
              <>
                <Label htmlFor="api-token-code">Authenticator code</Label>
                <Input id="api-token-code" name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" required />
              </>
            )}
            <Button type="submit">{creating ? "Creating…" : "Create API token"}</Button>
          </fieldset>
        </form>
      )}
      {tokens.isPending && <p role="status">Loading API tokens…</p>}
      {tokens.isError && (
        <div role="alert">
          <p>Could not load API tokens.</p>
          <Button type="button" variant="outline" onClick={() => void tokens.refetch()}>Retry</Button>
        </div>
      )}
      {tokens.data?.length === 0 && <p className="text-sm text-muted-foreground">No API tokens yet.</p>}
      {tokens.data && tokens.data.length > 0 && (
        <ul className="space-y-2">
          {tokens.data.map((token) => {
            const expiresAt = new Date(token.expires_at);
            const status = token.revoked_at ? "Revoked" : expiresAt.getTime() <= tokens.dataUpdatedAt ? "Expired" : "Active";
            return (
              <li key={token.id} className="space-y-2 rounded-md border p-3">
                <p className="break-all font-medium">{token.name}</p>
                <p className="text-sm text-muted-foreground">{token.scopes.map((scope) => scopes[scope]).join(", ")} · {status}</p>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(token.created_at).toLocaleDateString()} · Expires {expiresAt.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last used: {token.last_used_at ? new Date(token.last_used_at).toLocaleString() : "Never"}
                </p>
                {status === "Active" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm" disabled={creating || secret !== null || revoking !== null}>
                        {revoking === token.id ? "Revoking…" : "Revoke"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke {token.name}?</AlertDialogTitle>
                        <AlertDialogDescription>Requests using this token will stop working. This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void revokeToken(token.id)}>Revoke token</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
