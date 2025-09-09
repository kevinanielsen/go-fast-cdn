---
title: Contributing
description: How to help develop the go-fast-cdn.
---

## Go-fast CDN

You can access the source code on [Github](https://github.com/kevinanielsen/go-fast-cdn/), where everyone is encouraged to help in any way they can to make this project better. While you might not be able to contribute to the features of this project, you can still contribute by writing tests, fixing bugs or even fixing typos.

If that is not possible, you can still help by contributing to the [Documentation](#documentation). Even just leaving a star or sharing the project is a great way to contribute.

If you want to report a bug or request a feature, you can go ahead and create a new issue on GitHub, where a template is laid out, and encouraged to be used. If you want to fix a bug or implement a new feature, go ahead and open a pull request with your suggestion.

Please read the [Development Guide](/go-fast-cdn/contribution/development) to learn more about how to develop on this project.

### Commits

This project follows the [@commitlint convention](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) and we ask that you please do the same as much as possible. The most important thing is to add a commit-type which should be one of the following:

- **build** - changes regarding the build
- **chore** - changes not covered by other types
- **ci** - changes regarding CI/CD
- **docs** - changes regarding docs
- **feat** - new features
- **fix** - bug fixes
- **perf** - changes enhancing performance
- **refactor** - refactoring code
- **revert** - reverting to earlier commits
- **style** - changes regarding style
- **test** - changes regarding testing

An example of a commit message following this convention could be

```txt
docs: add commit-convention to contribution guide
```

To further specify what your commit is changing, you can add a scope with parentheses, like this:

```txt
feat(api): add endpoint for file uploads
```

## Documentation

[Github](https://github.com/kevinanielsen/go-fast-cdn/) Is a monorepo, where the documentation can be found in the /docs directory. If you want to request documentation for a feature, go ahead and create a new issue on Github, if you have the solution for an issue or want to edit the documentation, go ahead and fork the project, and when you are ready, open a new pull request.
