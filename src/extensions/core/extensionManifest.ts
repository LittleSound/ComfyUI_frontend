import type { ExtensionManifest } from '@/types/extensionManifest'

/**
 * Manifest of all core extensions
 * This manifest defines metadata for each extension including:
 * - When it should be loaded (activation events)
 * - What it provides (category, description)
 * - Dependencies on other extensions
 *
 * This enables tree-shaking and lazy loading of extensions.
 */
export const coreExtensionManifest: ExtensionManifest = {
  version: '1.0.0',
  extensions: [
    {
      id: 'clipspace',
      name: 'Comfy.Clipspace',
      description:
        'Implements the Clipspace feature for temporary image storage',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './clipspace',
      defaultEnabled: true
    },
    {
      id: 'contextMenuFilter',
      name: 'Comfy.ContextMenuFilter',
      description: 'Provides context menu filtering capabilities',
      category: 'ui',
      activationEvents: ['onStartup'],
      path: './contextMenuFilter',
      defaultEnabled: true
    },
    {
      id: 'dynamicPrompts',
      name: 'Comfy.DynamicPrompts',
      description: 'Provides dynamic prompt generation capabilities',
      category: 'workflow',
      activationEvents: ['onStartup'],
      path: './dynamicPrompts',
      defaultEnabled: true
    },
    {
      id: 'editAttention',
      name: 'Comfy.EditAttention',
      description: 'Implements attention editing functionality',
      category: 'ui',
      activationEvents: ['onStartup'],
      path: './editAttention',
      defaultEnabled: true
    },
    {
      id: 'electronAdapter',
      name: 'Comfy.ElectronAdapter',
      description: 'Adapts functionality for Electron environment',
      category: 'core',
      activationEvents: ['onStartup'],
      path: './electronAdapter',
      defaultEnabled: true
    },
    {
      id: 'groupNode',
      name: 'Comfy.GroupNode',
      description:
        'Implements the group node functionality to organize workflows',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './groupNode',
      defaultEnabled: true
    },
    {
      id: 'groupNodeManage',
      name: 'Comfy.GroupNodeManage',
      description: 'Provides group node management operations',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './groupNodeManage',
      dependencies: ['groupNode'],
      defaultEnabled: true
    },
    {
      id: 'groupOptions',
      name: 'Comfy.GroupOptions',
      description: 'Handles group node configuration options',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './groupOptions',
      dependencies: ['groupNode'],
      defaultEnabled: true
    },
    {
      id: 'load3d',
      name: 'Comfy.Load3D',
      description: 'Supports 3D model loading and visualization',
      category: 'media',
      activationEvents: [
        'onStartup',
        'onNode:Load3D',
        'onNode:Load3DAnimation',
        'onNode:Preview3D',
        'onNode:Preview3DAnimation'
      ],
      path: './load3d',
      defaultEnabled: true
    },
    {
      id: 'maskeditor',
      name: 'Comfy.MaskEditor',
      description: 'Implements the mask editor for image masking operations',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './maskeditor',
      defaultEnabled: true
    },
    {
      id: 'nodeTemplates',
      name: 'Comfy.NodeTemplates',
      description: 'Provides node template functionality',
      category: 'workflow',
      activationEvents: ['onStartup'],
      path: './nodeTemplates',
      defaultEnabled: true
    },
    {
      id: 'noteNode',
      name: 'Comfy.NoteNode',
      description: 'Adds note nodes for documentation within workflows',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './noteNode',
      defaultEnabled: true
    },
    {
      id: 'previewAny',
      name: 'Comfy.PreviewAny',
      description: 'Universal preview functionality for various data types',
      category: 'ui',
      activationEvents: ['onStartup'],
      path: './previewAny',
      defaultEnabled: true
    },
    {
      id: 'rerouteNode',
      name: 'Comfy.RerouteNode',
      description: 'Implements reroute nodes for cleaner workflow connections',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './rerouteNode',
      defaultEnabled: true
    },
    {
      id: 'saveImageExtraOutput',
      name: 'Comfy.SaveImageExtraOutput',
      description: 'Handles additional image output saving',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './saveImageExtraOutput',
      defaultEnabled: true
    },
    {
      id: 'saveMesh',
      name: 'Comfy.SaveMesh',
      description: 'Implements 3D mesh saving functionality',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './saveMesh',
      defaultEnabled: true
    },
    {
      id: 'simpleTouchSupport',
      name: 'Comfy.SimpleTouchSupport',
      description: 'Provides basic touch interaction support',
      category: 'input',
      activationEvents: ['onStartup'],
      path: './simpleTouchSupport',
      defaultEnabled: true
    },
    {
      id: 'slotDefaults',
      name: 'Comfy.SlotDefaults',
      description: 'Manages default values for node slots',
      category: 'node',
      activationEvents: ['onStartup'],
      path: './slotDefaults',
      defaultEnabled: true
    },
    {
      id: 'uploadAudio',
      name: 'Comfy.UploadAudio',
      description: 'Handles audio file upload functionality',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './uploadAudio',
      defaultEnabled: true
    },
    {
      id: 'uploadImage',
      name: 'Comfy.UploadImage',
      description: 'Handles image upload functionality',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './uploadImage',
      defaultEnabled: true
    },
    {
      id: 'webcamCapture',
      name: 'Comfy.WebcamCapture',
      description: 'Provides webcam capture capabilities',
      category: 'media',
      activationEvents: ['onStartup'],
      path: './webcamCapture',
      defaultEnabled: true
    },
    {
      id: 'widgetInputs',
      name: 'Comfy.WidgetInputs',
      description: 'Implements various widget input types',
      category: 'ui',
      activationEvents: ['onStartup'],
      path: './widgetInputs',
      defaultEnabled: true
    }
  ]
}
