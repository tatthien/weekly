<template>
  <label :for="id" :class="noteClasses">
    <span :class="$style.heading">
      {{ title }}
      <span v-if="isToday" v-text="dateLabel"></span>
    </span>
    <pre :class="[$style.editor, $style.highlight]" v-html="highlightContent" ref="highlight"></pre>
    <textarea :id="id" spellcheck="false" :class="[$style.editor, $style.textarea]" v-model="content" ref="editor"></textarea>
  </label>
</template>

<script>
import hljs from 'highlight.js'

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
      content: window.localStorage.getItem(this.id) || '',
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
      let classes = [this.$style.note]
      if (this.isMonth) classes.push(this.$style.month)
      if (this.isToday) classes.push(this.$style.today)
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
        /(\[ \] .*)/g,
        `<span class="checklist">$1</span>`
      )

      codeHighlight = codeHighlight.replace(
        /(\[x\] .*)/g,
        `<span class="checklist checked">$1</span>`
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

<style lang="scss" module>
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
