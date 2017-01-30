# Bikesled
## Component-based documentation for any front-end resource

---

Inspired by Pattern Lab's atomic-design principles, Bikesled greases the runners to implementation for any bikeshed-able web component. It does this by generating documentation at the component level, whether those components are built with just HTML + CSS or with more complex JavaScript.

---

### Features:
+ simple static site generation for your documentation
+ annotations, template display, and data-mocking for each component
+ markdown-based annotation engine usable by non-developers
+ framework-agnostic components

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
+ Bikesled will output HTML, CSS, and JS files that contains all of your documentation. It's up to you how to serve that document.
+ Bikesled works with your project's pre-existing module structure! All you need to do is configure which modules to import, and Bikesled will use the resources available in your project to build your documentation.
+ Configure Bikesled with a `.bikesledrc.json` file in your working directory. Point to modules that already exist in your project, or point to a module directory filled with custom modules, annotations, and data.


#### CLI options:
+ If you'd like to use a `.bikesledrc.json` configuration file outside of your working directory, you can pass bikesled a path to your configuration file with `-c`:

    ```shell
bikesled build -c /path/to/.bikesledrc.json
    ```
+ To output the compiled files to a directory other than your working directory, use the `-o` option:

    ```shell
bikesled build -o /path/to/output/directory/
    ```
+ Working with a specific framework? Check out the Bikesled plug-ins for the following frameworks:
    + Backbone


#### Configuration:
The easiest way to configure Bikesled is to use a configuration file, named `.bikesledrc.json` by convention, but any JSON file should be acceptable with the `-c` command-line option.

An example configuration file would look like:

```json
{
    "output": "./docs",
    "title": "Bikesled Example Documentation",
    "components": {
        "main": "./components"
    },
    "stylesheet": "./styles/style.css",
    "inline": false
}
```
1. `output` points to an output directory for compiled HTML, CSS, and JS files
2. `title` sets the page title for your documentation page
3. `components` points to the different directories that contain components to be documented, bundled, and included in the final output.
    1. `main` refers to the default set of components, organized and named according to bikesled's custom component naming conventions (outlined above)
    2. You can assign a title to any other directory in your project, and all relevant pieces `import`-ed into each component will be bundled along with the rest of your components.
4. `stylesheet` is the path to your stylesheet. All Bikesled-specific components are carefully scoped so as not to interfere with your component styles.
5. `inline` is a boolean value. If set to `TRUE`, all styles and JS will be in-lined into a single output HTML document. Default behavior is `FALSE`, which means that Bikesled will output separate HTML, CSS, and JS files into a target directory (called `docs` by default).
