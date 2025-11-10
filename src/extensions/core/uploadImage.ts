import {
  ComfyNodeDef,
  InputSpec,
  isComboInputSpecV1
} from '@/schemas/nodeDefSchema'
import type { ComfyExtension } from '@/types/comfy'

// Adds an upload button to the nodes

const isMediaUploadComboInput = (inputSpec: InputSpec) => {
  const [inputName, inputOptions] = inputSpec
  if (!inputOptions) return false

  const isUploadInput =
    inputOptions['image_upload'] === true ||
    inputOptions['video_upload'] === true ||
    inputOptions['animated_image_upload'] === true

  return (
    isUploadInput && (isComboInputSpecV1(inputSpec) || inputName === 'COMBO')
  )
}

const createUploadInput = (
  imageInputName: string,
  imageInputOptions: InputSpec
): InputSpec => [
  'IMAGEUPLOAD',
  {
    ...imageInputOptions[1],
    imageInputName
  }
]

const extension: ComfyExtension = {
  name: 'Comfy.UploadImage',
  beforeRegisterNodeDef(_nodeType, nodeData: ComfyNodeDef) {
    const { input } = nodeData ?? {}
    const { required } = input ?? {}
    if (!required) return

    const found = Object.entries(required).find(([_, input]) =>
      isMediaUploadComboInput(input)
    )

    // If media combo input found, attach upload input
    if (found) {
      const [inputName, inputSpec] = found
      required.upload = createUploadInput(inputName, inputSpec)
    }
  }
}

export default extension
