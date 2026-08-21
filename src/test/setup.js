// jsdom does not provide TextEncoder/TextDecoder, which react-router v7
// requires at import time. Polyfill from Node's util module.
import { TextEncoder, TextDecoder } from 'util'

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder
}
