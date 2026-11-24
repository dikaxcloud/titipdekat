import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-line bg-mist text-ink [&>svg]:text-muted",
        info: "border-blue-100 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
        success:
          "border-emerald-100 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
        warning:
          "border-amber-100 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
        danger: "border-red-100 bg-red-50 text-red-900 [&>svg]:text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  hideIcon?: boolean;
}

function Alert({
  className,
  variant = "default",
  hideIcon = false,
  children,
  ...props
}: AlertProps) {
  const Icon = icons[variant ?? "default"];
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {!hideIcon && <Icon />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("font-semibold", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("mt-0.5 text-sm leading-relaxed opacity-90", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
