# Frontend

## Features
- Templating using Twig
- SCSS
- Purges extra CSS
- Cache busting for all static files
- Generates 2 versions of Javascript, 1 for modern ES6 browsers and another for legacy with the required polyfills
- Docker for local development (optional)
- Automatic staging/production deployment

## Development

### Requirements
- npm

### Setup
To get started clone this repository and copy the provided `.env.example` to `.env`, run `npm i` to install the frontend depndencies.

### SCSS
By default Bootstrap and a demo component is included. Override the default Bootstrap values in `variables\_bootstar-variables.scss`.

If you want to remove the preset Bootstrap simply remove the dependency (`popper.js` and `jquery` can also be removed with Bootstrap) from the `package.json`, remove the 2 imports in `app.scss` and the import in `app.js`.

By default the SCSS is not purged, to enable it, set `purgeCssOnBuild` to `true` in `gulpfile.js`. If you prefix the CSS classes used in javascript with `js-`, they will not be purged. You can manually add more classes to the whitelist or patterns in the `gulpfile.js` under the `purgecss` task.

TODO: Automate CriticalCSS

### Javascript
In the provided base template modern Javascript is included as a module. This means `use strict` is enabled by default. Legacy browsers ignore this and load the legacy build.

You can lint your javascript using `gulp lint` and fix the errors automatically using `gulp lint:fix`.

#### Recommended libraries
 - Library 1
 - Library 2

Make sure not to include libraries to save a couple of lines of code. We want to avoid bloat and avoid using Jquery as well if you are only using it for simple selectors etc.

TODO: Dynamic imports for javascript heavy apps

### Twig & Data
A base twig layout and some demo components are already set as an example. Make sure to reference all paths from the `src` directory (to ensure Timber compatibility): `{% include '/templates/components/jumbotron.twig' %}`.
Twig pages automatically load data from the `global.json` and each page loads extra data from `page-filename.twig.json`. Global data can be overwritten in the page data. Page data is optional.

All static must be loaded using the `manifest` function, as they will be automatically resolved from the `manifest.json`. This will ensure cache busting on changes.

Twig documentation: https://twig.symfony.com/doc/2.x/

### Build
For development run: `gulp`. Upon finishing building it will launch a local server for testing and will watch files for changes (with auto refresh via BrowserSync).

For deployment (without watch and local server) run: `gulp build`.

The environment can be set to production in the `.env`, by setting the `ENV` value to `production`. When set to production, css and js will be compressed. Make sure to test the production build before deployment.



# Backend Wordpress/Bedrock

Bedrock is a modern WordPress stack that helps you get started with the best development tools and project structure. Read more here: https://github.com/roots/bedrock, https://roots.io/bedrock/.

The `wp` directory is not version controlled so make sure to make no changes.

## Development

### Requirements
- Docker CE

or

- PHP >= 7.1
- MySQL
- composer - https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx

All requirements are met when using the local Docker environment. To setup Docker CE on your system, follow the guides https://docs.docker.com/install/.

### Setup
If not already, copy the `.env.example` to `.env`. If you are using the preset docker environment set the .env values to:
```
DB_NAME=app
DB_HOST=mysql:3306
DB_USER=root
DB_PASSWORD=password
```

Rename the theme folder (if wanted/needed), and also set the same folder name in the `.env`, `SITE_NAME` variable. Gulp and composer settings will use this variable.

Set the theme name in `style.css` in the theme folder.

## Development (for Docker)
Bind 127.0.0.1 to `SITE_NAME`.local (defaults to default.local) in your /etc/hosts or hosts file.

In order to start the docker containers run (on the first la):
`docker-compose up -d`

You can now browse to `http://docker.local`.

To rebuild the containers use:
`docker-compose up -d --force-recreate --build`

You can run commands in the container by prefixing them with `docker-compose run`, for example:
`docker-compose run composer update`

List containers:
`docker ps`

Stop
`docker-compose stop`

Stop & Remove
`docker-compose down`

### Composer install
Windows
`docker run  --rm -v "%cd%":/app composer install`

MacOS/Linux
`docker run  --rm -v $PWD:/app composer install`

## Theme
By default the theme has some boilerplate to get you going faster. Feel free to remove the extra features. Make sure to check https://timber.github.io/docs/ for extra information regarding Timber.

## Plugins
Some plugins are already included:
 - Timber (required)
 - Yoast SEO
 - W3 Total Cache
 - Disable Emojis

Installing new plugins is done via composer. They are added via https://wpackagist.org/ composer repository.

`composer require wpackagist-plugin/wordpress-seo`

### ACF Plugin installation
To install ACF Pro, you must provide a valid key in the `.env` file and run this composer command: `composer require advanced-custom-fields/advanced-custom-fields-pro`.

### How to install custom/private plugins
Custom plugins are also installed via composer, but it requires some additional steps. The plugin must be in a separate git repository. First add the repository in the composer.json:
```
{
  …
  "repositories": [
    …
    {
      "type": "vcs",
      "url": "git@bitbucket.org:reponame/gigya-form-plugin.git"
    },
    …
  ],
}
```

After that you can add the plugin using composer require: `composer require reponame/gigya-form-plugin`.

Make sure the plugin has a `composer.json` setup correctly.

### Recommended plugins
 - Plugin 1
 - Plugin 2

## Updating Wordpress & Plugins
Wordpress and plugin updates are also done via composer. To update the Wordpress version, change the version on the `composer.json` file and run `composer update`.
