"use client"

import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import React from "react";

const SuccessMessagePage = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleOnNext = () => {
    if (user?.userType === "employer") router.push("/profile/employer");
    else if (user?.userType === "candidate") router.push("/profile/candidate");
    else router.push("/");
  };

  return (
    <div>
      <RegistrationSuccess userName={user?.firstName} onNext={handleOnNext} />
    </div>
  );
};

export default SuccessMessagePage;
