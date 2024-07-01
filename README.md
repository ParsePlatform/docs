# Parse Docs

[![Join The Conversation](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/parse-server)
[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)][open-collective-link]
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)][open-collective-link]
[![License][license-svg]][license-link]
[![Twitter Follow](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow%20us%20on%20Twitter&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)


These are the markdown sources for all of the [Parse SDK guides](https://parse-community.github.io/#sdks). The content for the guides is stored in this repo, and we use Jekyll to generate a static site that is hosted on GitHub Pages.

## Repository Structure

The guides are organized by platform inside the _includes directory. Each platform directory contains a set of markdown files, one for each main section in the guide.

    .
    └── _includes
        ├── {platform}
        │   └── {section}
        └── common
            └── {section}

For example, `/_includes/ios/` contains all of sections for the iOS guide. There is also a `/_includes/common` folder that contains content that is shared amongst all of the guides. It helps us avoid duplicating content unnecessarily.

## Can I Access The Docs Offline?

This repository is public and all the files are in markdown. If you'd like to keep a copy locally, please do!

## How Do I Contribute?

If you have any fixes or suggestions, simply send us a pull request!

### Running The Site Locally

You will need [Ruby](https://www.ruby-lang.org/en/documentation/installation/), [Bundler](http://bundler.io/), and [npm](https://www.npmjs.com/get-npm).

Clone this repository, then install Jekyll and node packages:

```
bundle install
npm install
```

Then run webpack and Jekyll:

Start in Linux/OS X:
```
npm start
```

Start in Windows command prompt:
```
npm run dev-win
```

Finally, open http://localhost:4000/ in your web browser.
File changes will be output to `_site` folder and the browser will auto refresh.

-----

As of April 5, 2017, Parse, LLC has transferred this code to the parse-community organization, and will no longer be contributing to or distributing this code.

[license-svg]: https://img.shields.io/badge/license-BSD-lightgrey.svg
[license-link]: LICENSE
[open-collective-link]: https://opencollective.com/parse-server
