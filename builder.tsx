import fs = require('fs')
import * as Btoa from 'btoa'
import * as LZMA from 'lzma'
import * as Table from 'markdown-table'

interface snippet {
  prefix: string
  body: string[]
  description: string
}
interface snippets {
  [name: string]: snippet
}

interface SnippetWebStructure {
  prefix: string
  body: string[]
  description: string
  name: string
  message: string
  hash: string
}

const basePageUrl = 'https://itty.bitty.site/#/?'

const readFile = (fileName: string): string => {
  return fs.readFileSync(fileName, 'utf8')
}

const generateColor = subString => {
  const wow = subString + 'sdadasdasdasdasdads'
  var hash = 0
  for (var i = 0; i < wow.length; i++) {
    hash = wow.charCodeAt(i) + hash
  }
  var c = (hash * 6000).toString(16).toUpperCase()
  return '00000'.substring(0, 6 - c.length - 1) + c
}

const pretifyCode = (code: string) => {
  const noHtmlCode = htmlEntities(code.replace(/ /g, '%^'))
  const codeWithSpaces = noHtmlCode.replace(/%\^/g, '&nbsp;')
  const hilightKeys = codeWithSpaces.replace(
    /\$\{\d[^\}]*\}/g,
    (match, ...args) => `<span style="color:#${generateColor(match.slice(0, 3))}">${match}</span>`
  )
  return hilightKeys
}

const buildSnippetWebStructureBodyMessage = (snippets: snippet): string => {
  const { prefix, body, description } = snippets
  const code = body.reduce((prev, next) => `${prev}</br> ${pretifyCode(next)}`, '')
  return ` -- ${description} </br></br>
	<b>Prefix:</b> ${prefix} </br>
	<b>code:</b> <div style="background: #777;padding:10px"> <span style="background: #777; color: #fff"> ${code}</span></div> </br>
	`
}

const generateHash = text => {
  const lzma = LZMA.compress(text)
  const base64String = Btoa(String.fromCharCode.apply(null, new Uint8Array(lzma)))
  return base64String
}

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/“/g, `&quot;`)
}

const buildSnippetWebStructure = (file: string): SnippetWebStructure[] => {
  const snippets: snippets = JSON.parse(file)
  return Object.keys(snippets).reduce((prevSnippets, snippetname) => {
    const currentSnippetData = snippets[snippetname]
    const currentMessage = `<b>${snippetname}</b> ${buildSnippetWebStructureBodyMessage(currentSnippetData)}`
    return [
      ...prevSnippets,

      {
        ...currentSnippetData,
        name: snippetname,
        message: currentMessage,
        hash: `${basePageUrl}${generateHash(currentMessage)}`
      }
    ]
  }, [])
}

const buildSnippetsMetaSnippets = (snippets: SnippetWebStructure[]) => {
  const tableContent = snippets.reduce(
    (prev, next) => [...prev, [`[${next.prefix}](${next.hash})`, `${next.description}`]],
    []
  )
  return Table([['Trigger', 'Content'], ...tableContent])
}

const writeReadMe = (snippet: SnippetWebStructure[]) => {
  const readeMe = readFile('README.md').split('->>>')
  const snippetsMetaData = buildSnippetsMetaSnippets(snippet)
  const fileBody = `${readeMe[0]}\r\n->>>\r\n \r\n${snippetsMetaData}`

  fs.writeFileSync('README.md', fileBody)
}

const snippetFile = readFile('snippets.json')
const snipperWebStructure = buildSnippetWebStructure(snippetFile)

writeReadMe(snipperWebStructure)

//- > TypeScriptObject
