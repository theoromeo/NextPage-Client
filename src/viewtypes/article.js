import { basic } from "./basic.js"
export function article(node, viewer)
{
    basic(node, viewer)

    if(!node.article)
    return null 

    viewer.content.innerHTML += `
    <p id="nextpage-article" class="opacity-80  md:text-sm">${node.article}</p>`
}