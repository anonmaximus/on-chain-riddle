import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";
import { getDefaultConfig } from "connectkit";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const wagmiConfig = createConfig(
	getDefaultConfig({
		chains: [sepolia],
		transports: {
			[sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
		},
		walletConnectProjectId,
		appName: "On Chain Riddle",
		appDescription: "On Chain Riddle is a decentralized platform that allows users to solve riddles on the blockchain.",
		appUrl: "http://localhost:3002",

		connectors: [metaMask(), coinbaseWallet({ appName: "On Chain Riddle" }), walletConnect({ projectId: walletConnectProjectId })],
	}),
);
