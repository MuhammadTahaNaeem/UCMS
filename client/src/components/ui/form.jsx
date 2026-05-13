import * as React from "react";
import { cn } from "@/lib/utils";

function Form({ className, ...props }) {
  return <form className={cn(className)} {...props} />;
}

export { Form };