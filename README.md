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
+ Bikesled follows the [Universal Module Definition specification](https://github.com/umdjs/umd). This means that you can `import`, `require`, or directly link Bikesled into your documentation page.
+ Bikesled will create your documentation as a single-page application with the following commands:

    ```
    var bikesled = new Bikesled();

    bikesled.render();
    ```
