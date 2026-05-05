const NEWLINE = '\n'

function countRepeatedChars(input: string, start: number, char: string) {
  let index = start
  while (index < input.length && input[index] === char) {
    index += 1
  }
  return index - start
}

function isEscaped(input: string, index: number) {
  let backslashCount = 0
  let cursor = index - 1

  while (cursor >= 0 && input[cursor] === '\\') {
    backslashCount += 1
    cursor -= 1
  }

  return backslashCount % 2 === 1
}

function findClosingDelimiter(
  input: string,
  start: number,
  openChar: '(' | '[',
  closeChar: ')' | ']'
) {
  for (let index = start; index < input.length - 1; index += 1) {
    if (
      input[index] === '\\' &&
      input[index + 1] === closeChar &&
      !isEscaped(input, index)
    ) {
      const content = input.slice(start, index)
      if (content.length === 0 || content.endsWith('\\')) {
        return null
      }

      return {
        content,
        end: index + 2,
        wrapper: openChar === '[' ? '$$' : '$',
      }
    }
  }

  return null
}

function findFenceEnd(
  input: string,
  searchStart: number,
  marker: '`' | '~',
  markerCount: number
) {
  let cursor = searchStart

  while (cursor < input.length) {
    const lineEnd = input.indexOf(NEWLINE, cursor)
    const nextCursor = lineEnd === -1 ? input.length : lineEnd + 1
    const line = input.slice(cursor, nextCursor)
    const trimmed = line.replace(/\r?\n$/, '')
    const indentMatch = trimmed.match(/^ {0,3}/)
    const indentLength = indentMatch?.[0].length ?? 0
    const markerRun = countRepeatedChars(trimmed, indentLength, marker)

    if (markerRun >= markerCount) {
      const rest = trimmed.slice(indentLength + markerRun).trim()
      if (rest.length === 0) {
        return nextCursor
      }
    }

    cursor = nextCursor
  }

  return input.length
}

export function normalizeMathDelimiters(input: string): string {
  let output = ''
  let index = 0

  while (index < input.length) {
    const lineStart =
      index === 0 || input[index - 1] === '\n' || input[index - 1] === '\r'

    if (lineStart) {
      const lineEnd = input.indexOf(NEWLINE, index)
      const currentLineEnd = lineEnd === -1 ? input.length : lineEnd + 1
      const line = input.slice(index, currentLineEnd)
      const trimmed = line.replace(/\r?\n$/, '')
      const indentMatch = trimmed.match(/^ {0,3}/)
      const indentLength = indentMatch?.[0].length ?? 0
      const marker = trimmed[indentLength]

      if (marker === '`' || marker === '~') {
        const markerCount = countRepeatedChars(trimmed, indentLength, marker)

        if (markerCount >= 3) {
          const fenceEnd = findFenceEnd(
            input,
            currentLineEnd,
            marker,
            markerCount
          )
          output += input.slice(index, fenceEnd)
          index = fenceEnd
          continue
        }
      }
    }

    if (input[index] === '`') {
      const tickCount = countRepeatedChars(input, index, '`')
      const closing = input.indexOf('`'.repeat(tickCount), index + tickCount)

      if (closing !== -1) {
        const end = closing + tickCount
        output += input.slice(index, end)
        index = end
        continue
      }
    }

    if (
      input[index] === '\\' &&
      !isEscaped(input, index) &&
      (input[index + 1] === '(' || input[index + 1] === '[')
    ) {
      const openChar = input[index + 1] as '(' | '['
      const closeChar = openChar === '(' ? ')' : ']'
      const match = findClosingDelimiter(input, index + 2, openChar, closeChar)

      if (match) {
        output += `${match.wrapper}${match.content}${match.wrapper}`
        index = match.end
        continue
      }
    }

    output += input[index]
    index += 1
  }

  return output
}
