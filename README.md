# Bikesled
## Component-based documentation for any front-end resource

[![npm version](https://badge.fury.io/js/bikesled.svg)](https://badge.fury.io/js/bikesled)
[![npm](https://img.shields.io/npm/l/express.svg)](https://www.npmjs.com/package/bikesled)

---

Inspired by Pattern Lab's atomic design principles, Bikesled greases the runners of documentation for any [bikeshed](http://bikeshed.com/)-able web component. It does this by generating documentation at the component level, whether those components are built with simple HTML + CSS, with standard JavaScript constructors, or with more complex JavaScript frameworks.

---

### Features:
+ simple static site generation for your documentation
+ annotations, template display, and data-mocking for each component
+ markdown-based annotation engine usable by non-developers
+ framework-agnostic components/custom component renderers

---

### Usage:
+ Bikesled is available as an npm module, and can be installed as a dependency for your project with:

```shell
npm install -g bikesled
```
+ Bikesled is run as a command-line utility. Compile your documentation with:

```shell
bikesled build
```
+ Bikesled will output a directory (by default) that contains separate HTML, CSS, and JS files that document the configured components. What you do with that directory is up to you.
+ Bikesled works with your project's pre-existing ES6 module structure! All you need to do is configure which modules to `import`, and Bikesled will use the resources available in your project to build your documentation.
+ Configure Bikesled with a `.bikesledrc` file in your target directory. Point to modules that already exist in your project, or point to a module directory filled with custom modules, annotations, and data.
+ Bikesled groups your components according to their file names, so be sure to follow these conventions when creating, annotating, and mocking data for your components:
    1. Make sure that all components across directories have unique names.
    2. Use kebab-case for all resources (e.g. `my-first-basic-component.js`).
    3. All component files have either `.html` or `.js` file extensions.
    4. All annotations have markdown (`.md`) file extensions.
    5. All data files have `.json` file extensions.
    6. Group all related files automatically by giving related component files the same name (e.g. `my-first-basic-component.js`, `my-first-basic-component.json`, and `my-first-basic-component.md`).
    7. The exception to the previous rule: your annotation files (`*.md`) may be numbered. If they are numbered, each file will be parsed in turn and presented as a list item in the final documentation. For example, if `001-hello.md` contained `Hello`, and `002-hello.md` contained `World`, the output would be:

        ```
        1. Hello
        2. World
        ```


#### CLI options:
+ If you'd like to use a `.bikesledrc` configuration file outside of your working directory, you can pass Bikesled a path to your configuration file with `-c`:

```shell
bikesled build -c /path/to/.bikesledrc.json
```
+ To output the compiled files to a target directory other than your working directory, use the `-t` option:

```shell
bikesled build -t /path/to/output/directory/
```


#### Configuration:
The easiest way to configure Bikesled is to use a configuration file, named `.bikesledrc` by convention, but any `JSON` file should be acceptable with the `-c` command-line option.

An example configuration file might look like so:

```json
{
    "output": "./docs",
    "title": "Bikesled Example Documentation",
    "components": {
        "main": "./components"
    },
    "ignore": [ "\/test\\." ],
    "loaders": [
        {
            "test": "some-jquery-plugin",
            "loader": "imports-loader?jQuery=jquery,$=jquery"
        }
    ],
    "resolve": {
        "alias": {
            "vw": "../../../src/content/templates/views",
            "translations": "../../../src/content/translations",
            "config": "../../../src/content/config"
        },
    },
    "renderers": [
        {
            "test": "backbone",
            "src": "./renderers/backbone-view.js"
        },
        {
            "test": "\\.js$",
            "src": "./renderers/example-constructor.js"
        }
    ],
    "scripts": [ "./scripts/site.js" ],
    "stylesheets": [ "./styles/style.css" ],
    "bikesledStyles": true,
    "mockRequests": true,
    "inline": false
}
```
1. `output` points to an output directory for compiled HTML, CSS, and JS files. DEFAULT: `./docs`
2. `title` sets the page title for your documentation page. DEFAULT: `Bikesled Example Documentation`
3. `components` points to the different directories that contain components to be documented, bundled, and included in the final output.
    1. `main` refers to the default set of components, organized and named according to Bikesled's custom component naming conventions (outlined above)
    2. You can assign a title to any other directory in your project, and all relevant pieces `import`-ed into each component will be bundled along with the rest of your components.
4. `ignore` is an array of regular expressions. If one of those regular expressions matches a file path in your `components` directory, that file will not be included in the final style guide. The example above is used to exclude any file prefixed with `test.` (very useful for testing with `mocha`).
5. `loaders` are webpack loaders. `html` and `json` loaders are included (and required!) by default, but you may set up any custom loader schemes that you would like for final compilation.
6. `renderers` are standard, `require`-able node modules that return strings that are bootstrapped into the final, bundled JavaScript file contained in your output directory. All renderers are passed the `id` reserved for a particular component as well as any data imported from associated `JSON` files. By default, all `.js` files use a renderer that looks something like this:
```javascript
    var camelCase = require( "lodash/fp/camelCase" );

    function DefaultRenderer( id, data ){
        return `document.getElementById( "${id}" ).innerHTML= ${camelCase( id )}( ${data} );`;
    }

    module.exports = DefaultRenderer;
```
    You can connect your own renderers through the `renderers` configuration option by providing a regex `test` string and a `src` path to your renderer. The regex is applied to the file path of the component's `.js` file, and the __first__ regex that passes will govern which renderer is applied to the component. If no regex applies to the file path in question, then the renderer will fall back to the default.
7. `resolve` is a standard webpack `resolve` configuration object. In this case, `alias` is used to map `import`-able modules from across an application.
8. `scripts` is an array of paths leading to any global `js` files that need to be included in the `<head>` of your style guide. This is useful for things like global variables or configuration objects that need to be present for your `import`-ed components to render properly.
9. `stylesheets` is an array of paths to any stylesheets you would like to include in your compiled guide. All Bikesled-specific components are carefully scoped so as not to interfere with your component styles, but you're free to override Bikesled styles as you see fit.
10. `bikesledStyles` toggles Bikesled-specific `js` and `css`. Disable this if you're inclined to create your own Bikesled wrapper (with `scripts` and `stylesheets`) or if you're looking for clean testing environment.
11. `mockRequests` toggles a `Sinon` server at `window.bikesled.server` that can be used to respond to any `AJAX` requests from your components. While this is a fantastic feature for testing and demo purposes, it comes with a performance cost. If none of your components depend on mocked `AJAX` requests, be sure to set `mockRequests` to `false`!
12. `inline` is a boolean value. If set to `TRUE`, all styles and JS will be in-lined into a single output HTML document. Default behavior is `FALSE`, which means that Bikesled will output separate HTML, CSS, and JS files into a target directory (called `docs` by default).

---

### Contributing

All contributions are welcome, provided that the style rules configured in the attached `.eslintrc` are followed. The full source and example code can be found in [Bikesled's GitHub repository](https://github.com/NAlexPear/bikesled).
