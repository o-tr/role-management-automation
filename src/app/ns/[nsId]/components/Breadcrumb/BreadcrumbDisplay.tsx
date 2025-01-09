"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Fragment, useContext } from "react";
import { BreadcrumbContext } from "./BreadcrumbContext";

export const BreadcrumbDisplay = () => {
  const { value } = useContext(BreadcrumbContext);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbList>
          {value.map((item, index) => (
            <Fragment key={item.path}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
