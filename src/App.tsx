import { useMemo, useState } from 'react'
import './App.css'
import { categoryNames, questions, type Question } from './questionBank'

type AnswerValue = Question['answer']

const snakeArt = [
  '/openclipart-353915.svg',
  '/openclipart-204488.svg',
  '/openclipart-271361.svg',
  '/snake-clipart.svg',
]

function PupBadge() {
  return (
    <div className="pup-badge" aria-label="original rescue pup">
      <div className="pup-ear left" />
      <div className="pup-ear right" />
      <div className="pup-helmet" />
      <div className="pup-face">
        <span />
        <span />
        <b />
      </div>
      <div className="pup-vest" />
    </div>
  )
}

function getQuestion(pool: Question[], index: number) {
  return pool[index % pool.length]
}

export default function App() {
  const [category, setCategory] = useState('All Missions')
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<AnswerValue | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)

  const pool = useMemo(() => {
    if (category === 'All Missions') return questions
    return questions.filter((question) => question.category === category)
  }, [category])

  const question = getQuestion(pool, index)
  const isAnswered = selected !== null
  const isCorrect = selected === question.answer
  const progress = Math.round(((index % pool.length) / pool.length) * 100)
  const snake = snakeArt[index % snakeArt.length]

  const choose = (value: AnswerValue) => {
    if (isAnswered) return
    setSelected(value)
    setAnswered((current) => current + 1)
    if (value === question.answer) {
      setScore((current) => current + 1)
      setStreak((current) => current + 1)
    } else {
      setStreak(0)
    }
  }

  const next = () => {
    setSelected(null)
    setIndex((current) => current + 1)
  }

  const reset = () => {
    setSelected(null)
    setIndex(0)
    setScore(0)
    setAnswered(0)
    setStreak(0)
  }

  const changeCategory = (nextCategory: string) => {
    setCategory(nextCategory)
    setIndex(0)
    setSelected(null)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Math Olympiad Rescue Quest</p>
          <h1>Pup & Snake Math Missions</h1>
        </div>
        <div className="mascots">
          <PupBadge />
          <img src={snake} alt="cartoon snake" />
        </div>
        <section className="dashboard" aria-label="score board">
          <div className="stat">
            <span>Score</span>
            <strong>{score}/{answered || 0}</strong>
          </div>
          <div className="stat">
            <span>Streak</span>
            <strong>{streak}</strong>
          </div>
          <div className="stat">
            <span>Bank</span>
            <strong>{pool.length}</strong>
          </div>
        </section>
      </section>

      <section className="game-layout">
        <aside className="category-panel" aria-label="question categories">
          <h3>Types</h3>
          {['All Missions', ...categoryNames].map((name) => (
            <button
              key={name}
              className={name === category ? 'active' : ''}
              onClick={() => changeCategory(name)}
              type="button"
            >
              {name}
            </button>
          ))}
        </aside>

        <section className="mission-card">
          <div className="mission-top">
            <div>
              <p className="category">{question.category}</p>
              <h2>Mission {index + 1}</h2>
            </div>
            <div className="level">Level {question.level}</div>
          </div>

          <div className="snake-timer" aria-label="practice timer">
            <div className="timer-label">
              <span>Snake Timer</span>
              <span>{progress}% bank progress</span>
            </div>
            <div className="timer-track">
              <span className="timer-fill" />
              <img key={question.id} src={snake} alt="" />
            </div>
          </div>

          <p className="question-text">{question.prompt}</p>
          <p className="hint">Hint: {question.hint}</p>

          <div className="options">
            {question.options.map((option) => {
              const state = !isAnswered
                ? ''
                : option === question.answer
                  ? 'correct'
                  : option === selected
                    ? 'wrong'
                    : 'muted'
              return (
                <button
                  key={option}
                  className={state}
                  onClick={() => choose(option)}
                  type="button"
                >
                  {option}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className={isCorrect ? 'feedback correct-box' : 'feedback wrong-box'}>
              <strong>{isCorrect ? 'Correct! Rescue complete.' : 'Not this time. Try the idea again.'}</strong>
              <p>{question.explanation}</p>
            </div>
          )}

          <div className="actions">
            <button className="secondary" onClick={reset} type="button">Reset Score</button>
            <button className="primary" onClick={next} type="button" disabled={!isAnswered}>
              Next Mission
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
