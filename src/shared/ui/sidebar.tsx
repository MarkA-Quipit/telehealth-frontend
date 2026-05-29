import * as React from 'react'
import { PanelLeft } from 'lucide-react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ─── Context ─────────────────────────────────────────────────────────────────
interface SidebarContextValue {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider')
  return ctx
}

// ─── useIsMobile ─────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )
  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ─── SidebarProvider ─────────────────────────────────────────────────────────
function SidebarProvider({
  defaultOpen = true,
  children,
  className,
  style,
  ...props
}: React.ComponentProps<'div'> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v)
    else setOpen((v) => !v)
  }, [isMobile])

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSidebar])

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'

  return (
    <SidebarContext.Provider
      value={{ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }}
    >
      <div
        data-sidebar="provider"
        data-state={state}
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn('group/sidebar-wrapper relative flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpenMobile(false)}
            aria-hidden="true"
          />
        )}
        <div
          data-sidebar="sidebar"
          data-mobile="true"
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width-mobile)] flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out md:hidden',
            openMobile ? 'translate-x-0' : '-translate-x-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }

  if (collapsible === 'none') {
    return (
      <div
        data-sidebar="sidebar"
        className={cn(
          'flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      data-sidebar="sidebar"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      className={cn('group peer hidden text-sidebar-foreground md:block', className)}
      {...props}
    >
      {/* Spacing placeholder so content shifts */}
      <div
        className={cn(
          'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
        )}
      />
      {/* Fixed panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-10 hidden h-svh w-[var(--sidebar-width)] flex-col bg-sidebar transition-[left,right,width] duration-200 ease-linear md:flex',
          'border-r border-sidebar-border',
          'group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
          'group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
          side === 'right' &&
            'left-auto right-0 group-data-[collapsible=offcanvas]:left-auto group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ─── SidebarTrigger ──────────────────────────────────────────────────────────
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle Sidebar"
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className,
      )}
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
    </button>
  )
}

// ─── SidebarInset ────────────────────────────────────────────────────────────
function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-sidebar="inset"
      className={cn('relative flex min-h-svh flex-1 flex-col bg-background overflow-hidden', className)}
      {...props}
    />
  )
}

// ─── Structural sub-components ────────────────────────────────────────────────
function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="content"
      className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', className)}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<'hr'>) {
  return (
    <hr
      data-sidebar="separator"
      className={cn('mx-2 w-auto border-t border-sidebar-border', className)}
      {...props}
    />
  )
}

// ─── Group components ────────────────────────────────────────────────────────
function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none transition-[margin,opacity] duration-200 ease-linear',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  )
}

// ─── Menu components ─────────────────────────────────────────────────────────
function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  [
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none',
    'ring-sidebar-ring transition-[width,height,padding]',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    'focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground',
    'group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2',
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean
    isActive?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        'absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  // eslint-disable-next-line react-refresh/only-export-components
  sidebarMenuButtonVariants,
}
