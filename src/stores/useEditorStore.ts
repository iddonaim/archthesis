import { create } from 'zustand'
import type { TextBox, Sticker, Location, EditorState } from '@/types/editor'

interface EditorStore extends EditorState {
  // Text box actions
  addTextBox: (textBox: Omit<TextBox, 'id'>) => void
  updateTextBox: (id: string, updates: Partial<TextBox>) => void
  deleteTextBox: (id: string) => void
  selectTextBox: (id: string | null) => void
  clearTextBoxes: () => void

  // Sticker actions
  addSticker: (sticker: Omit<Sticker, 'id'>) => void
  updateSticker: (id: string, updates: Partial<Sticker>) => void
  deleteSticker: (id: string) => void
  selectSticker: (id: string | null) => void
  clearStickers: () => void

  // Image actions
  setCurrentImage: (image: HTMLImageElement | null, url: string | null, templateId: string | null) => void

  // Location actions
  setSelectedLocation: (location: Location | null) => void

  // Tags actions
  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void

  // Username actions
  setUsername: (username: string) => void

  // Description actions
  setDescription: (description: string) => void

  // Location selection and updates
  selectLocation: (selected: boolean) => void
  updateLocationTransform: (updates: Partial<Location>) => void

  // Canvas dimensions
  setCanvasDimensions: (dimensions: { width: number; height: number }) => void

  // Reset
  resetEditor: () => void
}

const initialState: EditorState = {
  currentImage: null,
  currentImageUrl: null,
  currentTemplateId: null,
  textBoxes: [],
  stickers: [],
  selectedLocation: null,
  selectedTags: [],
  username: '',
  description: '',
  selectedTextBoxId: null,
  selectedStickerId: null,
  isLocationSelected: false,
  canvasDimensions: null,
}

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,

  // Text box actions
  addTextBox: (textBox) => set((state) => ({
    textBoxes: [
      ...state.textBoxes,
      { ...textBox, id: `textbox-${Date.now()}-${Math.random()}` }
    ]
  })),

  updateTextBox: (id, updates) => set((state) => ({
    textBoxes: state.textBoxes.map(box =>
      box.id === id ? { ...box, ...updates } : box
    )
  })),

  deleteTextBox: (id) => set((state) => ({
    textBoxes: state.textBoxes.filter(box => box.id !== id),
    selectedTextBoxId: state.selectedTextBoxId === id ? null : state.selectedTextBoxId
  })),

  selectTextBox: (id) => set({ selectedTextBoxId: id, selectedStickerId: null }),

  clearTextBoxes: () => set({ textBoxes: [], selectedTextBoxId: null }),

  // Sticker actions
  addSticker: (sticker) => set((state) => ({
    stickers: [
      ...state.stickers,
      { ...sticker, id: `sticker-${Date.now()}-${Math.random()}` }
    ]
  })),

  updateSticker: (id, updates) => set((state) => ({
    stickers: state.stickers.map(sticker =>
      sticker.id === id ? { ...sticker, ...updates } : sticker
    )
  })),

  deleteSticker: (id) => set((state) => ({
    stickers: state.stickers.filter(sticker => sticker.id !== id),
    selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId
  })),

  selectSticker: (id) => set({ selectedStickerId: id, selectedTextBoxId: null }),

  clearStickers: () => set({ stickers: [], selectedStickerId: null }),

  // Image actions
  setCurrentImage: (image, url, templateId) => set({
    currentImage: image,
    currentImageUrl: url,
    currentTemplateId: templateId
  }),

  // Location actions
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  // Tags actions
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  addTag: (tag) => set((state) => {
    if (state.selectedTags.length >= 3 || state.selectedTags.includes(tag)) {
      return state
    }
    return { selectedTags: [...state.selectedTags, tag] }
  }),

  removeTag: (tag) => set((state) => ({
    selectedTags: state.selectedTags.filter(t => t !== tag)
  })),

  // Username actions
  setUsername: (username) => set({ username }),

  // Description actions
  setDescription: (description) => set({ description }),

  // Location selection and updates
  selectLocation: (selected) => set({
    isLocationSelected: selected,
    selectedTextBoxId: null,
    selectedStickerId: null
  }),

  updateLocationTransform: (updates) => set((state) => ({
    selectedLocation: state.selectedLocation ? {
      ...state.selectedLocation,
      ...updates
    } : null
  })),

  // Canvas dimensions
  setCanvasDimensions: (dimensions) => set({ canvasDimensions: dimensions }),

  // Reset
  resetEditor: () => set(initialState)
}))
