import { Link, NavLink, useNavigate } from "react-router-dom";
import { ForkKnifeIcon, SignOutIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const links = [
    { to: "/menu", label: "Menu" },
    { to: "/orders", label: "Orders" },
    { to: "/cart", label: "Cart" },
    { to: "/profile", label: "Profile" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
        "rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
        isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

export const Navbar = () => {
    const token = useAuthStore((s) => s.token);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                <Link to="/home" className="flex shrink-0 items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                        <ForkKnifeIcon className="size-5" weight="bold" />
                    </span>
                    <span className="flex flex-col leading-none">
                        <span className="font-display text-xl font-semibold tracking-tight">
                            Restro
                        </span>
                        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                            Seasonal kitchen
                        </span>
                    </span>
                </Link>

                {token && (
                    <nav className="hidden items-center gap-1 md:flex">
                        {links.map((l) => (
                            <NavLink key={l.to} to={l.to} className={linkClass}>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                )}

                <div className="flex shrink-0 items-center gap-2">
                    {token ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                        >
                            <SignOutIcon className="size-4" />
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link to="/signup">
                                <Button>Sign up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {token && (
                <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} className={linkClass}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    );
};
