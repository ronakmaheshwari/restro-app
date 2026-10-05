import { Link } from "react-router-dom";
import { ForkKnifeIcon } from "@phosphor-icons/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "../ui/button";

const menuCategories = [
  {
    title: "Starters",
    href: "/menu#starters",
    description: "Small plates, soups and appetizers to begin with.",
  },
  {
    title: "Main Course",
    href: "/menu#mains",
    description: "Signature mains, thalis, biryanis and chef specials.",
  },
  {
    title: "Desserts",
    href: "/menu#desserts",
    description: "Sweet endings — cakes, kulfi, ice creams and more.",
  },
  {
    title: "Beverages",
    href: "/menu#beverages",
    description: "Coffee, mocktails, shakes and fresh juices.",
  },
];

const exploreLinks = [
  {
    title: "Our Story",
    href: "/about",
    description: "Know the kitchen and people behind Restro.",
  },
  {
    title: "Reservations",
    href: "/reservations",
    description: "Book a table for lunch, dinner or events.",
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Find us, call us, or send feedback.",
  },
];

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-2">
        <Link to="/home" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ForkKnifeIcon className="size-5" weight="bold" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">Restro</span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Eat. Enjoy. Repeat.
            </span>
          </span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-1 p-1 md:w-[500px] md:grid-cols-2">
                  {menuCategories.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink href={item.href}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold">
                            {item.title}
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-1 p-1">
                  {exploreLinks.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink href={item.href}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold">
                            {item.title}
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/reservations"
                className={navigationMenuTriggerStyle()}
              >
                Reservations
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/contact"
                className={navigationMenuTriggerStyle()}
              >
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center gap-2">
          <Button>
            Sign up
          </Button>
          <Button>
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};
