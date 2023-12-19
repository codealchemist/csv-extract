import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default function loadJson (jsonFile) {
  if (!jsonFile) return

  try {
    const file = path.join(process.cwd(), jsonFile)
    return require(file)
  } catch (error) {
    console.log(`Unable to load JSON file: ${jsonFile}`)
    console.log(error.message)
    console.log()
    process.exit()
  }
}
