import type { ComfyExtension } from './comfy'

/**
 * Activation events define when an extension should be loaded
 */
export type ActivationEvent =
  | 'onStartup' // Load immediately on startup
  | `onNode:${string}` // Load when a specific node type is created
  | `onCommand:${string}` // Load when a command is executed
  | 'never' // Never auto-load (must be explicitly loaded)

/**
 * Extension category for organization
 */
export type ExtensionCategory =
  | 'core' // Core system functionality
  | 'node' // Node-related extensions
  | 'ui' // UI enhancements
  | 'input' // Input handling (touch, keyboard, etc.)
  | 'media' // Media handling (3D, images, audio, etc.)
  | 'workflow' // Workflow management

/**
 * Manifest entry for a single extension
 */
export interface ExtensionManifestEntry {
  /** Unique identifier for the extension */
  id: string

  /** Display name of the extension */
  name: string

  /** Brief description of what the extension does */
  description?: string

  /** Category for organization */
  category: ExtensionCategory

  /** When this extension should be activated */
  activationEvents: ActivationEvent[]

  /** Relative path to the extension module (from core/index.ts) */
  path: string

  /** Dependencies on other extensions (by id) */
  dependencies?: string[]

  /** Whether this extension is enabled by default */
  defaultEnabled?: boolean
}

/**
 * Extension module that exports extension(s) declaratively
 */
export interface ExtensionModule {
  /** Single extension export */
  default?: ComfyExtension

  /** Multiple named extension exports */
  extensions?: ComfyExtension[]
}

/**
 * Complete manifest of all core extensions
 */
export interface ExtensionManifest {
  version: string
  extensions: ExtensionManifestEntry[]
}
