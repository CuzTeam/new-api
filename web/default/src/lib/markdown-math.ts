const MATH_DELIMITER_PATTERN =
  /(```[\s\S]*?```|`[^`\n]*`)|\\\[([\s\S]*?[^\\])\\\]|\\\(([\s\S]*?[^\\])\\\)/g

export function normalizeMathDelimiters(input: string): string {
  return input.replace(
    MATH_DELIMITER_PATTERN,
    (match, codeBlock, blockMath, inlineMath) => {
      if (codeBlock) return codeBlock
      if (blockMath) return `$$${blockMath}$$`
      if (inlineMath) return `$${inlineMath}$`
      return match
    }
  )
}
