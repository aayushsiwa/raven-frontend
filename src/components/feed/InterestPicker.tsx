import { useState } from 'react'
import type { FeedChoice } from '../../features/feed/useFeedExperience'

type InterestPickerProps = {
  feedTree: Record<string, Record<string, string[]>>
  savedChoices: FeedChoice[]
  mapRefreshing: boolean
  providersErrorText: string | null
  feedTreeErrorText: string | null
  onAddChoice: (choice: FeedChoice) => void
  onRemoveChoice: (choice: FeedChoice) => void
  onClearChoices: () => void
}

export function InterestPicker(props: InterestPickerProps) {
  const [openPath, setOpenPath] = useState<string | null>(null)

  const providers = Object.keys(props.feedTree)

  return (
    <section className="interest-panel">
      <div className="picker-actions">
        <button className="btn ghost" onClick={props.onClearChoices} disabled={!props.savedChoices.length}>
          Clear all
        </button>
      </div>

      <div className="chip-scroll">
        {props.savedChoices.length ? (
          props.savedChoices.map((choice) => {
            const key = `${choice.provider}/${choice.category}/${choice.topic}`
            return (
              <button key={key} className="choice-chip" onClick={() => props.onRemoveChoice(choice)}>
                {key} x
              </button>
            )
          })
        ) : (
          <p className="choice-empty">No interests yet. Tap topic to add.</p>
        )}
      </div>

      <div className="accordion-list">
        {providers.map((provider) => {
          const categories = Object.keys(props.feedTree[provider] ?? {})

          return (
            <details
              key={provider}
              className="acc-provider"
              open={openPath === provider || openPath?.startsWith(`${provider}/`)}
              onToggle={(event) => {
                const isOpen = (event.currentTarget as HTMLDetailsElement).open
                setOpenPath(isOpen ? provider : null)
              }}
            >
              <summary>{provider}</summary>
              <div className="acc-content">
                {categories.map((category) => {
                  const categoryKey = `${provider}/${category}`
                  const topics = props.feedTree[provider][category] ?? []

                  return (
                    <details
                      key={categoryKey}
                      className="acc-category"
                      open={openPath === categoryKey}
                      onToggle={(event) => {
                        const isOpen = (event.currentTarget as HTMLDetailsElement).open
                        setOpenPath(isOpen ? categoryKey : provider)
                      }}
                    >
                      <summary>{category}</summary>
                      <div className="topic-list">
                        {topics.map((topic) => {
                          const choice: FeedChoice = { provider, category, topic }
                          const exists = props.savedChoices.some(
                            (item) =>
                              item.provider === provider &&
                              item.category === category &&
                              item.topic === topic,
                          )

                          return (
                            <button
                              key={`${categoryKey}/${topic}`}
                              className={`topic-pill ${exists ? 'selected' : ''}`.trim()}
                              onClick={() => {
                                if (exists) {
                                  props.onRemoveChoice(choice)
                                  return
                                }
                                props.onAddChoice(choice)
                              }}
                            >
                              {topic}
                            </button>
                          )
                        })}
                      </div>
                    </details>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      <p className="picker-status">
        {props.mapRefreshing ? 'Refreshing hierarchy...' : `${props.savedChoices.length} interests saved`}
      </p>

      {props.providersErrorText ? <p className="error">{props.providersErrorText}</p> : null}
      {props.feedTreeErrorText ? <p className="error">{props.feedTreeErrorText}</p> : null}
    </section>
  )
}
