<template>
  <label :for="id" :class="noteClasses">
    <span class="heading">
      <span>{{ title }}</span>
      <span :class="[!isToday ? 'secondary' : '']">{{ dateLabel }}</span>
    </span>
    <pre ref="highlight" class="editor highlight" v-html="highlightContent"></pre>
    <textarea v-model="content" ref="editor" class="editor textarea" :id="id"></textarea>
  </label>
</template>

<script>
import hljs from 'highlight.js'
import dataPlaceholder from '../config/data-placeholder'

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
    title: String,
    date: Date
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
      return this.date ? `${this.date.getDate()}.${this.today.getMonth() + 1}` : ''
    },
    noteClasses () {
      let classes = ['note', this.id]
      if (this.isMonth) classes.push('month')
      if (this.isToday) classes.push('today')
      return classes
    },
    highlightContent () {
      let codeHighlight = hljs.highlight('markdown', this.content).value + '\n\n'

      // xit task
      // [ ] Open
      // [X] Checked
      // [@] Ongoing
      // [~] Obsolete
      codeHighlight = codeHighlight.replace(/^\[(x|@|~|\s)\] (.*)/gm, (match, p1, p2) => {
        let type = ''
        if (p1 === ' ') type = 'open'
        if (p1 === 'x') type = 'checked'
        if (p1 === '~') type = 'obsolete'
        if (p1 === '@') type = 'ongoing'
        // Prevent highligh.js from highlight tag and priority
        const dataSlug = match.replace(/@/g, '@-').replace(/!/g, '!-')
        return `<span class="task ${type}" data-slug="${encodeURIComponent(dataSlug)}"><span class="checkbox">[${p1}]</span><span> ${p2}</span></span>`
      })

      // Strike through
      codeHighlight = codeHighlight.replace(
        /~~(.*?)~~/g,
        `<span class="strikethrough">~~$1~~</span>`
      )

      // Tag. Eg: @x-tag
      codeHighlight = codeHighlight.replace(
        /@([\w-_]+)/g,
        `<span class="badge tag">@$1</span>`
      )

      // Priorities. Eg: !High !Medium !Low
      codeHighlight = codeHighlight.replace(
        /!(high|medium|low)/gmi,
        (match, value) => {
          return `<span class="badge priority ${value.toLowerCase()}">${match}</span>`
        }
      )

      // Event. Eg: ^ Christmas holiday
      codeHighlight = codeHighlight.replace(
        /^(\^) (.*)/gm,
        '<span class="event"><span class="hljs-bullet">$1</span> <span>$2</span></span>'
      )

      // Clickable link
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

      this.$nextTick(() => {
        document.querySelectorAll('.task').forEach(el => el.addEventListener('click', _ => this.changeTaskStatus(event)))
      })

      return codeHighlight
    }
  },
  mounted () {
    this.editorEl = this.$refs.editor
    this.highlightEl = this.$refs.highlight

    this.editorEl.addEventListener('scroll', _ => this.scrollSync())
    this.editorEl.addEventListener('keydown', _ => this.syncInputContent(event))
    this.editorEl.addEventListener('input', _ => this.syncInputContent(event))

    document.querySelectorAll('.task').forEach(el => el.addEventListener('click', _ => this.changeTaskStatus(event)))
  },
  methods: {
    getContent () {
      if (window.localStorage.getItem(this.id) !== null) {
        return window.localStorage.getItem(this.id)
      }

      return this.id === 'monday' ? dataPlaceholder : ''
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
    },
    changeTaskStatus (event) {
      const status = event.target.textContent
      const content = decodeURIComponent(event.target.parentNode.getAttribute('data-slug')).replace(/@-/g, '@').replace(/!-/g, '!')
      const newContent = status.replace(/\[(x|\s|@|~)\]/, (match, status) => {
        let newStatus = ''
        if (status === ' ') newStatus = '[x]'
        if (status === 'x') newStatus = '[@]'
        if (status === '@') newStatus = '[~]'
        if (status === '~') newStatus = '[ ]'
        return content.replace(/\[.*\]/, newStatus)
      })

      this.content = this.content.replace(content, newContent)
    }
  }
}
</script>
