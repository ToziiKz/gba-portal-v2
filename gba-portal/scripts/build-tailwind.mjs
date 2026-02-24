import fs from 'node:fs/promises'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'

const input = new URL('../src/styles/raw-tailwind.css', import.meta.url)
const output = new URL('../src/styles/tailwind.generated.css', import.meta.url)

const css = await fs.readFile(input, 'utf8')
const result = await postcss([tailwindcss({ config: '../tailwind.config.js' })]).process(css, {
  from: input.pathname,
})

await fs.writeFile(output, result.css)
if (result.map) {
  await fs.writeFile(`${output.pathname}.map`, result.map.toString())
}
console.log(`Tailwind built: ${result.css.length} bytes`)
