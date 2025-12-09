import { useUser } from "@/contexts/AppContext";

export function useUserData() {
	const { userData, isLoading, refreshUserData } = useUser();

	const getUserFullName = () => {
		if (!userData) return "";
		return `${userData.first_name} ${userData.last_name}`.trim();
	};

	const getUserInitials = () => {
		const fullName = getUserFullName();
		if (!fullName) return "";

		const names = fullName.trim().split(" ");
		if (names.length >= 2) {
			return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
		}
		return fullName.substring(0, 2).toUpperCase();
	};

	const isStudent = () => {
		return userData?.role === "STUDENT";
	};

	const isStaff = () => {
		return userData?.role === "STAFF";
	};

	const isAdmin = () => {
		return userData?.role === "ADMIN";
	};

	const isLoggedIn = () => {
		return !!userData;
	};

	return {
		userData,
		isLoading,
		refreshUserData,
		getUserFullName,
		getUserInitials,
		isStudent,
		isStaff,
		isAdmin,
		isLoggedIn,
	};
}
