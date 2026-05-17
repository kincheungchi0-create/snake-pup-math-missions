export type Question = {
  id: string
  category: string
  prompt: string
  options: number[]
  answer: number
  explanation: string
  hint: string
  level: number
}

type Generated = Omit<Question, 'id' | 'options' | 'level'>

const snakeNames = ['Noodle', 'Stripe', 'Coil', 'Slink', 'Zigzag', 'Ruby', 'Sunny', 'Mango', 'Jade', 'Pepper', 'Twist', 'Comet']
const pupNames = ['Rex', 'Dash', 'Scout', 'Patch', 'Bolt', 'Skye', 'Rocky', 'Flash', 'Chasey', 'Rubblet']
const places = ['jungle gate', 'river bend', 'rock tower', 'leaf tunnel', 'sunny nest', 'moss bridge', 'sand pit', 'tree camp', 'crystal den', 'rescue lookout']
const treasures = ['candies', 'gems', 'berries', 'shells', 'stars', 'coins', 'leaves', 'pebbles']

const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length]

const shuffle = (values: number[], seed: number) => {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = (seed * 31 + i * 17) % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const ordinal = (n: number) => {
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'
  return `${n}${suffix}`
}

const makeOptions = (answer: number, seed: number) => {
  const offsets = [1 + (seed % 4), 2 + ((seed * 3) % 7), 5 + ((seed * 5) % 9), 10 + (seed % 6)]
  const pool = new Set<number>([answer])
  offsets.forEach((offset, index) => {
    pool.add(Math.max(0, answer + (index % 2 === 0 ? offset : -offset)))
    pool.add(Math.max(0, answer + offset + index))
  })
  return shuffle([...pool].filter((value) => Number.isFinite(value)).slice(0, 4), seed)
}

const categories = [
  {
    name: 'Smart Addition',
    hint: 'Add the known numbers first.',
    make(seed: number): Generated {
      const a = 24 + (seed * 7) % 71
      const b = 31 + (seed * 13) % 76
      const missing = 18 + (seed * 17) % 83
      const total = a + b + missing
      return {
        category: this.name,
        hint: this.hint,
        prompt: `${pick(pupNames, seed)} and ${pick(snakeNames, seed + 1)} collect ${a} red ${pick(treasures, seed)}, ${b} yellow ${pick(treasures, seed + 2)} and some green ${pick(treasures, seed + 4)}. They have ${total} items. How many green items are there?`,
        answer: missing,
        explanation: `The known items are ${a} + ${b} = ${a + b}. The missing group is ${total} - ${a + b} = ${missing}.`,
      }
    },
  },
  {
    name: 'Number Patterns',
    hint: 'Look at the jumps.',
    make(seed: number): Generated {
      const start = 2 + (seed * 3) % 18
      const jump = 2 + (seed * 5) % 9
      const seq = [start]
      for (let k = 1; k < 6; k += 1) seq.push(seq[k - 1] + jump + k)
      return {
        category: this.name,
        hint: this.hint,
        prompt: `The snake trail at ${pick(places, seed)} shows ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ${seq[4]}, __. What comes next?`,
        answer: seq[5],
        explanation: `The jumps are ${jump + 1}, ${jump + 2}, ${jump + 3}, ${jump + 4}, then ${jump + 5}. So the next number is ${seq[4]} + ${jump + 5}.`,
      }
    },
  },
  {
    name: 'Digit Puzzles',
    hint: 'Check hundreds, tens, ones.',
    make(seed: number): Generated {
      const digits = Array.from(new Set([
        1 + (seed % 9),
        1 + ((seed * 2 + 3) % 9),
        1 + ((seed * 3 + 5) % 9),
        1 + ((seed * 5 + 7) % 9),
        1 + ((seed * 7 + 1) % 9),
      ])).slice(0, 4)
      while (digits.length < 4) digits.push(1 + ((seed + digits.length * 2) % 9))
      if (!digits.some((d) => d % 2 === 1)) digits[0] = 7
      const oddEnds = digits.filter((d) => d % 2 === 1)
      const bestEnd = Math.min(...oddEnds)
      const remainingForLargest = digits.filter((d) => d !== bestEnd).sort((a, b) => b - a)
      const largestOdd = remainingForLargest[0] * 100 + remainingForLargest[1] * 10 + bestEnd
      const smallestDigits = [...digits].sort((a, b) => a - b).slice(0, 3)
      const smallest = smallestDigits[0] * 100 + smallestDigits[1] * 10 + smallestDigits[2]
      const answer = largestOdd - smallest
      return {
        category: this.name,
        hint: this.hint,
        prompt: `Use digits ${digits.join(', ')}. Make the largest 3-digit odd number with no repeated digit. Then make the smallest 3-digit number. What is the difference?`,
        answer,
        explanation: `The largest odd number is ${largestOdd}. The smallest 3-digit number is ${smallest}. The difference is ${largestOdd} - ${smallest} = ${answer}.`,
      }
    },
  },
  {
    name: 'Order In Line',
    hint: 'Draw the line first.',
    make(seed: number): Generated {
      const front = 5 + (seed * 2) % 12
      const back = 4 + (seed * 3) % 10
      const gap = 1 + (seed * 5) % 4
      const coilPosition = front - gap
      const total = coilPosition + back - 1
      return {
        category: this.name,
        hint: this.hint,
        prompt: `${pick(snakeNames, seed)} is ${ordinal(front)} from the front. ${pick(pupNames, seed)} is ${ordinal(back)} from the back and stands ${gap} place(s) in front. How many racers are in the line?`,
        answer: total,
        explanation: `The front racer is at position ${front}. The other racer is ${gap} place(s) before it, so position ${coilPosition}. Total racers = ${coilPosition} + ${back} - 1 = ${total}.`,
      }
    },
  },
  {
    name: 'Gaps And Intervals',
    hint: 'There is one fewer gap than objects.',
    make(seed: number): Generated {
      const eggs = 9 + (seed * 7) % 24
      const leaves = 2 + (seed * 3) % 6
      const gaps = eggs - 1
      const answer = gaps * leaves
      return {
        category: this.name,
        hint: this.hint,
        prompt: `${eggs} snake eggs are in one straight line. Between every two eggs, ${pick(pupNames, seed)} places ${leaves} bright leaves. How many leaves are used?`,
        answer,
        explanation: `${eggs} eggs make ${gaps} gaps. Each gap has ${leaves} leaves, so ${gaps} x ${leaves} = ${answer}.`,
      }
    },
  },
  {
    name: 'Routes And Choices',
    hint: 'Multiply each choice.',
    make(seed: number): Generated {
      const a = 2 + (seed * 2) % 5
      const b = 3 + (seed * 3) % 5
      const c = 2 + (seed * 5) % 4
      const answer = a * b * c
      return {
        category: this.name,
        hint: this.hint,
        prompt: `From ${pick(places, seed)} to ${pick(places, seed + 2)} there are ${a} paths. Then ${b} paths go to ${pick(places, seed + 4)}, and ${c} paths go to the finish. How many full routes?`,
        answer,
        explanation: `For every first path, there are ${b} second choices and ${c} final choices. ${a} x ${b} x ${c} = ${answer}.`,
      }
    },
  },
  {
    name: 'Calendar And Time',
    hint: 'Weekdays repeat every 7 days.',
    make(seed: number): Generated {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const startIndex = seed % days.length
      const later = 12 + (seed * 11) % 87
      const answer = (startIndex + later) % 7
      return {
        category: this.name,
        hint: this.hint,
        prompt: `${pick(snakeNames, seed)} starts training on ${days[startIndex]}. The tunnel test is ${later} days later. Which day is it?`,
        answer,
        explanation: `${later} days later has the same effect as ${later % 7} day(s) later. Count forward from ${days[startIndex]} to get ${days[answer]}.`,
      }
    },
  },
  {
    name: 'Shape Counting',
    hint: 'Count horizontal and vertical rectangles.',
    make(seed: number): Generated {
      const rows = 2 + (seed * 2) % 3
      const cols = 4 + (seed * 3) % 5
      const size = 2 + (seed * 5) % 4
      const horizontal = rows * Math.max(0, cols - size + 1)
      const vertical = size <= rows ? (rows - size + 1) * cols : 0
      const answer = horizontal + vertical
      return {
        category: this.name,
        hint: this.hint,
        prompt: `A snake puzzle board has ${rows} rows and ${cols} columns of small squares. How many rectangles use exactly ${size} small squares?`,
        answer,
        explanation: `Horizontal rectangles: ${horizontal}. Vertical rectangles: ${vertical}. Total = ${answer}.`,
      }
    },
  },
  {
    name: 'Sharing And Difference',
    hint: 'Start with the smallest share.',
    make(seed: number): Generated {
      const third = 5 + (seed * 7) % 18
      const more1 = 1 + (seed * 2) % 6
      const more2 = 2 + (seed * 3) % 6
      const second = third + more2
      const first = second + more1
      const total = first + second + third
      return {
        category: this.name,
        hint: this.hint,
        prompt: `Three friends share ${total} ${pick(treasures, seed)}. ${pick(pupNames, seed)} gets ${more1} more than ${pick(snakeNames, seed)}. ${pick(snakeNames, seed)} gets ${more2} more than ${pick(pupNames, seed + 2)}. How many does the last friend get?`,
        answer: third,
        explanation: `If the last friend gets ${third}, the middle gets ${second}, and the first gets ${first}. Together: ${first} + ${second} + ${third} = ${total}.`,
      }
    },
  },
  {
    name: 'Codes And Counting',
    hint: 'Choose one digit at a time.',
    make(seed: number): Generated {
      const digits = Array.from(new Set([
        1 + (seed % 9),
        1 + ((seed * 2 + 1) % 9),
        1 + ((seed * 4 + 2) % 9),
        1 + ((seed * 5 + 4) % 9),
      ])).slice(0, 4)
      while (digits.length < 4) digits.push(1 + ((seed + digits.length * 3) % 9))
      const length = seed % 2 === 0 ? 2 : 3
      const answer = length === 2 ? digits.length * (digits.length - 1) : digits.length * (digits.length - 1) * (digits.length - 2)
      return {
        category: this.name,
        hint: this.hint,
        prompt: `The rescue lock uses digits ${digits.join(', ')}. How many different ${length}-digit codes can be made if no digit is repeated?`,
        answer,
        explanation: length === 2
          ? `There are ${digits.length} choices for the first digit and ${digits.length - 1} for the second. ${digits.length} x ${digits.length - 1} = ${answer}.`
          : `There are ${digits.length}, then ${digits.length - 1}, then ${digits.length - 2} choices. Multiply them to get ${answer}.`,
      }
    },
  },
]

export const categoryNames = categories.map((category) => category.name)

export const questions: Question[] = Array.from({ length: 600 }, (_, index) => {
  const category = categories[index % categories.length]
  const seed = index * 19 + Math.floor(index / categories.length) * 7
  const generated = category.make(seed)
  return {
    ...generated,
    id: `mission-${index + 1}`,
    options: makeOptions(generated.answer, seed),
    level: Math.floor(index / 120) + 1,
  }
})
