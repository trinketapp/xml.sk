xml.sk
=======

XML ElementTree module for Skulpt

## Current Support

This module is an attempt to reproduce some of the functionality provided by the Python XML ElementTree module for use in [Skulpt](http://www.skulpt.org/).

### fromstring and tostring

These are the primary methods for parsing and displaying XML strings. `parse` and `XML` are aliases for `fromstring`.

### Element attributes and methods

* tag
* text
* attrib
* clear()
* get()
* items()
* keys()
* set()
* find()
* findall()
* findtext()
* iter()
* iterfind()
* itertext()

### Python docs

Complete spec of the Python 2.x XML ElementTree implementation can be found at https://docs.python.org/2/library/xml.etree.elementtree.html.

## TODO

XPath, read/write files, building and modifying trees from SubElements, tostring encoding.

### Element attributes and methods

* tail
* insert()
* makeelement()
* remove()

## Getting Started

Create a basic html page:

```html
<!-- @TODO: replace with example markup... -->
```

Add the xml.sk specific Skulpt configuration options
```js
// tell Skulpt where to find xml.sk
Sk.externalLibraries = {
  xml : {
    path : '/path/to/xml.sk/__init__.js'
  },
  'xml.etree' : {
    path : '/path/to/xml.sk/etree/__init__.js'
  },
  'xml.etree.ElementTree' : {
    path : '/path/to/xml.sk/etree/ElementTree.js'
  }
};
```

Point your browser to your html page and have fun!

## Dependencies

Assumes browser support for [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser).
