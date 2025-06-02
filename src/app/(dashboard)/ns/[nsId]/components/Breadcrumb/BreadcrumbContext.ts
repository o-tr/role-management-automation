"use client";
import { type Dispatch, type SetStateAction, createContext } from "react";

export const BreadcrumbContext = createContext<{
  value: {
    path: string;
    label: string;
  }[];
  setValue: Dispatch<
    SetStateAction<
      {
        path: string;
        label: string;
      }[]
    >
  >;
}>({
  value: [],
  setValue: () => {},
});
