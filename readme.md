# NextPage-Client
![Version](https://img.shields.io/badge/version-0.5.0--beta-yellow)

The NextPage Client provides an interface for users to interact with NextPage-enabled pages.

To learn more about defining NextPage pages, visit [The NextPage Docs](https://github.com/theoromeo/NextPage-Parser).

This document explains how to install the client and query NextPage-enabled pages.

## Installing the Client

To install the client on your webpage, add the minified file located in `./build` to the `<head>` section of your HTML document.

```html
<head>
    ...
    <script src="./path/to/nextpage.min.js"></script>
</head>
```

That's it—no configuration is needed. The client will handle everything for you.

## Querying a Node
To query a node you will need to add the url of a NextPage-enabled webpage appended with `":"` and the `node name`  as follows
```html
<a href="https://example.com/info/about-the-information:primary">Visit the page...</a>
```

The NextPage-Client intercepts all `href/a (anchor) `interactions where the `URL path string contains ":".`

> URLs containing `":"` are invalid in standard urls, making it a great choice to use as an operator for querying.

The NextPage-Client will then fetch the NextPage-enabled webpage and attempt to retrieve the node named `"primary"` and will parse and display the node through its interface.

## Running the Examples

To run the examples, you will need to set up a local hostname. In the `vite.config.js`, this is set to `localhost.local`. NextPage-Parser validates a URL before fetching the webpage and does not recognize IP based addresses as valid urls.

For guidance on setting up a hostname:
- [Setting up a hostname for Mac](https://kinsta.com/knowledgebase/edit-mac-hosts-file/)
- [Setting up a hostname for Windows](https://docs.rackspace.com/docs/modify-your-hosts-file)

Use the following information:
- **IP Address**: `127.0.0.1`
- **Domain**: `localhost.local`

After setting up your local hostname, run the following command:

```bash
npm run dev
```

Then, navigate to `http://localhost.local/examples/index.html`. You can click on the links to see how different view types are displayed and how they are defined in various HTML files.



## Building
Simply use the Vite commands to build the client. The output will be in the `./build` directory.

This will bundle and minify the client script along with the HTML templates that define the UI (found in ./src/template).

```bash
# Build the client
vite build

# Start development server
vite dev
```
