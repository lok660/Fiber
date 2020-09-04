import { TEXT_ELEMENT } from './constant'

export function createTextElement (value) {
  return createTextElement(TEXT_ELEMENT, { nodeValue: value })
}

export function createElement (type, config, ...args) {
  const props = { ...config }

  const hasChildren = args.length > 0
  const rawChildren = hasChildren
    ? [...args]
    : []

  props.children = rawChildren
    .filter(Boolean)
    .map(c => c instanceof Object ? c : createTextElement(c))

  return { type, props }
}