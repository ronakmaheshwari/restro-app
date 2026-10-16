import type { ReactNode } from "react";
import { Navbar } from "@/components/custom/Navbar";
import { Footer } from "@/components/custom/Footer";
import { cn } from "@/lib/utils";

export const PageShell = ({
    eyebrow,
    title,
    description,
    actions,
    children,
    wide,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    wide?: boolean;
}) => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className={cn("mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10", wide ? "max-w-6xl" : "max-w-3xl")}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        {eyebrow && (
                            <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
                                {eyebrow}
                            </p>
                        )}
                        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
                <div className="mt-6">{children}</div>
            </main>
            <Footer />
        </div>
    );
};
