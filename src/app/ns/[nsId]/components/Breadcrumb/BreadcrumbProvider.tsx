"use client";
import { BreadcrumbContext } from "./BreadcrumbContext";
import { FC, ReactNode, useState } from "react";

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
