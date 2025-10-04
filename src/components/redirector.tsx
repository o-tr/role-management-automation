"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useNamespaces } from "@/hooks/use-namespaces";

export const Redirector = () => {
  const { namespaces } = useNamespaces();

  useEffect(() => {
    if (namespaces) {
      redirect("/ns/");
    }
  }, [namespaces]); // Add namespaces to the dependency array

  return null;
};
