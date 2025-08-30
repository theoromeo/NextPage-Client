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

    viewer.querySelector("#nextpage-gallery").innerHTML = html
    viewer.querySelector("#nextpage-gallery").classList.remove("hidden")

    if(node.img.length == 1)
    viewer.querySelector("#nextpage-gallery").classList.remove("grid-cols-2")

}