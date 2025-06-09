"use client";

import AuthService from "@/services/AuthService";
import CookieService from "@/services/CookieService";
import { useWallet } from "@solana/wallet-adapter-react";
import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserJwtResource from "common/resources/User/UserJwtResource";
import UserPreSignRequestResource from "common/resources/User/UserPreSignRequestResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { jwtDecode } from "jwt-decode";
import React, { use, useCallback, useEffect, useState } from "react";
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

export function AuthProvider(props: IProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [jwtPairString, setJwtPairString] = useState<string | null>(cookieService.getJwtPairString());
	const [jwtContent, setJwtContent] = useState<UserJwtResource | null>(getJwtFromString(jwtPairString));
	const [jwtPair, setJwtPair] = useState<JwtPairResource | null>(jwtPairString ? JwtPairResource.hydrate<JwtPairResource>(JSON.parse(jwtPairString)) : null);

	const { publicKey, wallet, signMessage, disconnect, disconnecting } = useWallet();

	useEffect(() => {
		if (disconnecting) {
			logout();
			return;
		}

		if (publicKey && wallet && signMessage) {
			const walletAddress = publicKey.toBase58();
			const resource = UserPreSignRequestResource.hydrate<UserPreSignRequestResource>({ address: walletAddress });

			if (jwtContent?.address === walletAddress) {
				return;
			}

			preSign(resource)
				.then(async (response) => {
					const bs58Module = await import("bs58");
					const bs58 = bs58Module.default;
					const messageUint8 = new TextEncoder().encode(response.messageToSign);
					const signatureUint8 = await signMessage(messageUint8);
					const signature = bs58.encode(signatureUint8);
					const signInResource = UserSignInRequestResource.hydrate<UserSignInRequestResource>({
						address: walletAddress,
						signature,
					});
					return signIn(signInResource);
				})
				.catch(() => disconnect());
		}
	}, [publicKey, wallet, signMessage, jwtContent, disconnect, disconnecting]);

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
