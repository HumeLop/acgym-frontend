import { readFileSync, writeFileSync } from 'node:fs'

const apiUrl = process.env.CF_API_URL || 'http://127.0.0.1:8000/api'
const origin = new URL(apiUrl).origin

writeFileSync(
  'public/_headers',
  readFileSync('public/_headers.template', 'utf8').replace('__API_URL__', origin),
)

writeFileSync(
  'src/environments/environment.ts',
  `export const environment = {\n  production: false,\n  apiURL: 'http://127.0.0.1:8000/api'\n}\n`,
)

writeFileSync(
  'src/environments/environment.prod.ts',
  readFileSync('src/environments/environment.template.ts', 'utf8').replace('__API_URL__', apiUrl),
)

console.log('prebuild: headers and env files generated')
