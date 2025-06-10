import "reflect-metadata";

import { Navbar } from "@/components/molecules/navbar";
import Home from "@/components/pages/Home";
import React from "react";

export default function HomePage() {
	return (
		<section className="relative flex flex-col h-screen">
			<Navbar />
			<Home />
		</section>
	);
}
