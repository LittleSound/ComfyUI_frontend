import { useExtensionStore } from '@/stores/extensionStore'
import { isElectron } from '@/utils/envUtil'

/**
 * Mapping of extension names to their file paths.
 * Some files contain multiple extensions.
 */
const EXTENSION_FILE_MAP: Record<string, string> = {
  'Comfy.Clipspace': './clipspace',
  'Comfy.ContextMenuFilter': './contextMenuFilter',
  'Comfy.DynamicPrompts': './dynamicPrompts',
  'Comfy.EditAttention': './editAttention',
  'Comfy.ElectronAdapter': './electronAdapter',
  'Comfy.GroupNode': './groupNode',
  'Comfy.GroupOptions': './groupOptions',
  // load3d.ts contains 4 extensions
  'Comfy.Load3D': './load3d',
  'Comfy.Load3DAnimation': './load3d',
  'Comfy.Preview3D': './load3d',
  'Comfy.Preview3DAnimation': './load3d',
  'Comfy.MaskEditor': './maskeditor',
  'Comfy.NodeTemplates': './nodeTemplates',
  'Comfy.NoteNode': './noteNode',
  'Comfy.PreviewAny': './previewAny',
  'Comfy.RerouteNode': './rerouteNode',
  'Comfy.SaveImageExtraOutput': './saveImageExtraOutput',
  'Comfy.SaveGLB': './saveMesh',
  'Comfy.SimpleTouchSupport': './simpleTouchSupport',
  'Comfy.SlotDefaults': './slotDefaults',
  // uploadAudio.ts contains 2 extensions
  'Comfy.AudioWidget': './uploadAudio',
  'Comfy.UploadAudio': './uploadAudio',
  'Comfy.UploadImage': './uploadImage',
  'Comfy.WebcamCapture': './webcamCapture',
  'Comfy.WidgetInputs': './widgetInputs'
}

/**
 * Dynamically load core extensions based on their enabled state.
 * Only loads extensions that are enabled in the extension store.
 *
 * This function should be called after extensionStore has been initialized
 * with disabled extension names via loadDisabledExtensionNames().
 */
async function loadCoreExtensions() {
  const extensionStore = useExtensionStore()
  const filesToLoad = new Set<string>()

  // Determine which files need to be loaded
  for (const [extensionName, filePath] of Object.entries(EXTENSION_FILE_MAP)) {
    // Special handling for ElectronAdapter: only load in Electron environment
    if (extensionName === 'Comfy.ElectronAdapter' && !isElectron()) {
      console.log(
        `Skipping ${extensionName}: not running in Electron environment`
      )
      continue
    }

    // Check if extension is enabled
    if (extensionStore.isExtensionEnabled(extensionName)) {
      filesToLoad.add(filePath)
    } else {
      console.log(`Skipping ${extensionName}: extension is disabled`)
    }
  }

  // Load all enabled extensions in parallel
  const loadPromises = Array.from(filesToLoad).map(async (filePath) => {
    try {
      await import(/* @vite-ignore */ filePath)
      console.log(`Loaded core extension file: ${filePath}`)
    } catch (error) {
      console.error(`Error loading core extension file ${filePath}:`, error)
    }
  })

  await Promise.all(loadPromises)
}

// Automatically load all core extensions when this module is imported
// This will be called from extensionService.loadExtensions()
await loadCoreExtensions()
