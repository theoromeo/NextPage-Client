import NextPage from "./lib/NextPage.0.8.0-beta.min.js"

/**
 * Interpreter wraps the NextPage library and provides small helpers
 * for parsing query node strings and fetching nodes by URL.
 */
export default class Interpreter {

    #nextPage = null

    constructor() {
        this.#nextPage = new NextPage()
    }

    /**
     * Extract the node name (query node) from a URL-like string.
     * For example: "https://example.com/page:gallery" -> "gallery".
     *
     * @param {string} url - The URL (or URL-like string) to parse.
     * @returns {string} The lower-cased, trimmed node name. Returns an
     * empty string if no colon is present or parsing fails.
     */
    getQueryNodeString(url) {
        const nodePosition = url.lastIndexOf(":")
        const nodeName = url.slice(nodePosition+1,url.length)

        return nodeName.trim().toLowerCase()
    }

    /**
     * Query the NextPage client for a node using an href and optional node name.
     *
     * @param {string} href - The full href to query (used by NextPage).
     * @param {string|null} nodeName - Optional node name to target (may be null).
     * @returns {Promise<object|Error>} Resolves with the node object on success,
     * or an Error instance on failure (the caller should check instanceof Error).
     */
    async getNode(href,nodeName) {
        return await this.#nextPage.queryWithURL(href,nodeName)
    }
}