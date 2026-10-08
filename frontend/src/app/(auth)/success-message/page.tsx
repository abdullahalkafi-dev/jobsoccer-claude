"use client"

import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { useRouter } from "next/navigation";
import React from "react";

const SuccessMessagePage = () => {
  const router = useRouter();
  
  const handleOnNext = () => {
    router.push("/profile/complete")
  };

  return (
    <div>
      <RegistrationSuccess userName="Suman" onNext={handleOnNext} />
    </div>
  );
};

export default SuccessMessagePage;
