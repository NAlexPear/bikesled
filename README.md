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


### Usage:
+ Bikesled is available as an npm module, and can be installed as a dependency for your project with:

    ```shell
    npm install bikesled
    ```
+ Bikesled is run as a command-line utility. Compile your documentation with:

    ```shell
    bikesled build
    ```
+ Bikesled will output an HTML document that contains all of your documentation. It's up to you how to serve that document.
+ Bikesled works with your project's pre-existing module structure! All you need to do is configure which modules to import, and Bikesled will use the resources available in your project to build your documentation.
+ Configure Bikesled with a `.bikesledrc` file in your project's root directory. Point to modules that already exist in your project, or point to a module directory filled with custom modules, annotations, and data.
+ Working with a specific framework? Check out the Bikesled plug-ins for the following frameworks:
    + Backbone
