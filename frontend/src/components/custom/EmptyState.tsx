import type { ReactNode } from "react";
import { TrayIcon } from "@phosphor-icons/react";

export const EmptyState = ({
    title,
    hint,
    action,
}: {
    title: string;
    hint?: string;
    action?: ReactNode;
}) => {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <TrayIcon className="size-6" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold">{title}</p>
            {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};
