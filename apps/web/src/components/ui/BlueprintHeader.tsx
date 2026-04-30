"use client";

import { ReactNode } from "react";
import { BlueprintBrackets } from "@/components/ui/BlueprintBrackets";

interface BlueprintHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export function BlueprintHeader({ title, subtitle, className = "" }: BlueprintHeaderProps) {
  return (
    <BlueprintBrackets title={title} subtitle={subtitle} className={className} />
  );
}