import Image from "next/image";
import { cn } from "@/lib/utils";

export default function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="Vortix Tech"
      width={128}
      height={128}
      className={cn("w-10 h-10 object-contain rounded-xl", className)}
    />
  );
}
