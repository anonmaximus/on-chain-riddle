"use client";

import { ConnectKitButton } from "connectkit";
import { Button } from "@heroui/button";

import { PowerIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";

export function ConnectWalletButton() {
	const { logout } = useContext(AuthContext);

	return (
		<ConnectKitButton.Custom>
			{({ isConnected, isConnecting, show, address, ensName, chain }) => {
				return (
					<div className="flex items-center gap-2">
						<Button onPress={show} isLoading={isConnecting} color={isConnected ? "success" : "primary"} variant={isConnected ? "bordered" : "solid"}>
							{isConnected ? (
								<>
									{ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`}
									{chain && ` (${chain.name})`}
								</>
							) : (
								"Connect Wallet"
							)}
						</Button>

						{isConnected && (
							<Button size="md" variant="light" color="default" onPress={() => logout()} aria-label="Disconnect wallet">
								<PowerIcon className="h-5 w-5" />
							</Button>
						)}
					</div>
				);
			}}
		</ConnectKitButton.Custom>
	);
}
