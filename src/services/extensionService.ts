import { useErrorHandling } from '@/composables/useErrorHandling'
import { coreExtensionManifest } from '@/extensions/core/extensionManifest'
import { api } from '@/scripts/api'
import { app } from '@/scripts/app'
import { useCommandStore } from '@/stores/commandStore'
import { useExtensionStore } from '@/stores/extensionStore'
import { KeybindingImpl, useKeybindingStore } from '@/stores/keybindingStore'
import { useMenuItemStore } from '@/stores/menuItemStore'
import { useSettingStore } from '@/stores/settingStore'
import { useWidgetStore } from '@/stores/widgetStore'
import { useBottomPanelStore } from '@/stores/workspace/bottomPanelStore'
import type { ComfyExtension } from '@/types/comfy'
import type {
  ActivationEvent,
  ExtensionManifestEntry,
  ExtensionModule
} from '@/types/extensionManifest'

export const useExtensionService = () => {
  const extensionStore = useExtensionStore()
  const settingStore = useSettingStore()
  const keybindingStore = useKeybindingStore()
  const { wrapWithErrorHandling } = useErrorHandling()

  // Track loaded extension modules to avoid duplicate loading
  const loadedExtensions = new Set<string>()
  // Track pending loads to avoid race conditions
  const pendingLoads = new Map<string, Promise<void>>()

  /**
   * Dynamically imports and registers an extension module
   * @param manifestEntry The extension manifest entry
   */
  const loadExtensionModule = async (
    manifestEntry: ExtensionManifestEntry
  ): Promise<void> => {
    // Check if already loaded
    if (loadedExtensions.has(manifestEntry.id)) {
      return
    }

    // Check if already loading
    const pending = pendingLoads.get(manifestEntry.id)
    if (pending) {
      return pending
    }

    // Create load promise
    const loadPromise = (async () => {
      try {
        // Check if extension is disabled
        if (!extensionStore.isExtensionEnabled(manifestEntry.name)) {
          console.log(
            `Extension ${manifestEntry.name} is disabled, skipping load`
          )
          return
        }

        // Load dependencies first
        if (manifestEntry.dependencies?.length) {
          await Promise.all(
            manifestEntry.dependencies.map((depId) => {
              const depEntry = coreExtensionManifest.extensions.find(
                (e) => e.id === depId
              )
              if (depEntry) {
                return loadExtensionModule(depEntry)
              }
              console.warn(
                `Dependency ${depId} not found for extension ${manifestEntry.id}`
              )
              return Promise.resolve()
            })
          )
        }

        // Dynamic import using Vite's glob import for better tree-shaking
        const module = (await import(
          /* @vite-ignore */ `../extensions/core/${manifestEntry.path}`
        )) as ExtensionModule

        // Register extension(s) from module
        if (module.default) {
          registerExtension(module.default)
        }
        if (module.extensions) {
          module.extensions.forEach((ext) => registerExtension(ext))
        }

        // Mark as loaded
        loadedExtensions.add(manifestEntry.id)
        console.log(
          `Successfully loaded extension: ${manifestEntry.name} (${manifestEntry.id})`
        )
      } catch (error) {
        console.error(
          `Error loading extension ${manifestEntry.name} (${manifestEntry.id})`,
          error
        )
      } finally {
        pendingLoads.delete(manifestEntry.id)
      }
    })()

    pendingLoads.set(manifestEntry.id, loadPromise)
    return loadPromise
  }

  /**
   * Loads extensions based on activation events
   * @param events Activation events to match
   */
  const loadExtensionsByActivation = async (
    events: ActivationEvent[]
  ): Promise<void> => {
    const extensionsToLoad = coreExtensionManifest.extensions.filter((entry) =>
      entry.activationEvents.some((event) => events.includes(event))
    )

    await Promise.all(
      extensionsToLoad.map((entry) => loadExtensionModule(entry))
    )
  }

  /**
   * Loads all extensions from the API into the window in parallel
   */
  const loadExtensions = async () => {
    extensionStore.loadDisabledExtensionNames(
      settingStore.get('Comfy.Extension.Disabled')
    )

    const extensions = await api.getExtensions()

    // Load core extensions based on manifest with 'onStartup' activation
    await loadExtensionsByActivation(['onStartup'])
    extensionStore.captureCoreExtensions()

    // Load custom/external extensions (backward compatibility)
    await Promise.all(
      extensions
        .filter((extension) => !extension.includes('extensions/core'))
        .map(async (ext) => {
          try {
            await import(/* @vite-ignore */ api.fileURL(ext))
          } catch (error) {
            console.error('Error loading extension', ext, error)
          }
        })
    )
  }

  /**
   * Load extension by ID (for lazy loading)
   * @param extensionId The extension ID from the manifest
   */
  const loadExtensionById = async (extensionId: string): Promise<void> => {
    const entry = coreExtensionManifest.extensions.find(
      (e) => e.id === extensionId
    )
    if (entry) {
      await loadExtensionModule(entry)
    } else {
      console.warn(`Extension with id ${extensionId} not found in manifest`)
    }
  }

  /**
   * Load extensions for a specific node type
   * @param nodeType The node type (e.g., 'Load3D')
   */
  const loadExtensionsForNode = async (nodeType: string): Promise<void> => {
    await loadExtensionsByActivation([`onNode:${nodeType}` as ActivationEvent])
  }

  /**
   * Load extensions for a specific command
   * @param commandId The command ID
   */
  const loadExtensionsForCommand = async (commandId: string): Promise<void> => {
    await loadExtensionsByActivation([
      `onCommand:${commandId}` as ActivationEvent
    ])
  }

  /**
   * Register an extension with the app
   * @param extension The extension to register
   */
  const registerExtension = (extension: ComfyExtension) => {
    extensionStore.registerExtension(extension)

    const addKeybinding = wrapWithErrorHandling(
      keybindingStore.addDefaultKeybinding
    )
    const addSetting = wrapWithErrorHandling(settingStore.addSetting)

    extension.keybindings?.forEach((keybinding) => {
      addKeybinding(new KeybindingImpl(keybinding))
    })
    useCommandStore().loadExtensionCommands(extension)
    useMenuItemStore().loadExtensionMenuCommands(extension)
    extension.settings?.forEach(addSetting)
    useBottomPanelStore().registerExtensionBottomPanelTabs(extension)
    if (extension.getCustomWidgets) {
      // TODO(huchenlei): We should deprecate the async return value of
      // getCustomWidgets.
      void (async () => {
        if (extension.getCustomWidgets) {
          const widgets = await extension.getCustomWidgets(app)
          useWidgetStore().registerCustomWidgets(widgets)
        }
      })()
    }
  }

  /**
   * Invoke an extension callback
   * @param {keyof ComfyExtension} method The extension callback to execute
   * @param  {any[]} args Any arguments to pass to the callback
   * @returns
   */
  const invokeExtensions = (method: keyof ComfyExtension, ...args: any[]) => {
    const results: any[] = []
    for (const ext of extensionStore.enabledExtensions) {
      if (method in ext) {
        try {
          results.push(ext[method](...args, app))
        } catch (error) {
          console.error(
            `Error calling extension '${ext.name}' method '${method}'`,
            { error },
            { extension: ext },
            { args }
          )
        }
      }
    }
    return results
  }

  /**
   * Invoke an async extension callback
   * Each callback will be invoked concurrently
   * @param {string} method The extension callback to execute
   * @param  {...any} args Any arguments to pass to the callback
   * @returns
   */
  const invokeExtensionsAsync = async (
    method: keyof ComfyExtension,
    ...args: any[]
  ) => {
    return await Promise.all(
      extensionStore.enabledExtensions.map(async (ext) => {
        if (method in ext) {
          try {
            return await ext[method](...args, app)
          } catch (error) {
            console.error(
              `Error calling extension '${ext.name}' method '${method}'`,
              { error },
              { extension: ext },
              { args }
            )
          }
        }
      })
    )
  }

  return {
    loadExtensions,
    loadExtensionById,
    loadExtensionsForNode,
    loadExtensionsForCommand,
    registerExtension,
    invokeExtensions,
    invokeExtensionsAsync
  }
}
