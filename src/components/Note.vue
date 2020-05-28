<template lang="pug">
  label(:for="id", :class="noteClasses")
    span.heading
      span(v-text="title")
      span(v-if="isToday", v-text="toDayLabel")
    pre.editor.highlight(v-html="highlightContent", ref="highlight")
    textarea.editor.textarea(:id="id", v-model="content", ref="editor")
</template>

<script>
import hljs from 'highlight.js'

const PLACEHOLDER = `# Todo
\`[ ] Your open task.\`
\`[x] The completed one.\`

You can create a @tag or @another-tag like this.

Prioritize your task using !low !medium !high

# You can use common markdown's syntax like:

**bold**
_italic_
~~strike through~~

> Stay hungry, stay foolish

# Some ordered list
1. First
2. Second
3. And the final
`

const BRACKETS = new Map([
  ['[', ']'],
  ['(', ')'],
  ['{', '}']
])

export default {
  name: 'note',
  props: {
    id: {
      type: String,
      required: true
    },
    index: Number,
    title: String
  },
  data () {
    return {
      content: this.getContent(),
      today: new Date(),
      editorEl: null,
      highlightEl: null
    }
  },
  computed: {
    isMonth () {
      return this.id.indexOf('month') >= 0
    },
    isToday () {
      return this.today.getDay() === this.index + 1
    },
    toDayLabel () {
      return `${this.today.getDate()}.${this.today.getMonth() + 1}`
    },
    noteClasses () {
      let classes = ['note']
      if (this.isMonth) classes.push('month')
      if (this.isToday) classes.push('today')
      return classes
    },
    highlightContent () {
      let codeHighlight = hljs.highlight('markdown', this.content).value + '\n\n'

      // Strike thourgh
      codeHighlight = codeHighlight.replace(
        /~~(.*?)~~/g,
        `<span class="strikethrough">~~$1~~</span>`
      )

      // Tag
      codeHighlight = codeHighlight.replace(
        /@([\w-_]+)/g,
        `<span class="badge tag">@$1</span>`
      )

      // Open task
      codeHighlight = codeHighlight.replace(
        /^(\[\s{1}\]) (.*)/gm,
        '<span class="task open"><span class="invisible">$1</span><span> $2</span></span>'
      )

      // Completed task
      codeHighlight = codeHighlight.replace(
        /^(\[x\]) (.*)/gm,
        '<span class="task completed"><span class="invisible">$1</span><span> $2</span></span>'
      )

      codeHighlight = codeHighlight.replace(
        /^(\^) (.*)/gm,
        '<span class="event"><span class="hljs-bullet">$1</span> <span>$2</span></span>'
      )

      // Priorities
      codeHighlight = codeHighlight.replace(
        /!(high|medium|low)/gmi,
        (match, value) => {
          return `<span class="badge priority ${value.toLowerCase()}">${match}</span>`
        }
      )

      // Cickable link
      codeHighlight = codeHighlight.replace(
        /(\[.*\]\((.*)\))/g,
        (match, all, link) => {
          let m = link.match(/>(.*)</)
          if (m && m.length > 1) {
            return `<a target="_blank" rel="noopenner noreferrer" class="url" href="${m[1]}">${all}</a>`
          } else {
            return match
          }
        }
      )

      return codeHighlight
    }
  },
  mounted () {
    this.editorEl = this.$refs.editor
    this.highlightEl = this.$refs.highlight

    this.editorEl.addEventListener('scroll', _ => this.scrollSync())
    this.editorEl.addEventListener('keydown', _ => this.syncInputContent(event))
    this.editorEl.addEventListener('input', _ => this.syncInputContent(event))
  },
  methods: {
    getContent () {
      if (window.localStorage.getItem(this.id) !== null) {
        return window.localStorage.getItem(this.id)
      }

      return this.id === 'monday' ? PLACEHOLDER : ''
    },
    scrollSync () {
      this.highlightEl.scrollTop = this.editorEl.scrollTop
    },
    syncInputContent (e) {
      let keyPressed = e.key

      this.hitBracket(keyPressed, e)

      if (window.localStorage) {
        window.localStorage.setItem(this.id, this.content)
      }
    },
    hitBracket (keyPressed, e) {
      if (BRACKETS.has(keyPressed)) {
        const isSquareBracket = keyPressed === '['
        let cursorPos = this.editorEl.selectionStart
        let left = this.content.substring(0, cursorPos)
        let right = this.content.substring(cursorPos)
        let whitespace = isSquareBracket ? ' ' : ''
        this.content = left + keyPressed + whitespace + BRACKETS.get(keyPressed) + right + whitespace

        this.$nextTick(() => {
          this.editorEl.selectionEnd = cursorPos + (isSquareBracket ? 4 : 1)
          e.preventDefault()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .note {
    background: #fff;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 0 0 1px var(--color-border);

    --heading-height: 40px;
  }

  .month {
    grid-column: span 3;
  }

  .today {
    .heading {
      background: var(--color-heading-highlight);
    }
  }

  .heading {
    border-bottom: 1px solid var(--color-border);
    padding: 0 1rem;
    height: var(--heading-height);
    line-height: var(--heading-height);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: .05em;
  }

  .editor {
    position: absolute;
    width: 100%;
    height: calc(100% - var(--heading-height));
    top: var(--heading-height);
    border: 0;
    resize: none;
    background: none;
    font: inherit;
    line-height: inherit;
    margin: 0;
    padding: .5rem;
    line-height: 1.5em;
    color: var(--color-day-text);
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .highlight {
    z-index: 2;
    background: transparent;
    pointer-events: none;
    overflow-y: auto;
  }

  .textarea {
    z-index: 1;
    outline: none;
    -webkit-text-fill-color: transparent;

    &::selection {
      background: #ffeaa9
    }
  }
</style>
