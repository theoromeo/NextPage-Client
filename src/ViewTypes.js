
const ViewTypes = 
{
    "basic": (node, viewer) => 
    {
        if(!node.title || !node.desc)
        return null

        viewer.querySelector("#nextpage-title").innerText = node.title
        viewer.querySelector("#nextpage-desc").innerText = node.desc

    },
    "gallery": (node, viewer) => 
    {
        ViewTypes.basic(node, viewer)

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

    },
    "article": (node, viewer) => 
    {
        ViewTypes.basic(node, viewer)

        if(!node.article)
        return null 

        viewer.querySelector("#nextpage-article").innerHTML = node.article
        viewer.querySelector("#nextpage-article").classList.remove("hidden")


    },
}

export default ViewTypes