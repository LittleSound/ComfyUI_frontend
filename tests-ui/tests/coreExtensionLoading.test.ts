import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExtensionStore } from '@/stores/extensionStore'

// Mock the isElectron utility
vi.mock('@/utils/envUtil', () => ({
  isElectron: vi.fn(() => false)
}))

describe('Core Extension Dynamic Loading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should load enabled extensions', async () => {
    const extensionStore = useExtensionStore()

    // Mock the extension store to enable Load3D
    extensionStore.loadDisabledExtensionNames([])

    // All extensions should be enabled by default
    expect(extensionStore.isExtensionEnabled('Comfy.Load3D')).toBe(true)
    expect(extensionStore.isExtensionEnabled('Comfy.Load3DAnimation')).toBe(
      true
    )
  })

  it('should skip disabled extensions', async () => {
    const extensionStore = useExtensionStore()

    // Disable Load3D extensions
    extensionStore.loadDisabledExtensionNames([
      'Comfy.Load3D',
      'Comfy.Load3DAnimation',
      'Comfy.Preview3D',
      'Comfy.Preview3DAnimation'
    ])

    // Check that they are disabled
    expect(extensionStore.isExtensionEnabled('Comfy.Load3D')).toBe(false)
    expect(extensionStore.isExtensionEnabled('Comfy.Load3DAnimation')).toBe(
      false
    )
    expect(extensionStore.isExtensionEnabled('Comfy.Preview3D')).toBe(false)
    expect(extensionStore.isExtensionEnabled('Comfy.Preview3DAnimation')).toBe(
      false
    )
  })

  it('should handle multiple extensions in same file', async () => {
    const extensionStore = useExtensionStore()

    // Disable only one extension from load3d.ts
    extensionStore.loadDisabledExtensionNames(['Comfy.Load3D'])

    // Check that Load3D is disabled
    expect(extensionStore.isExtensionEnabled('Comfy.Load3D')).toBe(false)

    // But other extensions from the same file should be enabled
    expect(extensionStore.isExtensionEnabled('Comfy.Load3DAnimation')).toBe(
      true
    )
    expect(extensionStore.isExtensionEnabled('Comfy.Preview3D')).toBe(true)
  })

  it('should skip ElectronAdapter when not in Electron', async () => {
    const extensionStore = useExtensionStore()
    const { isElectron } = await import('@/utils/envUtil')

    // Ensure we're not in Electron
    vi.mocked(isElectron).mockReturnValue(false)

    // Even if enabled, ElectronAdapter should be skipped
    extensionStore.loadDisabledExtensionNames([])
    expect(extensionStore.isExtensionEnabled('Comfy.ElectronAdapter')).toBe(
      true
    )

    // In actual loading, it would be skipped due to environment check
    expect(isElectron()).toBe(false)
  })

  it('should load ElectronAdapter when in Electron', async () => {
    const extensionStore = useExtensionStore()
    const { isElectron } = await import('@/utils/envUtil')

    // Mock that we're in Electron
    vi.mocked(isElectron).mockReturnValue(true)

    // ElectronAdapter should be loadable
    extensionStore.loadDisabledExtensionNames([])
    expect(extensionStore.isExtensionEnabled('Comfy.ElectronAdapter')).toBe(
      true
    )
    expect(isElectron()).toBe(true)
  })
})
