"use client";
import {createContext, Dispatch, SetStateAction} from "react";

export const BreadcrumbContext = createContext<{
  value: {
    path: string;
    label: string
  }[];
  setValue: Dispatch<SetStateAction<{
    path: string;
    label: string
  }[]>>;
}>({
  value: [],
  setValue: () => {}
});
