import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordInput({ className, inputClassName, ...props }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <Input type={visible ? "text" : "password"} className={inputClassName ? inputClassName : "pr-10"} {...props} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-1 my-auto"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
    </div>
  );
}
