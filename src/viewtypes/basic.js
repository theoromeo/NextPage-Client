export function basic(node, viewer)
{
    if(!node.title || !node.desc)
    return null

    viewer.querySelector("#nextpage-title").innerText = node.title
    viewer.querySelector("#nextpage-desc").innerText = node.desc

}