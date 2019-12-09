<template>
  <label :for="id" :class="noteClasses">
    <span class="heading">
      {{ title }}
      <span v-if="isToday" v-text="dateLabel"></span>
    </span>
    <pre class="editor highlight" v-html="highlightContent" ref="highlight"></pre>
    <textarea :id="id" spellcheck="false" class="editor textarea" v-model="content" ref="editor"></textarea>
  </label>
</template>

<script>
import hljs from 'highlight.js'

const PLACEHOLDER = `o this is a new task.
x completed task.

Let's create a @tag

Prioritize your task using !low !medium !high

# You can use common markdown's syntax like:

**bold**
_italic_
~~strike through~~

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
    dateLabel () {
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

      codeHighlight = codeHighlight.replace(
        /~~(.*?)~~/g,
        `<span class="strikethrough">~~$1~~</span>`
      )

      codeHighlight = codeHighlight.replace(
        /@([\w-_]+)/g,
        `<span class="tag">@$1</span>`
      )

      codeHighlight = codeHighlight.replace(
        /^(o) (.*)/gm,
        `<span class="task"><span class="hljs-bullet">$1</span> <span>$2</span></span>`
      )

      codeHighlight = codeHighlight.replace(
        /^(x) (.*)/gm,
        `<span class="task complete"><span class="hljs-bullet">$1</span> <span>$2</span></span>`
      )

      codeHighlight = codeHighlight.replace(
        /!(high|medium|low)/gmi,
        (match, value) => {
          return `<span class="priority ${value.toLowerCase()}">${match}</span>`
        }
      )

      codeHighlight = codeHighlight.replace(
        /(!\[.*\]\((.*)\))/g,
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
      if (window.localStorage.getItem(this.id)) {
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
        let cursorPos = this.editorEl.selectionStart
        let left = this.content.substring(0, cursorPos)
        let right = this.content.substring(cursorPos)
        this.content = left + keyPressed + BRACKETS.get(keyPressed) + right
        this.editorEl.selectionEnd = cursorPos + 1
        e.preventDefault()
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
    color: var(--color-day-text);
    position: relative;
    border-radius: 4px;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
  }

  .month {
    grid-column: span 3;
  }

  .today {
    background: var(--yellow-100);
    .heading {
      border-color: var(--orange-200);
    }
  }

  .heading {
    border-bottom: 1px solid var(--gray-300);
    font-weight: 600;
    padding: .5rem;
    display: flex;
    justify-content: space-between;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: .05em;
  }

  .editor {
    position: absolute;
    width: 100%;
    height: calc(100% - 29px);
    top: 29px;
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
    -webkit-text-fill-color: transparent;
  }
</style>
