import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AnimatedOutlet } from '@/components/page-transition'
import { SkipToMain } from '@/components/skip-to-main'
import { TopBanner } from '@/components/top-banner'
import { WorkspaceProvider } from '../context/workspace-context'
import { AppSidebar } from './app-sidebar'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout(props: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <LayoutProvider>
      <SearchProvider>
        <WorkspaceProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                '@container/content',
                'h-svh',
                'overflow-hidden',
                'peer-data-[variant=inset]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              <div className='authenticated-main-frame'>
                <TopBanner />
                <div className='authenticated-main-content'>
                  {props.children ?? <AnimatedOutlet />}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </WorkspaceProvider>
      </SearchProvider>
    </LayoutProvider>
  )
}
