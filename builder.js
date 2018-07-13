"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Btoa = require("btoa");
const LZMA = require("lzma");
const Table = require("markdown-table");
const basePageUrl = 'https://itty.bitty.site/#/?';
const readFile = (fileName) => {
    return fs.readFileSync(fileName, 'utf8');
};
const generateColor = subString => {
    const wow = subString + 'sdadasdasdasdasdads';
    var hash = 0;
    for (var i = 0; i < wow.length; i++) {
        hash = wow.charCodeAt(i) + hash;
    }
    var c = (hash * 6000).toString(16).toUpperCase();
    return '00000'.substring(0, 6 - c.length - 1) + c;
};
const pretifyCode = (code) => {
    const noHtmlCode = htmlEntities(code.replace(/ /g, '%^'));
    const codeWithSpaces = noHtmlCode.replace(/%\^/g, '&nbsp;');
    const hilightKeys = codeWithSpaces.replace(/\$\{\d[^\}]*\}/g, (match, ...args) => `<span style="color:#${generateColor(match.slice(0, 3))}">${match}</span>`);
    return hilightKeys;
};
const buildSnippetWebStructureBodyMessage = (snippets) => {
    const { prefix, body, description } = snippets;
    const code = body.reduce((prev, next) => `${prev}</br> ${pretifyCode(next)}`, '');
    return ` -- ${description} </br></br>
	<b>Prefix:</b> ${prefix} </br>
	<b>code:</b> <div style="background: #777;padding:10px"> <span style="background: #777; color: #fff"> ${code}</span></div> </br>
	`;
};
const generateHash = text => {
    const lzma = LZMA.compress(text);
    const base64String = Btoa(String.fromCharCode.apply(null, new Uint8Array(lzma)));
    return base64String;
};
function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/“/g, `&quot;`);
}
const buildSnippetWebStructure = (file) => {
    const snippets = JSON.parse(file);
    return Object.keys(snippets).reduce((prevSnippets, snippetname) => {
        const currentSnippetData = snippets[snippetname];
        const currentMessage = `<b>${snippetname}</b> ${buildSnippetWebStructureBodyMessage(currentSnippetData)}`;
        return [
            ...prevSnippets,
            {
                ...currentSnippetData,
                name: snippetname,
                message: currentMessage,
                hash: `${basePageUrl}${generateHash(currentMessage)}`
            }
        ];
    }, []);
};
const buildSnippetsMetaSnippets = (snippets) => {
    const tableContent = snippets.reduce((prev, next) => [...prev, [`[${next.prefix}](${next.hash})`, `${next.description}`]], []);
    return Table([['Trigger', 'Content'], ...tableContent]);
};
const writeReadMe = (snippet) => {
    const readeMe = readFile('README.md').split('->>>');
    const snippetsMetaData = buildSnippetsMetaSnippets(snippet);
    const fileBody = `${readeMe[0]}\r\n->>>\r\n \r\n${snippetsMetaData}`;
    fs.writeFileSync('README.md', fileBody);
};
const snippetFile = readFile('snippets.json');
const snipperWebStructure = buildSnippetWebStructure(snippetFile);
writeReadMe(snipperWebStructure);
//- > TypeScriptObject
