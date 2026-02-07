export interface TextBox {
  id: string
  text: string
  x: number
  y: number
  width?: number
  fontSize: number
  color: string
  fontFamily: string
  rotation: number
  stroke?: string
  strokeWidth?: number
  fontStyle?: string
  isEditing?: boolean
  isPlaceholder?: boolean
  backgroundColor?: string
  backgroundPadding?: number
}

export interface Sticker {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

export interface Location {
  latitude: number
  longitude: number
  display_name: string
  addToMeme?: boolean
  showInGallery?: boolean
  hideFromGallery?: boolean
  // For rendering on canvas
  x?: number
  y?: number
  fontSize?: number
  color?: string
  rotation?: number
}

export interface EditorState {
  currentImage: HTMLImageElement | null
  currentImageUrl: string | null
  currentTemplateId: string | null
  textBoxes: TextBox[]
  stickers: Sticker[]
  selectedLocation: Location | null
  selectedTags: string[]
  username: string
  description: string
  selectedTextBoxId: string | null
  selectedStickerId: string | null
  isLocationSelected: boolean
  canvasDimensions: { width: number; height: number } | null
}

export interface Template {
  id: string
  name: string
  url: string
  width: number
  height: number
  defaultTextBoxes: Array<{
    text: string
    xPercent: number
    yPercent: number
    fontSize: number
    color: string
    fontFamily: string
    stroke: string
    strokeWidth: number
    fontStyle?: string
  }>
}
