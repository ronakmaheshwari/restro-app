import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
    // order lifecycle
    PENDING: "bg-amber-500/15 text-amber-700 ring-amber-600/25",
    CONFIRMED: "bg-sky-500/15 text-sky-700 ring-sky-600/25",
    COMPLETED: "bg-emerald-500/15 text-emerald-700 ring-emerald-600/25",
    CANCELLED: "bg-stone-500/15 text-stone-600 ring-stone-500/25",
    // billing
    PAID: "bg-emerald-500/15 text-emerald-700 ring-emerald-600/25",
    UNPAID: "bg-amber-500/15 text-amber-700 ring-amber-600/25",
    // menu
    ACTIVE: "bg-emerald-500/15 text-emerald-700 ring-emerald-600/25",
    INACTIVE: "bg-stone-500/15 text-stone-600 ring-stone-500/25",
};

export const StatusPill = ({ value }: { value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset",
                styles[value] ?? "bg-stone-500/15 text-stone-600 ring-stone-500/25",
            )}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {value}
        </span>
    );
};
