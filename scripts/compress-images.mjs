import sharp from "sharp"
import { readdirSync, statSync, renameSync } from "fs"
import { join, extname, basename } from "path"

const PUBLIC_DIR = "./public"
const MAX_WIDTH = 1920
const QUALITY = 82

const files = readdirSync(PUBLIC_DIR).filter((f) =>
  [".jpg", ".jpeg", ".png"].includes(extname(f).toLowerCase())
)

for (const file of files) {
  const filePath = join(PUBLIC_DIR, file)
  const sizeBefore = statSync(filePath).size
  const ext = extname(file).toLowerCase()
  const name = basename(file, ext)
  const tmpPath = join(PUBLIC_DIR, `${name}.tmp${ext}`)

  try {
    const pipeline = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true })

    if (ext === ".png") {
      await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toFile(tmpPath)
    } else {
      await pipeline.jpeg({ quality: QUALITY, progressive: true }).toFile(tmpPath)
    }

    const sizeAfter = statSync(tmpPath).size
    const saved = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1)

    renameSync(tmpPath, filePath)
    console.log(`✓ ${file}: ${(sizeBefore / 1024 / 1024).toFixed(2)}MB → ${(sizeAfter / 1024 / 1024).toFixed(2)}MB (-${saved}%)`)
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`)
  }
}
