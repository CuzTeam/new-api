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
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const { createMemoryHistory, createRootRoute, createRouter, RouterProvider } =
  await import('@tanstack/react-router')
const { useSystemConfigStore } = await import('@/stores/system-config-store')
const { Footer } = await import('../footer')

const REPOSITORY_URL = 'https://github.com/CuzTeam/new-api'
const FALLBACK_QUOTE = '人是要整活的——没活了，可不就是死了么？'

function stubHitokotoFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(impl))
}

async function renderFooter(statusData?: Record<string, unknown>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  if (statusData) {
    queryClient.setQueryData(['status'], statusData)
  }
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  window.localStorage.clear()
  useSystemConfigStore
    .getState()
    .setConfig({ systemName: 'Cuz AI', footerHtml: undefined })
  stubHitokotoFetch(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ hitokoto: '来自一言接口的句子' }),
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Footer', () => {
  test('swaps the fallback quote for the Hitokoto API quote once loaded', async () => {
    await renderFooter()

    expect(screen.getByText(FALLBACK_QUOTE)).toBeInTheDocument()
    expect(await screen.findByText('来自一言接口的句子')).toBeInTheDocument()
    expect(screen.queryByText(FALLBACK_QUOTE)).not.toBeInTheDocument()
  })

  test('keeps the fallback quote when the Hitokoto request fails', async () => {
    stubHitokotoFetch(() => Promise.reject(new Error('network down')))
    await renderFooter()

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    expect(screen.getByText(FALLBACK_QUOTE)).toBeInTheDocument()
  })

  test('links site name, commit hash and OSS label to the project repository', async () => {
    await renderFooter({ version: 'de7b17' })

    const siteLink = screen.getByRole('link', { name: 'Cuz AI' })
    const hashLink = screen.getByRole('link', { name: '(de7b17)' })
    const ossLink = screen.getByRole('link', { name: 'Open Source Software' })

    for (const link of [siteLink, hashLink, ossLink]) {
      expect(link).toHaveAttribute('href', REPOSITORY_URL)
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  test('omits the commit hash when the status payload has no version', async () => {
    await renderFooter({ version: '' })

    expect(screen.getByRole('link', { name: 'Cuz AI' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /^\(.+\)$/ })
    ).not.toBeInTheDocument()
  })

  test('renders the configured custom footer HTML in the unwrapped custom area', async () => {
    useSystemConfigStore
      .getState()
      .setConfig({ footerHtml: '<p>Custom blurb</p>' })
    await renderFooter()

    const customContent = screen.getByText('Custom blurb')
    expect(customContent).toBeInTheDocument()
    expect(customContent.closest('.custom-footer')).not.toBeNull()
  })

  test('shows legal links alongside the credit row when enabled', async () => {
    await renderFooter({
      user_agreement_enabled: true,
      privacy_policy_enabled: true,
    })

    expect(
      screen.getByRole('link', { name: 'User Agreement' })
    ).toHaveAttribute('href', '/user-agreement')
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/privacy-policy')
  })
})
