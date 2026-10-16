import { ForkKnifeIcon } from "@phosphor-icons/react";

function hashHue(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (h * 31 + seed.charCodeAt(i)) % 360;
    }
    // Keep hues in the warm, appetizing band (reds → oranges → golds → plums)
    const bands = [12, 24, 36, 48, 60, 330, 345, 18, 28, 42];
    return bands[h % bands.length];
}

/** Warm gradient artwork for a dish (the API serves no images). */
export const DishArt = ({ id, name, size = "md" }: { id: string; name: string; size?: "sm" | "md" | "lg" }) => {
    const hue = hashHue(id);
    const heights = { sm: "h-24", md: "h-36", lg: "h-52" } as const;
    const letters = { sm: "text-3xl", md: "text-5xl", lg: "text-7xl" } as const;

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden ${heights[size]}`}
            style={{
                background: `linear-gradient(135deg, hsl(${hue} 55% 32%) 0%, hsl(${(hue + 24) % 360} 65% 48%) 55%, hsl(${(hue + 48) % 360} 70% 62%) 100%)`,
            }}
        >
            <div
                className="absolute inset-0 opacity-25"
                style={{
                    backgroundImage: "radial-gradient(hsl(0 0% 100% / 35%) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                }}
            />
            <div className="absolute -right-8 -bottom-10 size-36 rounded-full bg-white/15 blur-xl" />
            <div className="absolute -top-10 -left-8 size-28 rounded-full bg-black/15 blur-xl" />
            <span className={`relative font-display font-semibold text-white/95 drop-shadow-md ${letters[size]}`}>
                {name.trim().charAt(0).toUpperCase() || "R"}
            </span>
            <span className="absolute right-3 bottom-2.5 flex items-center gap-1 text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                <ForkKnifeIcon className="size-3" weight="bold" />
                Restro
            </span>
        </div>
    );
};
