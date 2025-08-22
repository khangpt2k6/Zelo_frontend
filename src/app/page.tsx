"use client";

import { useAppData } from "@/context/AppContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const Page = () => {
  const { isAuth, loading } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuth) {
        router.push("/chat");
      } else {
        router.push("/login");
      }
    }
  }, [isAuth, loading, router]);

  if (loading) return <Loading />;
  
  return <Loading />;
};

export default Page;
