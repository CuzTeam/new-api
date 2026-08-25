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

const { createMemoryHistory, createRootRoute, createRouter, RouterProvider } =
  await import('@tanstack/react-router')
const { ThemeProvider } = await import('@/context/theme-provider')
const { AuthLayout } = await import('../auth-layout')

function renderAuthLayout() {
  const rootRoute = createRootRoute({
    component: () => (
      <ThemeProvider>
        <AuthLayout>
          <div>page content</div>
        </AuthLayout>
      </ThemeProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('auth layout top bar', () => {
  test('renders the language switcher and the theme cycle toggle on auth pages', async () => {
    renderAuthLayout()

    expect(
      await screen.findByRole('button', { name: /change language/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument()
  })

  test('still renders the page content and the home logo link', async () => {
    renderAuthLayout()

    expect(await screen.findByText('page content')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })
})
