export default function isEmptyObject (obj) {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0
}
