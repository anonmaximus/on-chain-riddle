import { Logo } from "@/components/assets/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/navbar";

import NextLink from "next/link";

import { ConnectWallet } from "../atoms/ConnectWallet";

export function Navbar() {
	return (
		<HeroUINavbar maxWidth="xl" position="sticky">
			<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand as="li" className="gap-3 max-w-fit">
					<NextLink className="flex justify-start items-center gap-1" href="/">
						<Logo />
						<p className="font-bold text-inherit">On Chain Riddle</p>
					</NextLink>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
				<NavbarItem className="hidden sm:flex">
					<ThemeSwitch />
				</NavbarItem>
				<NavbarItem className="hidden sm:flex gap-2">
					<ConnectWallet />
				</NavbarItem>

				<NavbarMenuToggle className="sm:hidden" />
			</NavbarContent>

			<NavbarMenu>
				<NavbarMenuItem className="hidden sm:flex">
					<ThemeSwitch />
				</NavbarMenuItem>
				<NavbarMenuItem>
					<ConnectWallet />
				</NavbarMenuItem>
			</NavbarMenu>
		</HeroUINavbar>
	);
}
