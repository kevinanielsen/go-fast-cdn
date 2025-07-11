import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MainContentWrapperProps {
  title: string;
  children?: ReactNode;
  className?: string;
}
const MainContentWrapper = ({
  title,
  children,
  className,
}: MainContentWrapperProps) => {
  return (
    <div className="w-full h-full p-6 space-y-8">
      <h2 className="text-3xl font-bold capitalize">{title}</h2>
      <main className={cn("", className)}>{children}</main>
    </div>
  );
};

export default MainContentWrapper;
