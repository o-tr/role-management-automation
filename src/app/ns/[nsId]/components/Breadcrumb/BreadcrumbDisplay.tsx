"use client";
import { BreadcrumbContext } from "./BreadcrumbContext";
import { Fragment, useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
                <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
