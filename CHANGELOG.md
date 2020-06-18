# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [1.1.4] - 2020-06-18
### Added
* Add "functions-dir" input to deploy Netlify Functions [#191](https://github.com/nwtgck/actions-netlify/pull/191) by [@fmr](https://github.com/fmr)

## [1.1.3] - 2020-06-13
### Added
* Add "production-deploy" input to deploy as Netlify production deploy [#188](https://github.com/nwtgck/actions-netlify/pull/188) by [@gvdp](https://github.com/gvdp)

## [1.1.2] - 2020-06-13
### Added
* Add "alias" input to deploy with alias [#178](https://github.com/nwtgck/actions-netlify/pull/178) by [@rajington](https://github.com/rajington)

## [1.1.1] - 2020-05-30
### Added
* Add "netlify-config-path" input to specify path to `netlify.toml`
* Support GitHub Deployments

### Changed
* Update dependencies

## [1.1.0] - 2020-05-10
### Added
* Add "overwrites-pull-request-comment" input

### Changed
* Overwrite comment on pull request by default
  - You can use `overwrites-pull-request-comment: false` not to overwrite
* Update dependencies

## [1.0.13] - 2020-05-09
### Changed
* Update dependencies

### Added
* Add "enable-pull-request-comment" input
* Add "enable-commit-comment" input

## [1.0.12] - 2020-04-07
### Changed
* Update dependencies

## [1.0.11] - 2020-04-06
### Changed
* Update dependencies

## [1.0.10] - 2020-04-03
### Changed
* Update dependencies

## [1.0.9] - 2020-04-01
### Changed
* Update dependencies

## [1.0.8] - 2020-03-30
### Changed
* Update dependencies

## [1.0.7] - 2020-03-29
### Changed
* Update dependencies

## [1.0.6] - 2020-03-17
### Changed
* Update dependencies

### Added
* Add `deploy-url` output [#48](https://github.com/nwtgck/actions-netlify/pull/48) by [@kentaro-m](https://github.com/kentaro-m)

## [1.0.5] - 2020-03-03
### Added
* Add `deploy-message` input [#40](https://github.com/nwtgck/actions-netlify/pull/40) by [@South-Paw](https://github.com/South-Paw)

## [1.0.4] - 2020-03-02
### Changed
* Update dependencies

## [1.0.3] - 2020-02-28
### Changed
* Do not error out when no credentials are provided [#33](https://github.com/nwtgck/actions-netlify/pull/33) by [@tiangolo](https://github.com/tiangolo)
* Comment Netlify deploy URL on commit

## [1.0.2] - 2020-02-26
### Changed
* Update dependencies

## [1.0.1] - 2020-02-22
### Changed
* Update dependencies
* Improve files by dependency updates

## [1.0.0] - 2020-02-08
### Changed
* Update dependencies

## [0.2.0] - 2020-02-05
### Added
* Add `production-branch` input

### Changed
* Make `github-token` input optional

## [0.1.1] - 2020-02-04
### Changed
* Print deploy URL

## 0.1.0 - 2020-02-04
### Added
* Deploy to Netlify
* Comment on GitHub PR

[Unreleased]: https://github.com/nwtgck/actions-netlify/compare/v1.1.4...HEAD
[1.1.4]: https://github.com/nwtgck/actions-netlify/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/nwtgck/actions-netlify/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/nwtgck/actions-netlify/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/nwtgck/actions-netlify/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nwtgck/actions-netlify/compare/v1.0.13...v1.1.0
[1.0.13]: https://github.com/nwtgck/actions-netlify/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/nwtgck/actions-netlify/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/nwtgck/actions-netlify/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/nwtgck/actions-netlify/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/nwtgck/actions-netlify/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/nwtgck/actions-netlify/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/nwtgck/actions-netlify/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/nwtgck/actions-netlify/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/nwtgck/actions-netlify/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/nwtgck/actions-netlify/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/nwtgck/actions-netlify/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/nwtgck/actions-netlify/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nwtgck/actions-netlify/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nwtgck/actions-netlify/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/nwtgck/actions-netlify/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/nwtgck/actions-netlify/compare/v0.1.0...v0.1.1
