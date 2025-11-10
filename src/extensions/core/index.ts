/**
 * Core Extensions Entry Point
 *
 * This file previously used side-effect imports to load all extensions.
 * Now extensions are loaded dynamically based on the manifest in extensionManifest.ts
 *
 * Extensions are loaded by the extensionService which:
 * - Reads the manifest to determine which extensions to load
 * - Loads extensions based on activation events (onStartup, onNode:*, etc.)
 * - Supports lazy loading for better performance
 * - Enables tree-shaking of unused extensions
 *
 * To add a new core extension:
 * 1. Create your extension file following the declarative export pattern
 * 2. Add an entry to extensionManifest.ts
 * 3. The extension will be automatically loaded based on its activation events
 *
 * @see extensionManifest.ts - For the list of all core extensions
 * @see src/services/extensionService.ts - For the extension loading logic
 */

// This file is intentionally minimal as extensions are now loaded dynamically
export {}
