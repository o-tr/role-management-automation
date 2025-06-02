"use client";
import { type FC, type ReactNode, useState } from "react";
import { BreadcrumbContext } from "./BreadcrumbContext";

export const BreadcrumbProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState<{ path: string; label: string }[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ value, setValue }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
