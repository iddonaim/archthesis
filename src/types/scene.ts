/**
 * Unified scene model for the editor.
 *
 * All canvas-placeable artifacts are `SceneElement`s. Their position in
 * `Scene.elements` is their z-order (index 0 = bottom). The shape is
 * deliberately flat — type discrimination via the `type` field.
 *
 * This model lives alongside the legacy `editor.ts` types during the
 * overhaul. Editor UI continues to use the legacy types until the
 * migration step.
 */

export type ElementId = string

export interface BaseElement {
  id: ElementId
  x: number
  y: number
  rotation: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  width: number
  fontSize: number
  fontFamily: string
  color: string
  stroke: string
  strokeWidth: number
  fontStyle: string
  backgroundColor?: string
  backgroundPadding?: number
  isPlaceholder: boolean
  isEditing?: boolean
}

export interface EmojiElement extends BaseElement {
  type: 'emoji'
  glyph: string
  size: number
}

/** Image stickers — curated packs, user uploads, or location-matched discoveries. */
export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  width: number
  height: number
  source?: 'upload' | 'curated' | 'discovered'
}

export interface LocationElement extends BaseElement {
  type: 'location'
  display_name: string
  latitude: number
  longitude: number
  width: number
  fontSize: number
  color: string
}

export type SceneElement =
  | TextElement
  | EmojiElement
  | ImageElement
  | LocationElement

export type ElementType = SceneElement['type']

export interface Scene {
  elements: SceneElement[]
  selection: ElementId[]
}

export const emptyScene = (): Scene => ({
  elements: [],
  selection: [],
})
