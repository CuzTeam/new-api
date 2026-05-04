import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BannerState {
  dismissedBannerHash: string
  dismissBanner: (hash: string) => void
  isBannerDismissed: (hash: string) => boolean
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set, get) => ({
      dismissedBannerHash: '',

      dismissBanner: (hash: string) => {
        set({ dismissedBannerHash: hash })
      },

      isBannerDismissed: (hash: string) => {
        return get().dismissedBannerHash === hash && hash !== ''
      },
    }),
    {
      name: 'banner-storage',
      partialize: (state) => ({
        dismissedBannerHash: state.dismissedBannerHash,
      }),
    }
  )
)
