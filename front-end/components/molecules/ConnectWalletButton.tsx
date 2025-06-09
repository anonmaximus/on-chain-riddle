"use client";

import { ConnectKitButton } from "connectkit";
import { Button } from "@heroui/button";

export function ConnectWalletButton() {
	return (
		<ConnectKitButton.Custom>
			{({ isConnected, isConnecting, show, address, ensName, chain }) => {
				return (
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
				);
			}}
		</ConnectKitButton.Custom>
	);
}
