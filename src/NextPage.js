const c = {
  title: 65,
  desc: 90,
  article: 200,
  action: 30,
  img: 4
};
class a extends Error {
  constructor(i, e) {
    super(e), this.code = i;
  }
}
const p = {
  /**
   * returns field defined explicitly & implicitly.
   * @param {Element} nodeElement 
   * @param {string} field 
   * @returns {string|null}
   */
  asProperty: function(l, i) {
    let e = null;
    const t = l.querySelector(`[np-${i}]`);
    if (!t)
      return null;
    const r = t.getAttribute(`np-${i}`);
    return r && r.trim() != "" && (e = r), e || (e = t.innerText), !e || e.trim() == "" ? null : e;
  },
  /**
   * Returns field defined in fallback/ meta tag defined.
   * @param {Document} DOM 
   * @param {string} field 
   * @returns {string|null}
   */
  asFallback: function(l, i) {
    var t, r;
    const e = (r = (t = l.querySelector("head")) == null ? void 0 : t.querySelector(`meta[name='np:${i}']`)) == null ? void 0 : r.content;
    return !e || e.trim() == "" ? null : e;
  },
  /**
   * 
   * @param {Document} DOM 
   * @param {Element} nodeElement Element to query.
   * @param {number} queryMode "0": query property and fallback, "1": query only property, "2": query only fallback
   * @returns {string|NPError}
   */
  title: function(l, i, e = 0) {
    let t = null;
    if (e != 2) {
      const r = this.asProperty(i, "title");
      r && r.trim() != "" && (t = r);
    }
    if (e != 1 && t == null) {
      const r = this.asFallback(l, "title");
      r && r.trim() !== "" && (t = r);
    }
    return t ? t.substring(0, c.title) : new a(2.1, `"title" field not found with query mode <${e}>`);
  },
  /**
   * 
   * @param {Document} DOM 
   * @param {Element} nodeElement 
   * @param {number} queryMode "0": query property and fallback, "1": query only property, "2": query only fallback
   * @returns {string|NPError}
   */
  desc: function(l, i, e = 0) {
    let t = null;
    if (e != 2) {
      const r = this.asProperty(i, "desc");
      r && r.trim() != "" && (t = r);
    }
    if (e != 1 && t == null) {
      const r = this.asFallback(l, "desc");
      r && r.trim() !== "" && (t = r);
    }
    return t ? t.substring(0, c.desc) : new a(2.2, `"desc" field not found with query mode <${e}>`);
  },
  /**
   * 
   * @param {Document} DOM 
   * @param {Element} nodeElement 
   * @param {number} queryMode "0": query property and fallback, "1": query only property, "2": query only fallback
   * @returns {string|null}
   */
  article: function(l, i, e = 0) {
    let t = null;
    if (e != 2) {
      const r = this.asProperty(i, "article");
      r && r.trim() != "" && (t = r);
    }
    if (e != 1 && t == null) {
      const r = this.asFallback(l, "article");
      r && r.trim() !== "" && (t = r);
    }
    return t ? t.substring(0, c.article) : null;
  },
  /**
   * @param {Document} DOM 
   * @param {Element} node 
   * @param {Number} queryMode "0": query property and fallback, "1": query only property, "2": query only fallback
   * @returns {Array|null}
   */
  img: function(l, i, e = 0) {
    let t = [];
    if (e != 2) {
      const r = i.querySelectorAll("[np-img]");
      r && r.length > 0 && (t = this.parseImgs(r, c.img));
    }
    if (e != 1 && t.length == 0) {
      const r = this.asFallback(l, "img");
      if (!r)
        return null;
      t = r.split(",", c.img);
    }
    return t.length == 0 ? null : t.slice(0, c.img);
  },
  parseImgs: function(l, i) {
    let e = [];
    return l.forEach((t) => {
      if (e.length >= i)
        return;
      const r = t.getAttribute("np-img");
      if (r && r.trim() != "") {
        e.push(r);
        return;
      }
      const n = t.src;
      n && n.trim() != "" && e.push(n);
    }), e;
  },
  /**
   * @param {Document} DOM 
   * @param {Element} nodeElement 
   * @param {Number} queryMode 
   * @returns {Array|null}
   */
  action: function(l, i, e = 0) {
    let t = null;
    if (e != 2) {
      const n = i.querySelector("[np-action]");
      if (n) {
        const s = n.getAttribute("np-action");
        if (s)
          t = s;
        else {
          const u = n.innerText, f = n.href;
          u && u.trim() != "" && f && f.trim() != "" && (t = u + ">" + f);
        }
      }
    }
    if (e != 1 && t == null) {
      const n = this.asFallback(l, "action");
      n && (t = n);
    }
    if (!t || !t.includes(">"))
      return null;
    const r = t.split(">");
    return r[0].trim() != "" && r[1].trim() != "" ? [r[0].substring(0, c.action), r[1]] : null;
  }
}, m = {
  title: !0,
  desc: !0,
  action: !1
}, o = {
  basic: m,
  article: {
    ...m,
    article: !0
  },
  gallery: {
    ...m,
    img: !0
  }
};
class h {
  /**
   * @param {string} html Webpage html string to query on 
   * @param {string} nodeName Node to query
   * @returns {JSON|NPError}
   */
  queryWithHtml(i, e = null) {
    try {
      if (i && i.trim() == "")
        throw new a(0.1, "Empty string passed to <html> parameter");
      const t = this.toDom(i);
      if (e == null || e.trim() == "")
        return this.getDefaultNode(t);
      let r = this.getNodeElement(t, e);
      if (r || (r = this.getFallbackNodeElement(t, e)), !r)
        return this.getDefaultNode(t);
      const n = this.preparedNodeElement(r);
      let s = this.getViewType(n);
      return s || (s = "basic"), this.getProperties(t, n, s);
    } catch (t) {
      return t;
    }
  }
  /**
   * @param {string} url Webpage to query on
   * @param {string} nodeName Node to query
   * @returns {JSON|NPError}
   */
  async queryWithUrl(i, e = null) {
    if (!this.isValidURL(i))
      return new a(0.2, `URL parameter w/ value <${i}> not valid`);
    let t = await this.getPage(i);
    return t instanceof a ? t : this.queryWithHtml(t, e);
  }
  /**
   * Return webpage html
   * @param {URL} url Webpage to query
   * @returns {string|NPError}
   */
  async getPage(i) {
    try {
      const e = await fetch(i);
      if (!e.ok)
        throw new a(3.2, `Webpage could not be retrieved, status: ${e.status}`);
      return await e.text();
    } catch {
      return new a(3.1, `Failed to fetch <${i}>`);
    }
  }
  /**
   * 
   * @param {string} url webpage url
   * @returns {boolean}
   */
  isValidURL(i) {
    return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/[^\s]*)?$/i.test(i);
  }
  /**
   * 
   * @param {Document} DOM 
   * @param {Element} nodeElement 
   * @param {string} view 
   * @returns {JSON}
   */
  getProperties(i, e, t) {
    const r = o[t];
    let n = {};
    for (const s in r) {
      const u = p[s](i, e, 0);
      if (u instanceof a)
        throw u;
      u && (n[s] = u);
    }
    return n.view = t, n;
  }
  /**
   * Return view type defined in element.
   * @param {Element} nodeElement 
   * @returns {string|null}
   */
  getViewType(i) {
    var t;
    const e = (t = i.querySelector("[np-type]")) == null ? void 0 : t.getAttribute("np-type");
    return !e || !this.isValidViewType(e) ? this.getImplicitViewType(i) : e;
  }
  /**
   * Return view type (implicitly) by checking node elements fields 
   * @param {Element} nodeElement 
   * @returns {string|null}
   */
  getImplicitViewType(i) {
    let e = null;
    for (let t in o) {
      let r = !0;
      for (const n in o[t]) {
        if (o[t][n] == !1)
          continue;
        if (i.querySelectorAll(`[np-${n}]`).length == 0) {
          r = !1;
          break;
        }
      }
      r && (e = t);
    }
    return e;
  }
  /**
   * Return element without node defined children.
   * @param {Element} nodeElement 
   * @returns {Element}
   */
  preparedNodeElement(i) {
    i.querySelectorAll("[np-node]").forEach((t) => {
      t.remove();
    });
    let e = document.createElement("div");
    return e.innerHTML = i.outerHTML, e;
  }
  /**
   * return next available node defined element.
   * @param {Document} DOM 
   * @param {string} nodeName 
   * @returns {Element|null}
   */
  getFallbackNodeElement(i, e) {
    let t = null;
    if (e != null && e.toLowerCase != "primary" && (t = this.getNodeElement(i, "primary")), t)
      return t;
  }
  /**
   * Return node defined element.
   * @param {Document} DOM 
   * @param {string} nodeName 
   * @returns {Element|null}
   */
  getNodeElement(i, e) {
    const t = i.querySelector(`[np-node="${e}"]`);
    return t || null;
  }
  /**
   * Return node defined by fallback fields.
   * @param {Document} DOM 
   * @returns {JSON}
   * @throws {NPError}
   */
  getDefaultNode(i) {
    if (!i.querySelector("head"))
      throw new a(1.2, "Document does not contain a <head> tag");
    let e = p.asFallback(i, "view");
    o[e] || (e = "basic");
    const t = this.getFallbackFields(i, e, 2);
    if (t instanceof a)
      throw t;
    return t;
  }
  /**
   * Return JSON w/ all valid fields
   * @param {Document} DOM 
   * @param {string} view 
   * @param {number} queryMode "0": query property and fallback, "1": query only property, "2": query only fallback
   * @returns {JSON|NPError}
   */
  getFallbackFields(i, e, t = 0) {
    let r = {};
    if (!o[e])
      return null;
    for (let n in o[e]) {
      let s = p[n](i, null, t);
      if (s instanceof a)
        return s;
      s && (r[n] = s);
    }
    return r;
  }
  /**
   * Convert html to document object.
   * @param {html} html 
   * @returns {Document}
   * @throws {NPError}
   */
  toDom(i) {
    const e = new DOMParser().parseFromString(i, "text/html");
    if (e.documentElement.nodeName === "parsererror")
      throw new a(1.1, "HTML could not be parsed");
    return e;
  }
}
export {
  h as default
};
