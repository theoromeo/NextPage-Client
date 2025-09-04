import viewerHtml from "./template/viewer.html?raw"
import loaderHtml from "./template/loader.html?raw"
import css from "./style/main.css?raw"

import ViewTypesRegister from "./ViewTypesRegister.js";
import NextPage from "./lib/NextPage.2025-02-12.min.js"

class NextPageClient extends HTMLElement
{
  // Private Fields
  #id
  #isTerminatedView
  #ui

  constructor()
  {
    if(document.getElementsByTagName("next-page").length > 1)
    throw new DOMException("Only one <next-page> element is allowed.", "NotAllowedError");
    
    super()
    this.DOM = this.attachShadow({mode:"closed"})
    this.#render()

    this.#isTerminatedView = false

    document.addEventListener("DOMContentLoaded",() => 
    {
      this.#initUiObjects()
      this.#initUiListeners()
      this.#initIntercept()
      this.#initChangeObserver()
    })

    
    this.#id = this.#generateInstantId();
    console.info(`[Instance ID: ${this.#id}]  NextPage Client initialized  successfully.`)

  }
  // Public methods
  getID()
  {
    return this.#id
  }

  setNode(url, node)
  {
    if(this.#isTerminatedView == true)
    {
      this.#isTerminatedView = false
      return
    }

    this.#setWindowPointerEvent(true)

    if(!ViewTypesRegister[node.view])
    throw new ReferenceError("View <${node.view}> not valid")

    requestAnimationFrame(() => 
    {
      this.reset()

      ViewTypesRegister[node.view](node, this.#ui.viewer)
  
      this.#ui.viewerSite.innerText = url.host.replace("www.","")
  
      this.#setSecureBadge(url)
      this.#setAction(url,node)
      
      this.hide(this.#ui.loader)
      this.show(this.#ui.viewer)
      
    })
    
  }

  getQueryNode(url)
  {
    const nodePosition = url.lastIndexOf(":")
    const nodeName = url.slice(nodePosition+1,url.length)

    return nodeName.trim().toLowerCase()
  }

  closeLoaderEvent()
  {
    this.reset()
    this.#isTerminatedView = true;
  }

  closeViewerEvent()
  {
    this.reset()
  }

  closeWindowEvent()
  {
    this.reset()
    this.#setWindowPointerEvent(false)

  }

  show(element)
  {
    element.classList.remove("hidden")
  }

  hide(element)
  {
    element.classList.add("hidden")
  }

  reset()
  {
    this.show(this.#ui.loaderGif)
    this.hide(this.#ui.loader)
    this.hide(this.#ui.viewer)
    this.hide(this.#ui.viewerSecureFalse)
    this.hide(this.#ui.viewerSecureTrue)
    this.hide(this.#ui.viewerGallery)
    this.hide(this.#ui.viewerArticle)
    this.#ui.viewerGallery.classList.add("grid-cols-2")

  } 

  // Private methods

  #generateInstantId() 
  {
    return Math.floor(Math.random() * 10000)
  }

  #render()
  {
    this.DOM.innerHTML = `
    <style>
      ${css}
    </style>

    <div id="nextpage-window" class=" pointer-events-none flex fixed top-0  left-0 flex-col w-screen h-[100${this.#getSupportedHeight()}]  py-4 px-4 justify-end ">
      ${loaderHtml}
      ${viewerHtml}
    </div>
    `
  }

  #getSupportedHeight()
  {
    const temp = document.createElement('div');
    document.body.appendChild(temp);
  
    temp.style.height = '100dvh';
    const isSupported = temp.offsetHeight > 0;
    temp.remove()

    if(isSupported)
    return "dvh"

    return "vh"
  }

  #initChangeObserver()
  {
    const observer = new MutationObserver ((mutations) => 
    {
      for(const mutation of mutations)
      {
        if(mutation.type != "childList")  
        return
        
        for(const node of mutation.addedNodes)
        {
          if(!(node instanceof HTMLElement)) 
          continue;

          if (node.matches("[href]"))
          this.#addInterceptListener(node)

          const links = node.querySelectorAll("[href]")
          links.forEach((link) => this.#addInterceptListener(link))
        }
      }
    })
    observer.observe(document.body,{childList:true,subtree:true})

  }

  #initUiObjects()
  {
    this.#ui = 
    {
      window:this.DOM.getElementById("nextpage-window"),
      loader:this.DOM.getElementById("nextpage-loader"),
      viewer:this.DOM.getElementById("nextpage-viewer")
    }

    this.#ui.loaderLabel =this.#ui.loader.querySelector("#nextpage-loader-label"),
    this.#ui.loaderBtn =this.#ui.loader.querySelector("#nextpage-loader-btn"),
    this.#ui.loaderGif =this.#ui.loader.querySelector("#nextpage-loader-gif"),

    this.#ui.viewerBtn = this.#ui.viewer.querySelector("#nextpage-viewer-btn"),
    this.#ui.viewerLabel = this.#ui.viewer.querySelector("#nextpage-secure-label"),
    this.#ui.viewerGallery = this.#ui.viewer.querySelector("#nextpage-gallery"),
    this.#ui.viewerArticle = this.#ui.viewer.querySelector("#nextpage-article"),
      
    this.#ui.viewerSecureLabel = this.#ui.viewer.querySelector("#nextpage-secure-label"),
    this.#ui.viewerSecureFalse = this.#ui.viewer.querySelector("#nextpage-secure-false"),
    this.#ui.viewerSecureTrue = this.#ui.viewer.querySelector("#nextpage-secure-true"),
    this.#ui.viewerSite = this.#ui.viewer.querySelector("#nextpage-site"),

    this.#ui.viewerAction = this.#ui.viewer.querySelector("#nextpage-action"),
    this.#ui.viewerActionLabel = this.#ui.viewer.querySelector("#nextpage-action-label")

  }

  #initUiListeners()
  {
    this.#ui.loaderBtn.addEventListener("click", () => this.closeLoaderEvent())
    this.#ui.viewerBtn.addEventListener("click", () => this.closeViewerEvent())
    this.#ui.window.addEventListener("click", () => this.closeWindowEvent())

    this.#stopEventPropagation(this.#ui.viewer)
    this.#stopEventPropagation(this.#ui.loader)
  }

  #initIntercept()
  {
    const linkElements = document.querySelectorAll(`[href]`) 
    
    for(const linkElement of linkElements)
    this.#addInterceptListener(linkElement)
  }

  #addInterceptListener(linkElement)
  {
    if(!linkElement || !linkElement.href || linkElement.href.trim() == "")
    return

    let linkUrl = new URL(linkElement.href)

    if(!linkUrl.pathname.includes(":"))
    return

    linkElement.href = this.#purgeQuery(linkElement.href)
    linkUrl.nodeless = linkElement.href
    linkElement.setAttribute("style", linkElement.getAttribute("style")+"; cursor: alias;")

    if(this.getQueryNode(linkUrl.href) == "")
    return

    linkElement.addEventListener("click", (event) => this.#interceptEvent(event,linkUrl))
  }

  async #interceptEvent(event,url)
  {
    event.preventDefault()

    this.hide(this.#ui.loader)
    this.hide(this.#ui.viewer)
    this.show(this.#ui.loaderGif)

    let queryNode = this.getQueryNode(url.href)

    if(queryNode == "default")
    queryNode = null

    this.#ui.loaderLabel.innerText = url.host.replace("www.","")
    

    const nextPage = new NextPage()

    this.show(this.#ui.loader)
    this.#isTerminatedView = false
    const nodeResult = await nextPage.queryWithUrl(event.target.href,queryNode)
    
    if(nodeResult instanceof Error)
    {
      console.log(nodeResult)
      this.#ui.loaderLabel.innerText = "Network Error"
      this.hide(this.#ui.loaderGif)
      return
    }
    this.setNode(url,nodeResult)
  }

  #setAction(url,node)
  {
    this.#ui.viewerAction.classList.remove("bg-green-600")
    this.#ui.viewerAction.classList.remove("bg-blue-500")

    if(!node.action)
    {
      this.#ui.viewerAction.classList.add("bg-blue-500")
      this.#ui.viewerActionLabel.innerText = `Continue To: "${url.host.trim()}"`
      this.#ui.viewerAction.href = url.nodeless
      return
    }

    this.#ui.viewerAction.classList.add("bg-green-600")
    this.#ui.viewerActionLabel.innerText = node.action[0].trim()
    this.#ui.viewerAction.href = node.action[1]
  }

  #setSecureBadge(url)
  {
    const isSecure = url.protocol === "https:"

    if(isSecure)
    {
      this.show(this.#ui.viewerSecureTrue)
      this.#ui.viewerSecureLabel.innerText = "secure"
    }

    else
    {
      this.show(this.#ui.viewerSecureFalse)
      this.#ui.viewerLabel.innerText = "not secure"
    }
  }

  #purgeQuery(link)
  {
    if(!link.includes(":"))
    return link

    const nodePosition = link.lastIndexOf(":")
    return link.slice(0,nodePosition)
  }

  #stopEventPropagation(element)
  {
    element.addEventListener("click",(event) => event.stopPropagation());
  }

  #setWindowPointerEvent(state)
  {

    if(state)
    {
      this.#ui.window.classList.add("md:pointer-events-none")
      this.#ui.window.classList.remove("pointer-events-none")
      return
    }

    this.#ui.window.classList.remove("md:pointer-events-none")
    this.#ui.window.classList.add("pointer-events-none")
  }
}
customElements.define("next-page",NextPageClient)
document.body.insertAdjacentElement("afterbegin",document.createElement("next-page"))