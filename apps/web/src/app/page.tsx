"use client";
import { HomePage } from "@/features/home/HomePage";
import { registerPush } from "@/lib/utils/notificationService";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    registerPush().then(console.log).catch(console.error);
  }, []);

  return <HomePage />;
}
