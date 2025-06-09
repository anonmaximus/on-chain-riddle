import "reflect-metadata";


import { Navbar } from "@/components/molecules/navbar";

export default function Home() {
	return (
		<section className="relative flex flex-col h-screen">
			<Navbar />
		</section>
	);
}
