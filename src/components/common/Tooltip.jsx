import * as TooltipPrimitive from '@radix-ui/react-tooltip'

// Use a single native button/link child and keep its accessible name on the control.
export default function Tooltip({ label, children, side = 'top' }) {
  return <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className="ui-tooltip" side={side} sideOffset={8} collisionPadding={12}>
        {label}
        <TooltipPrimitive.Arrow className="ui-tooltip-arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
}
