import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AtIcon, ShieldCheckIcon, UserCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/custom/PageShell";
import { StatusPill } from "@/components/custom/StatusPill";
import { cardClass, inputClass, labelClass } from "@/components/custom/form";
import { authService } from "@/api/api-service";
import { useAuthStore } from "@/store/useAuthStore";

export const Profile = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    const meQuery = useQuery({
        queryKey: ["me"],
        queryFn: () => authService.getMe(),
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formOk, setFormOk] = useState<string | null>(null);

    const editMutation = useMutation({
        mutationFn: () => authService.editMe({ name: name || null, email: email || null, role: null, user_status: null }),
        onSuccess: (res) => {
            if (res.success) {
                setFormOk(res.message);
                setFormError(null);
                setName("");
                setEmail("");
                queryClient.invalidateQueries({ queryKey: ["me"] });
            } else {
                setFormError(res.message);
                setFormOk(null);
            }
        },
        onError: () => setFormError("Failed to update profile."),
    });

    const deleteMutation = useMutation({
        mutationFn: () => authService.deleteAccount(),
        onSuccess: (res) => {
            if (res.success) {
                logout();
                navigate("/signup", { replace: true });
            } else {
                setFormError(res.message);
            }
        },
        onError: () => setFormError("Failed to delete account."),
    });

    const me = meQuery.data?.data;

    return (
        <PageShell
            eyebrow="Account"
            title="Your profile"
            description="Who the kitchen sees when you order."
        >
            {meQuery.isLoading ? (
                <div className={`${cardClass} animate-pulse p-6`}>
                    <div className="h-6 w-1/2 rounded bg-muted" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
                </div>
            ) : meQuery.data && !meQuery.data.success ? (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                    {meQuery.data.message}
                </p>
            ) : me ? (
                <div className={`${cardClass} flex items-center gap-5 p-6`}>
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-primary font-display text-2xl font-semibold text-primary-foreground">
                        {me.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-display text-2xl font-semibold">{me.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <AtIcon className="size-4" />
                            {me.email}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold tracking-wide text-secondary-foreground">
                                <ShieldCheckIcon className="size-3.5" />
                                {me.role}
                            </span>
                            <StatusPill value={me.user_status} />
                        </div>
                    </div>
                </div>
            ) : null}

            <div className={`${cardClass} mt-4 p-6`}>
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <UserCircleIcon className="size-5 text-primary" weight="bold" />
                    Edit details
                </h2>
                {formError && (
                    <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-[13px] font-medium text-destructive">
                        {formError}
                    </p>
                )}
                {formOk && (
                    <p className="mt-3 rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
                        {formOk}
                    </p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>New name</label>
                        <input
                            className={inputClass}
                            placeholder="Leave blank to keep"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>New email</label>
                        <input
                            className={inputClass}
                            placeholder="Leave blank to keep"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <Button className="mt-4" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>
                    {editMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>

            <div className={`${cardClass} mt-4 border-destructive/30 p-6`}>
                <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    Deleting your account is permanent — orders tied to it go with you.
                </p>
                <Button
                    variant="destructive"
                    className="mt-4"
                    onClick={() => {
                        if (window.confirm("Delete your account permanently?")) deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Deleting…" : "Delete account"}
                </Button>
            </div>
        </PageShell>
    );
};
