# Changelog

## [0.4.1](https://github.com/thislooksfun/reduce-page/compare/reduce-page-v0.4.0...reduce-page-v0.4.1) (2025-08-22)


### Bug Fixes

* publish with provenance ([2407a7c](https://github.com/thislooksfun/reduce-page/commit/2407a7c67eeabc8f87c2a72de6d3390c16b8ee13))

## [0.4.0](https://github.com/thislooksfun/reduce-page/compare/reduce-page-v0.3.0...reduce-page-v0.4.0) (2025-08-22)


### ⚠ BREAKING CHANGES

* drop support for node 18

### Features

* add a class removal stage ([3d10a20](https://github.com/thislooksfun/reduce-page/commit/3d10a205948bab08441f709dacae1961c73745e0))
* add a css bisection stage ([37adb97](https://github.com/thislooksfun/reduce-page/commit/37adb97146b73783e466cc2ac4b61ec14177db79))
* add an attribute removal stage ([7af8c2f](https://github.com/thislooksfun/reduce-page/commit/7af8c2fea8fc72daff7d77fa5547d27267510bcc))
* drop support for node 18 ([08f0f00](https://github.com/thislooksfun/reduce-page/commit/08f0f007a92b7115337fd335a9d5ead0e5e3bb14))


### Bug Fixes

* **deps:** update all non-major dependencies ([6d95033](https://github.com/thislooksfun/reduce-page/commit/6d95033e5528d6f99ed1eeae719f3070689ea331))
* **deps:** update all non-major dependencies ([5102683](https://github.com/thislooksfun/reduce-page/commit/5102683a8007d83386fe91778995d5d4d00a35dc))
* **deps:** update dependency chalk to v5.6.0 ([7c65fd7](https://github.com/thislooksfun/reduce-page/commit/7c65fd72ed0509e52d89e140b0fa3958595e2aa0))
* **deps:** update dependency chalk to v5.6.0 ([c2ee548](https://github.com/thislooksfun/reduce-page/commit/c2ee548fd1a922f715a72629cfa196ab3af54282))
* **deps:** update dependency express to v4.20.0 [security] ([330bcab](https://github.com/thislooksfun/reduce-page/commit/330bcabbb3284ecd06b0574f42d7da22673002a4))
* **deps:** update dependency express to v4.20.0 [security] ([62de252](https://github.com/thislooksfun/reduce-page/commit/62de25200921c16e12f33da7b43f30d0da1ffd42))
* **deps:** update dependency express to v4.21.2 ([649e7d0](https://github.com/thislooksfun/reduce-page/commit/649e7d02c34347088263b7f9d941d71466e30cbe))
* **deps:** update dependency express to v4.21.2 ([2ce19cc](https://github.com/thislooksfun/reduce-page/commit/2ce19cce70ca236a601690a9cb011ef6c751d5cc))
* **deps:** update dependency express to v5 ([49e429a](https://github.com/thislooksfun/reduce-page/commit/49e429a0bb7db3c54b904705f1e37f2bb25354b9))
* **deps:** update dependency express to v5 ([c7127d6](https://github.com/thislooksfun/reduce-page/commit/c7127d61539a8e93d350f54cb56684e33e95c071))
* **deps:** update dependency parse5 to v8 ([06b0de5](https://github.com/thislooksfun/reduce-page/commit/06b0de5b367721aaf0caa63785e14e6503ece72d))
* **deps:** update dependency parse5 to v8 ([36c2ca6](https://github.com/thislooksfun/reduce-page/commit/36c2ca6525c2345a1b74bc544728b854c6d5bb3b))
* **deps:** update dependency purgecss to v7 ([6d6f4d4](https://github.com/thislooksfun/reduce-page/commit/6d6f4d428855418aee485237ebbecf1f18661134))
* **deps:** update dependency purgecss to v7 ([f1e0b6d](https://github.com/thislooksfun/reduce-page/commit/f1e0b6d36f3fadc0b554bd24df136244c66543d5))
* specify node version range in package.json ([056f1f8](https://github.com/thislooksfun/reduce-page/commit/056f1f884e2f41de68b683dbf50fff6d1235f4d1))

## [0.3.0](https://github.com/thislooksfun/reduce-page/compare/v0.2.0...v0.3.0) (2023-06-03)


### Features

* make 'h' also print help ([9a4dbb9](https://github.com/thislooksfun/reduce-page/commit/9a4dbb9469633554bb91606eb82844bf79f1e45d))
* print help prompt after unsupported command error ([5b2862d](https://github.com/thislooksfun/reduce-page/commit/5b2862d755fe4ba176604a0295585b255ca22a09))


### Bug Fixes

* allow redoing undone single shot stages ([c3e4b9b](https://github.com/thislooksfun/reduce-page/commit/c3e4b9bbb94e10d5ad92c6614e15432e02e2ce1c))
* don't crash if body is empty when re-parenting ([afbd92b](https://github.com/thislooksfun/reduce-page/commit/afbd92b55c9241224751da7cb2c24a54afdefd53))
* properly compute the parent node ([a15e16d](https://github.com/thislooksfun/reduce-page/commit/a15e16d847ed99b5d783c0db3fb81df855d82b91))

## [0.2.0](https://github.com/thislooksfun/reduce-page/compare/v0.1.0...v0.2.0) (2023-06-03)


### Features

* add a re-parenting stage ([b0d1ef0](https://github.com/thislooksfun/reduce-page/commit/b0d1ef00ac09e0ddb88954889bf48954082fa941))
* display stage title when running reduction ([8c4fb57](https://github.com/thislooksfun/reduce-page/commit/8c4fb5712d9e733312398ab2736740a8e72c52b1))

## [0.1.0](https://github.com/thislooksfun/reduce-page/compare/v0.0.2...v0.1.0) (2023-06-01)


### Features

* add a tree trimmer stage ([15b40f8](https://github.com/thislooksfun/reduce-page/commit/15b40f8ffc1c5d874f2dbb055fa130d59039bdbb))
* rewrite into an interactive cli ([36a231f](https://github.com/thislooksfun/reduce-page/commit/36a231f323696979fcde5dfa4b217a4631b05f57))


### Bug Fixes

* remove debug log ([40ceeab](https://github.com/thislooksfun/reduce-page/commit/40ceeab345ef01bcfb7cc49288e8ce8c6ae56a76))


### Documentation

* add demo gif to readme ([a8e407f](https://github.com/thislooksfun/reduce-page/commit/a8e407f764b3081497dba391a3e3eda716155ed9))

## [0.0.2](https://github.com/thislooksfun/reduce-page/compare/v0.0.1...v0.0.2) (2023-05-29)


### Bug Fixes

* add shebang ([5c12e12](https://github.com/thislooksfun/reduce-page/commit/5c12e124749e7c77de7abf4b03f92649bfd57129))

## 0.0.1 (2023-05-28)


### Features

* initial commit ([0833adb](https://github.com/thislooksfun/reduce-page/commit/0833adb1fcf16092f4f3f1fdfd29b4b8d5e0a059))
* remove unused css (mostly) ([25e6aee](https://github.com/thislooksfun/reduce-page/commit/25e6aee1dbd53a1493b1d466b00a50683e1accec))
