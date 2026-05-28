import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  children,
  side = 'top',
  sideOffset = 6,
}: {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={sideOffset}
        className="z-50 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-neutral-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
