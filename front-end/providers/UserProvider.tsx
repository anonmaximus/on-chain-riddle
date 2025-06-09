"use client";

import UserResponseResource from "common/resources/User/UserResponseResource";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import UserService from "services/UserService";
import { container } from "tsyringe";
import { useDisconnect, useAccount } from "wagmi";

import { AuthContext } from "./AuthProvider";

export type IUserContext = {
	isLoading: boolean;
	user: UserResponseResource | null;
	updateUser: (user: UserResponseResource | null) => void;
};

type IProps = {
	children: ReactNode;
};

export const UserContext = createContext<IUserContext>(undefined!);

const userService = container.resolve(UserService);

export function UserProvider(props: IProps) {
	const { jwtContent, isLoading: isAuthLoading } = useContext(AuthContext);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [user, setUser] = useState<UserResponseResource | null>(null);

	const { disconnect } = useDisconnect();
	const { isConnected } = useAccount();

	useEffect(() => {
		setIsLoading(true);
		if (!jwtContent) {
			setUser(null);
			setIsLoading(false);
			if (isConnected) {
				disconnect();
			}
			return;
		}

		userService
			.get(jwtContent.id)
			.then((user) => setUser(user))
			.finally(() => setIsLoading(false));
	}, [jwtContent, isConnected, disconnect]);

	return (
		<UserContext.Provider
			value={{
				isLoading: isAuthLoading || isLoading,
				user,
				updateUser: setUser,
			}}>
			{props.children}
		</UserContext.Provider>
	);
}