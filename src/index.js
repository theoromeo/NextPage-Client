import viewerHtml from "./template/viewer.html?raw"
import loaderHtml from "./template/loader.html?raw"
import css from "./style/main.css?raw"

import UIManager from "./UIManager.js";

class NextPageClient extends HTMLElement
{
    #instanceID = null
    #UIManager = null

    constructor()
    {
      if(document.getElementsByTagName("next-page").length > 1)
      throw new DOMException("Only one <next-page> element is allowed.", "NotAllowedError");

      super()
      this.DOM = this.attachShadow({mode:"closed"})
      this.#render()

      document.addEventListener("DOMContentLoaded",() => 
      {
        this.#UIManager = new UIManager(this.DOM)
      })

      this.#instanceID = this.#generateInstanceID()
      console.info(`[Instance ID: ${this.#instanceID}]  NextPage Client initialized  successfully.`)

    }

    getInstanceID()
    {
      return this.#instanceID;
    }

    #generateInstanceID()
    {
      return Math.floor(Math.random() * 10000)
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
}
customElements.define("next-page",NextPageClient)
document.body.insertAdjacentElement("afterbegin",document.createElement("next-page"))