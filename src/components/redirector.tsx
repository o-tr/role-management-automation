"use client";
import { useNamespaces } from "@/hooks/use-namespaces";
import { redirect } from "next/navigation";

export const Redirector = () => {
  const { namespaces } = useNamespaces();

  if (namespaces) {
    redirect("/ns/");
  }

  return null;
};
