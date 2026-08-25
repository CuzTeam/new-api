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
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'

const { removeCookie } = await import('@/lib/cookies')
const { ThemeProvider } = await import('@/context/theme-provider')
const { ThemeSwitch } = await import('../theme-switch')

function Harness() {
  return (
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>
  )
}

function getButton() {
  return screen.getByRole('button', { name: /toggle theme/i })
}

describe('theme switch cycle button', () => {
  beforeEach(() => {
    removeCookie('vite-ui-theme')
    document.documentElement.classList.remove('light', 'dark')
  })

  test('defaults to system and exposes the current mode in the accessible name', () => {
    render(<Harness />)

    expect(getButton().getAttribute('aria-label')).toBe('Toggle theme: System')
    // matchMedia is mocked to light in the test setup
    expect(document.documentElement).toHaveClass('light')
  })

  test('each click switches the theme immediately without opening a menu', () => {
    render(<Harness />)

    fireEvent.click(getButton())

    expect(screen.queryByRole('menu')).toBeNull()
    expect(getButton().getAttribute('aria-label')).toBe('Toggle theme: Light')
    expect(document.documentElement).toHaveClass('light')
  })

  test('cycles system -> light -> dark -> system on repeated clicks', () => {
    render(<Harness />)

    fireEvent.click(getButton())
    expect(getButton().getAttribute('aria-label')).toBe('Toggle theme: Light')
    expect(document.documentElement).toHaveClass('light')

    fireEvent.click(getButton())
    expect(getButton().getAttribute('aria-label')).toBe('Toggle theme: Dark')
    expect(document.documentElement).toHaveClass('dark')

    fireEvent.click(getButton())
    expect(getButton().getAttribute('aria-label')).toBe('Toggle theme: System')
    // system resolves to the mocked light preference
    expect(document.documentElement).toHaveClass('light')
  })
})
