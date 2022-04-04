import React from 'react'
import ReactMarkdownLib, { ReactMarkdownOptions } from 'react-markdown'
import gfm from 'remark-gfm'
import markdownComponents from './styles'

const Markdown: React.FC<ReactMarkdownOptions> = (props) => {
  return <ReactMarkdownLib remarkPlugins={[gfm]} components={markdownComponents} {...props} />
}

export default Markdown
