import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export function useAuthCheck() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const token = useAppSelector((state) => state.auth.token);
  
  const router = useRouter();
  const isAuthenticated = !!token;

  const checkAuth = (action: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }
    action();
    return true;
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    router.push("/signin");
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return {
    isAuthenticated,
    showLoginModal,
    checkAuth,
    handleLogin,
    handleCloseModal,
  };
}
