"use client";

import "reflect-metadata";

import AuthService from "@/services/AuthService";
import CookieService from "@/services/CookieService";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserJwtResource from "common/resources/User/UserJwtResource";
import UserPreSignRequestResource from "common/resources/User/UserPreSignRequestResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useState } from "react";
import { container } from "tsyringe";

const authService = container.resolve(AuthService);
const cookieService = container.resolve(CookieService);

type IAuthContext = {
	preSign: typeof authService.preSign;
	signIn: typeof authService.signIn;
	logout: typeof authService.logout;
	jwtContent: UserJwtResource | null;
	jwtPair: JwtPairResource | null;
	isLoading: boolean;
};

type IProps = {
	children: React.ReactNode;
};

export const AuthContext = React.createContext<IAuthContext>(undefined!);

export function AuthProvider(props: IProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [jwtPairString, setJwtPairString] = useState<string | null>(cookieService.getJwtPairString());
	const [jwtContent, setJwtContent] = useState<UserJwtResource | null>(getJwtFromString(jwtPairString));
	const [jwtPair, setJwtPair] = useState<JwtPairResource | null>(jwtPairString ? JwtPairResource.hydrate<JwtPairResource>(JSON.parse(jwtPairString)) : null);

	const { address, isConnected, isReconnecting, isConnecting, connector, status, chain } = useAccount();
	const { signMessageAsync, isError: isSignError, error: signError } = useSignMessage();
	const { disconnect } = useDisconnect();

	const preSign = useCallback((...args: Parameters<AuthService["preSign"]>) => {
		setIsLoading(true);
		return authService.preSign(...args).finally(() => setIsLoading(false));
	}, []);

	const signIn = useCallback((...args: Parameters<AuthService["signIn"]>) => {
		setIsLoading(true);
		return authService.signIn(...args).finally(() => setIsLoading(false));
	}, []);

	const logout = useCallback((...args: Parameters<AuthService["logout"]>) => {
		setIsLoading(true);
		return authService.logout(...args).finally(() => setIsLoading(false));
	}, []);

	const logConnectionState = useCallback(() => {
		console.group("🔐 Auth Provider - Connection State");
		console.log("Address:", address);
		console.log("Status:", status);
		console.log("Is Connected:", isConnected);
		console.log("Is Connecting:", isConnecting);
		console.log("Is Reconnecting:", isReconnecting);
		console.log("Connector:", connector?.name);
		console.log("Chain:", chain?.name);
		console.log("Can Sign:", !!signMessageAsync);
		console.log("Current JWT Address:", jwtContent?.address);
		console.groupEnd();
	}, [address, status, isConnected, isConnecting, isReconnecting, connector, chain, signMessageAsync, jwtContent]);

	useEffect(() => {
		logConnectionState();

		if (!isConnected && !isReconnecting && !isConnecting) {
			console.log("Not connected, logging out...");
			logout();
			return;
		}

		if (address && isConnected && signMessageAsync && connector) {
			console.log("Connected with address:", address);
			const walletAddress = address.toLowerCase();
			const resource = UserPreSignRequestResource.hydrate<UserPreSignRequestResource>({ address: walletAddress });

			if (jwtContent?.address === walletAddress) {
				console.log("Already authenticated with this address:", walletAddress);
				return;
			}
			console.log("Pre-signing with resource:", resource);

			preSign(resource)
				.then(async (response) => {
					console.log("Attempting to sign message with connector:", connector.name);

					const signature = await signMessageAsync({
						message: response.messageToSign,
					});

					const signInResource = UserSignInRequestResource.hydrate<UserSignInRequestResource>({
						address: walletAddress,
						signature,
					});

					return signIn(signInResource);
				})
				.catch((error) => {
					console.error("Error during preSign:", error);
					disconnect();
				});
		}
	}, [address, isConnected, isReconnecting, isConnecting, signMessageAsync, jwtContent, disconnect, connector, logConnectionState]);

	useEffect(() => {
		if (isSignError && signError) {
			console.error("Sign message error:", signError);
		}
	}, [isSignError, signError]);

	// When the jwt pair changes, we update the cookies
	useEffect(() => {
		const onChange = ((e: CustomEvent<string | null>) => {
			setJwtPairString(e.detail);
			setJwtContent(getJwtFromString(e.detail));
			if (e.detail) {
				try {
					const jwtPairObj = JwtPairResource.hydrate<JwtPairResource>(JSON.parse(e.detail));
					setJwtPair(jwtPairObj);
				} catch (error) {
					console.error("Error parsing JWT pair:", error);
					setJwtPair(null);
				}
			} else {
				setJwtPair(null);
			}
		}) as EventListener;
		document.addEventListener("jwt_cookie_change", onChange);
		return () => {
			document.removeEventListener("jwt_cookie_change", onChange);
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{
				preSign,
				signIn,
				logout,
				jwtContent,
				jwtPair,
				isLoading,
			}}>
			{props.children}
		</AuthContext.Provider>
	);
}

function getJwtFromString(jwtString: string | null) {
	// If the jwt string is empty, we set the jwt content to null
	if (!jwtString) return null;
	try {
		const jwtPair = JwtPairResource.hydrate<JwtPairResource>(JSON.parse(jwtString));
		const jwtPayload = jwtDecode<{ user: UserJwtResource }>(jwtPair.accessToken);

		if (!jwtPayload || typeof jwtPayload === "string") return null;

		return UserJwtResource.hydrate<UserJwtResource>(jwtPayload.user);
	} catch (error) {
		console.error(error);
		return null;
	}
}
