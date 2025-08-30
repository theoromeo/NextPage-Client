import { basic } from "./basic.js"
export function article(node, viewer)
{
    basic(node, viewer)

    if(!node.article)
    return null 

    viewer.querySelector("#nextpage-article").innerHTML = node.article
    viewer.querySelector("#nextpage-article").classList.remove("hidden")
}