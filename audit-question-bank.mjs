import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import ts from 'typescript'

execSync('npm run build', { stdio: 'inherit' })

const bundle = readFileSync('dist/assets/' + execSync('cmd /c dir /b dist\\assets\\index-*.js').toString().trim().split(/\r?\n/).find((name) => name.endsWith('.js')), 'utf8')
if (!bundle.includes('Check the two tasks independently')) {
  throw new Error('Digit puzzle explanation patch was not included in the production bundle.')
}

const source = readFileSync('src/questionBank.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
writeFileSync('.audit-questionBank.cjs', compiled)
const require = createRequire(import.meta.url)
const { questions } = require('./.audit-questionBank.cjs')
unlinkSync('.audit-questionBank.cjs')
const days = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])

const failures = []

questions.forEach((question) => {
  if (question.options.length !== 4) failures.push(`${question.id}: expected 4 options`)
  if (new Set(question.options).size !== 4) failures.push(`${question.id}: duplicate options`)
  if (!question.options.includes(question.answer)) failures.push(`${question.id}: options missing answer`)
  if (question.category === 'Calendar And Time' && !days.has(question.answer)) {
    failures.push(`${question.id}: calendar answer is not a weekday`)
  }
  if (question.category === 'Digit Puzzles' && !question.explanation.includes('independently')) {
    failures.push(`${question.id}: digit explanation does not state independent tasks`)
  }
})

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Question bank audit passed: ${questions.length} questions checked.`)
