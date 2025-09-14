export function basic(node, viewer)
{
    if(!node.title || !node.desc)
    return null

    viewer.content.innerHTML += `
    <h1 id="nextpage-title" class="text-base font-medium md:font-normal  md:text-base"> ${node.title} </h1>
    <p id="nextpage-desc" class="opacity-80 md:text-sm "> ${node.desc}</p>`;

}