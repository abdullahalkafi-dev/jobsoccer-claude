"use client"

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

function BackButton({ title }: { title: string }) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBack}
        className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
        aria-label="Go back"
      >
        <IoArrowBack className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  );
}

export default BackButton;
