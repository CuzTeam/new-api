/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const { createMemoryHistory, createRootRoute, createRouter, RouterProvider } =
  await import('@tanstack/react-router')
const { SearchProvider } = await import('@/context/search-provider')
const { ThemeProvider } = await import('@/context/theme-provider')
const { useSystemConfigStore } = await import('@/stores/system-config-store')
const { HeaderActions } = await import('../header-actions')

type Overrides = Partial<{
  showSearch: boolean
  showNotifications: boolean
  showLanguageSwitcher: boolean
  showThemeSwitch: boolean
  showAuth: boolean
}>

function renderHeaderActions(overrides: Overrides = {}) {
  // Skip the loading skeleton so the auth entry renders immediately
  useSystemConfigStore.getState().setLoading(false)
  const actionsProps = {
    showSearch: true,
    showNotifications: true,
    showLanguageSwitcher: true,
    showThemeSwitch: true,
    showAuth: true,
    ...overrides,
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SearchProvider>
            <main>
              <HeaderActions {...actionsProps} />
            </main>
          </SearchProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

function actionNames() {
  const region = screen.getByRole('main')
  return [...region.querySelectorAll('button, a')].map(
    (el) => el.getAttribute('aria-label') ?? el.textContent
  )
}

describe('header actions group', () => {
  test('renders every action in the fixed global order', async () => {
    renderHeaderActions()

    await screen.findByRole('button', { name: 'Search' })
    expect(actionNames()).toEqual([
      'Search',
      'Notifications',
      'Change language',
      'Toggle theme: System',
      'Sign in',
      'Sign up',
    ])
  })

  test('omits disabled entries without changing the remaining order', async () => {
    renderHeaderActions({ showSearch: false, showNotifications: false })

    await screen.findByRole('button', { name: 'Change language' })
    expect(actionNames()).toEqual([
      'Change language',
      'Toggle theme: System',
      'Sign in',
      'Sign up',
    ])
  })
})
