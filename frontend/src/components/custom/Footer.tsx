import { Link } from "react-router-dom";
import { ForkKnifeIcon } from "@phosphor-icons/react";

export const Footer = () => {
    return (
        <footer className="mt-16 bg-stone-900 text-stone-300">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <ForkKnifeIcon className="size-5" weight="bold" />
                        </span>
                        <span className="font-display text-xl font-semibold text-white">Restro</span>
                    </div>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-400">
                        A modern kitchen serving seasonal dishes, honest prices,
                        and orders that track themselves.
                    </p>
                </div>
                <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-stone-500 uppercase">Explore</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        <Link to="/menu" className="w-fit hover:text-white">Menu</Link>
                        <Link to="/orders" className="w-fit hover:text-white">Orders</Link>
                        <Link to="/cart" className="w-fit hover:text-white">Cart</Link>
                        <Link to="/profile" className="w-fit hover:text-white">Profile</Link>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-stone-500 uppercase">Kitchen hours</p>
                    <div className="mt-3 space-y-1.5 text-sm text-stone-400">
                        <p>Mon – Fri · 11:00 — 23:00</p>
                        <p>Sat – Sun · 09:00 — 23:30</p>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10">
                <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-stone-500 sm:px-6">
                    © 2026 Restro. Crafted with care.
                </p>
            </div>
        </footer>
    );
};
