import Interpreter from "./Interpreter.js";
import ViewTypesRegister from "./ViewTypesRegister.js";

/**
 * UIManager is responsible for locating UI elements inside the shadow
 * DOM, showing/hiding/resetting view sections, and intercepting hyperlink
 * clicks that include NextPage query nodes.
 */
export default class UIManager {
    /**
     * Indicates whether the loader/viewer is currently active.
     * @type {boolean}
     * @private
     */
    #isViewActive = false

    /**
     * UI element references collected from the shadow DOM.
     * @type {Object<string, HTMLElement>}
     * @private
     */
    #ui = {
        window: {},
        loader: {},
        viewer: {},
    }

    /**
     * Lightweight interpreter used to parse query nodes from URLs.
     * @type {Interpreter}
     * @private
     */
    #interpreter = new Interpreter()

    /**
     * The shadow root or DOM root where UI elements live.
     * @type {ShadowRoot|HTMLElement|null}
     */
    DOM = null

    constructor(DOM)
    {
        this.DOM = DOM;
        this.#initUIObjects()
        this.#initUIListeners()
        this.#initHyperlinkInterceptor()
        this.#initChangeObserver()

    }

    /**
     * Locate and cache relevant UI elements from the provided `DOM` root.
     * @private
     * @returns {void}
     */
    #initUIObjects() {
        this.#ui.window.root = this.DOM.getElementById("nextpage-window"),
        this.#ui.loader.root = this.DOM.getElementById("nextpage-loader"),
        this.#ui.viewer.root = this.DOM.getElementById("nextpage-viewer")
        
        this.#ui.loader.label =this.#ui.loader.root.querySelector("#nextpage-loader-label"),
        this.#ui.loader.closeButton =this.#ui.loader.root.querySelector("#nextpage-loader-closeButton"),
        this.#ui.loader.gif =this.#ui.loader.root.querySelector("#nextpage-loader-gif"),
        
        this.#ui.viewer.content = this.DOM.getElementById("nextpage-content")
        this.#ui.viewer.closeButton = this.#ui.viewer.root.querySelector("#nextpage-viewer-closeButton"),
        this.#ui.viewer.secureLabel = this.#ui.viewer.root.querySelector("#nextpage-secure-label"),
        this.#ui.viewer.secureBadgeFalse = this.#ui.viewer.root.querySelector("#nextpage-secure-badge-false"),
        this.#ui.viewer.secureBadgeTrue = this.#ui.viewer.root.querySelector("#nextpage-secure-badge-true"),
        this.#ui.viewer.site = this.#ui.viewer.root.querySelector("#nextpage-site"),

        this.#ui.viewer.action = this.#ui.viewer.root.querySelector("#nextpage-action"),
        this.#ui.viewer.actionLabel = this.#ui.viewer.root.querySelector("#nextpage-action-label")


    }

    /**
     * Attach UI listeners for loader/viewer buttons and window clicks.
     * @private
     * @returns {void}
     */
    #initUIListeners() {
        this.#ui.loader.closeButton.addEventListener("click", () => this.#closeLoaderEvent())
        this.#ui.viewer.closeButton.addEventListener("click", () => this.#closeViewerEvent())
        this.#ui.window.root.addEventListener("click", () => this.#closeWindowEvent())

        this.#stopEventPropagation(this.#ui.viewer.root)
        this.#stopEventPropagation(this.#ui.loader.root)
    }

    /**
     * Scan the document for elements with an `href` and attach hyperlink
     * interceptor listeners to those that include a query node.
     * @private
     * @returns {void}
     */
    #initHyperlinkInterceptor() {
        const linkElements = document.querySelectorAll(`body [href]`) 
        
        for(const linkElement of linkElements)
        this.#addHyperlinkInterceptorListener(linkElement)
    }

    /**
     * Inspect a single link element and attach an interceptor listener if it
     * contains a query node.
     * @private
     * @param {HTMLElement} linkElement - The <a> or element with an href.
     * @returns {void}
     */
    #addHyperlinkInterceptorListener(linkElement) {
        if(!linkElement || !linkElement.href || linkElement.href.trim() == "" || linkElement.nhref)
        return

        // Only works for links with a colon in the pathname
        let url = new URL(linkElement.href)
        if(!url.pathname.includes(":"))
        return

        // Creating a new property to store the original href
        // "nhref" stands for "node href"
        // to preserve the original URL with query node
        linkElement.nhref = this.#interpreter.getQueryNodeString(linkElement.href)

        if(linkElement.nhref == "")
        return

        linkElement.href = this.#purgeHyperlinkQueryString(linkElement.href)

        // Modifying the cursor to indicate node availability
        linkElement.setAttribute("style", linkElement.getAttribute("style")+"; cursor: alias !important;")
        linkElement.setAttribute("npp-link", "");

        // Adding event listener to intercept clicks
        // and associated with the original URL (originalURL) with query node
        linkElement.addEventListener("click", (event) => this.#hyperlinkInterceptorEvent(event))
    }

    /**
     * Observe the document for newly added nodes so we can attach
     * hyperlink interceptors to dynamically inserted links.
     * @private
     * @returns {void}
     */
    #initChangeObserver() {
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
            this.#addHyperlinkInterceptorListener(node)

            const links = node.querySelectorAll("[href]")
            links.forEach((link) => this.#addHyperlinkInterceptorListener(link))
            }
        }
        })
        observer.observe(document.body,{childList:true,subtree:true})

    } 

    /**
     * Remove the query-node portion of a URL string (everything after the
     * last colon). Example: `https://x/a:gallery` -> `https://x/a`.
     * @private
     * @param {string} link - URL string to purge.
     * @returns {string} The purged URL (no query node) or original if none.
     */
    #purgeHyperlinkQueryString(link) {
        if(!link.includes(":"))
        return link

        const nodePosition = link.lastIndexOf(":")
        return link.slice(0,nodePosition)
    }

    /**
     * Intercepts hyperlink clicks for links that were previously modified to
     * preserve their node query. Prevents the default navigation and shows
     * the loader while querying NextPage for the node data.
     * @private
     * @param {MouseEvent} event - The click event fired on the link.
     * @returns {Promise<void>} Resolves when the flow completes (node set or error).
     */
    async #hyperlinkInterceptorEvent(event) {
        event.preventDefault()

        const url = new URL(event.target.href)

        this.#hide(this.#ui.loader.root)
        this.#hide(this.#ui.viewer.root)
        this.#show(this.#ui.loader.gif)

        let queryNodeString = event.target.nhref

        if(queryNodeString == "default" || queryNodeString == "")
        queryNodeString = null

        this.#ui.loader.label.innerText = url.host.replace("www.","")
        
        this.#show(this.#ui.loader.root)
        this.#isViewActive = true
        
        const nodeResult = await this.#interpreter.getNode(event.target.href,queryNodeString)
        
        if(nodeResult instanceof Error)
        {
            this.#ui.loader.label.innerText = "Network Error"
            this.#hide(this.#ui.loader.gif)
            return
        }

        this.setNode(url,nodeResult)
    }

    /**
     * Prevent clicks from bubbling from the provided element to the window.
     * @private
     * @param {HTMLElement} element
     * @returns {void}
     */
    #stopEventPropagation(element) {
        element.addEventListener("click",(event) => event.stopPropagation());
    }

    /**
     * Close the loader and mark the view as inactive.
     * @private
     * @returns {void}
     */
    #closeLoaderEvent() {
        this.reset()
        this.#isViewActive = false;
    }

    /**
     * Close the viewer and reset the UI.
     * @private
     * @returns {void}
     */
    #closeViewerEvent() {
        this.reset()
    }

    /**
     * Close the entire next-page window and disable pointer events.
     * @private
     * @returns {void}
     */
    #closeWindowEvent() {
        this.reset()
        this.#setWindowPointerEvent(false)

    }

    /**
     * Show a given element (remove hidden class).
     * @private
     * @param {HTMLElement} element
     * @returns {void}
     */
    #show(element) {
        element.classList.remove("hidden")
    }

    /**
     * Hide a given element (add hidden class).
     * @private
     * @param {HTMLElement} element
     * @returns {void}
     */
    #hide(element) {
        element.classList.add("hidden")
    }

    /**
     * Enable or disable window pointer events by toggling utility classes.
     * @private
     * @param {boolean} state - true to enable pointer events, false to disable
     * @returns {void}
     */
    #setWindowPointerEvent(state) {

        if(state)
        {
        this.#ui.window.root.classList.add("md:pointer-events-none")
        this.#ui.window.root.classList.remove("pointer-events-none")
        return
        }

        this.#ui.window.root.classList.remove("md:pointer-events-none")
        this.#ui.window.root.classList.add("pointer-events-none")
    }
    
    /**
     * Configure the viewer action button based on the node.
     * @private
     * @param {URL} url - The original URL object for the node.
     * @param {Object} node - The node object returned by NextPage.
     * @returns {void}
     */
    #setAction(url,node) {
        this.#ui.viewer.action.classList.remove("bg-green-600")
        this.#ui.viewer.action.classList.remove("bg-blue-500")

        if(!node.action)
        {
        this.#ui.viewer.action.classList.add("bg-blue-500")

        this.#ui.viewer.actionLabel.innerText = `Continue To: "${url.host.trim()}"`
        this.#ui.viewer.action.href = url.href
        return
        }

        this.#ui.viewer.action.classList.add("bg-green-600")

        this.#ui.viewer.actionLabel.innerText = node.action.label
        this.#ui.viewer.action.href = node.action.url
    }

    /**
     * Update secure/not-secure badges in the UI.
     * @private
     * @param {URL} url
     * @returns {void}
     */
    #setSecureBadge(url) {
        const isSecure = url.protocol === "https:"

        if(isSecure)
        {
        this.#show(this.#ui.viewer.secureBadgeTrue)
        this.#ui.viewer.secureLabel.innerText = "Secure"
        }

        else
        {
        this.#show(this.#ui.viewer.secureBadgeFalse)
        this.#ui.viewer.secureLabel.innerText = "Not Secure"
        }
    }

    /**
     * Populate the viewer with the provided node data and update UI state.
     * @param {URL} url - The source URL for the node.
     * @param {Object} node - The node object returned from NextPage.
     * @returns {void}
     */
    setNode(url, node) {
        if(this.#isViewActive == false)
        {
        this.#isViewActive = true
        return
        }

        this.#setWindowPointerEvent(true)

        if(!ViewTypesRegister[node.view])
        throw new ReferenceError("View <${node.view}> not valid")

        requestAnimationFrame(() => 
        {
            this.reset()

            ViewTypesRegister[node.view](node, this.#ui.viewer)
            this.#ui.viewer.site.innerText = url.host.replace("www.","")
        
            this.#setSecureBadge(url)
            this.#setAction(url,node)
            
            this.#hide(this.#ui.loader.root)
            this.#show(this.#ui.viewer.root)
        
        })
        
    }

    /**
     * Reset the viewer to its default hidden/loader state.
     * @returns {void}
     */
    reset() {
        this.#show(this.#ui.loader.gif)
        this.#hide(this.#ui.loader.root)
        this.#hide(this.#ui.viewer.root)
        this.#hide(this.#ui.viewer.secureBadgeFalse)
        this.#hide(this.#ui.viewer.secureBadgeTrue)
        this.#ui.viewer.content.innerHTML = ""
    } 

    
    
}