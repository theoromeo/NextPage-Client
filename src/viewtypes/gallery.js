import { basic } from "./basic.js"

export function gallery(node, viewer)
{
    basic(node, viewer)

    if(!node.img || node.img.length < 1)
    return null

    let html = ''
    node.img.forEach(img => 
    {
        html += `<img class="aspect-video bg-gray-100 bg-opacity-5 object-cover min-w-[100%] rounded-lg" src="${img}" alt=""> `
    })

    viewer.content.innerHTML += `
    <div id="nextpage-gallery" class="grid gap-2 grid-cols-2">${html}</div>`

    if(node.img.length == 1)
    viewer.root.querySelector("#nextpage-gallery").classList.remove("grid-cols-2")

}