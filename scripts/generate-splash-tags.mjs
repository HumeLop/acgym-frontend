import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SPLASH_DIR = 'public/icons/splash'
const OUTPUT_FILE = 'public/splash-tags.html'

const SIZE_MAP = {
  '640x1136': [320, 568, 2],
  '1136x640': [568, 320, 2],
  '750x1334': [375, 667, 2],
  '1334x750': [667, 375, 2],
  '1242x2208': [414, 736, 3],
  '2208x1242': [736, 414, 3],
  '1125x2436': [375, 812, 3],
  '2436x1125': [812, 375, 3],
  '828x1792': [414, 896, 2],
  '1792x828': [896, 414, 2],
  '1242x2688': [414, 896, 3],
  '2688x1242': [896, 414, 3],
  '1170x2532': [390, 844, 3],
  '2532x1170': [844, 390, 3],
  '1284x2778': [428, 926, 3],
  '2778x1284': [926, 428, 3],
  '1179x2556': [393, 852, 3],
  '2556x1179': [852, 393, 3],
  '1290x2796': [430, 932, 3],
  '2796x1290': [932, 430, 3],
  '1206x2622': [402, 874, 3],
  '2622x1206': [874, 402, 3],
  '1320x2868': [440, 956, 3],
  '2868x1320': [956, 440, 3],
  '1260x2736': [420, 912, 3],
  '2736x1260': [912, 420, 3],
  '1536x2048': [768, 1024, 2],
  '2048x1536': [1024, 768, 2],
  '1620x2160': [810, 1080, 2],
  '2160x1620': [1080, 810, 2],
  '1668x2224': [834, 1112, 2],
  '2224x1668': [1112, 834, 2],
  '1640x2360': [820, 1180, 2],
  '2360x1640': [1180, 820, 2],
  '1668x2388': [834, 1194, 2],
  '2388x1668': [1194, 834, 2],
  '2048x2732': [1024, 1366, 2],
  '2732x2048': [1366, 1024, 2],
  '2064x2752': [1032, 1376, 2],
  '2752x2064': [1376, 1032, 2],
  '1488x2266': [744, 1133, 2],
  '2266x1488': [1133, 744, 2],
  '1668x2420': [834, 1210, 2],
  '2420x1668': [1210, 834, 2],
}

function getPngDimensions(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') return null
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  return `${width}x${height}`
}

const files = readdirSync(SPLASH_DIR).filter((f) => f.endsWith('.png') && f !== 'icon.png')

const tags = []
for (const file of files.sort()) {
  const buffer = readFileSync(join(SPLASH_DIR, file))
  const dims = getPngDimensions(buffer)
  if (!dims) continue

  const mapping = SIZE_MAP[dims]
  if (!mapping) {
    console.warn(`Unknown splash dimension: ${dims} (${file})`)
    continue
  }

  const [cssW, cssH, ratio] = mapping
  const orientation = cssH > cssW ? 'portrait' : 'landscape'
  tags.push(
    `  <link rel="apple-touch-startup-image" media="(device-width: ${cssW}px) and (device-height: ${cssH}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})" href="icons/splash/${file}">`,
  )
}

const html = tags.join('\n') + '\n'
writeFileSync(OUTPUT_FILE, html)
console.log(`Generated ${tags.length} splash tags → ${OUTPUT_FILE}`)
