var $builtinmodule = function(name) {
  "use strict";
  var mod = {};

  var getAllChildren = function(children_) {
    var children = [];
    for (var i = 0; i < children_.length; i++) {
      children.push(children_[i]);
      if (children_[i].children_.length) {
        var grandchildren = getAllChildren(children_[i].children_);
        children = children.concat(grandchildren);
      }
    }
    return children;
  };

  var ElementTree = function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, str) {
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy("<xml.etree.ElementTree>");
    });
  };

  mod.ElementTree =
    Sk.misceval.buildClass(mod, ElementTree, "ElementTree", []);

  var Element = function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, doc) {
      var attrib = [],
          i;

      self.tag       = doc instanceof Sk.builtin.str ? doc.v : doc.tagName;
      self.text      = "";
      self.attrib    = [];
      self.children_ = [];

      if (doc.nodeValue !== null) {
        self.text = doc.nodeValue;
      }

      if (doc.attributes) {
        for (i = 0; i < doc.attributes.length; i++) {
          self.attrib.push(doc.attributes[i].name);
          self.attrib.push(doc.attributes[i].value);

          var name  = new Sk.builtin.str(doc.attributes[i].name);
          var value = new Sk.builtin.str(doc.attributes[i].value);
          attrib.push(name);
          attrib.push(value);
        }
      }

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("tag"),    new Sk.builtin.str(self.tag));
      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("text"),   new Sk.builtin.str(self.text));
      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("attrib"), new Sk.builtin.dict(attrib));

      // if a Skulpt string, this is a call to Element("<str>")
      // if no children, this is the text inside an element
      if (doc instanceof Sk.builtin.str || !doc.childNodes.length) {
        return self;
      }

      if (doc.childNodes) {
        for (i = 0; i < doc.childNodes.length; i++) {
          var child = Sk.misceval.callsim(mod.Element, doc.childNodes[i]);
          if (child.text !== undefined && !child.children_.length) {
            self.text = child.text;
            Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("text"), new Sk.builtin.str(child.text));
          }
          if (child.tag !== undefined) {
            self.children_.push(child);
          }
        }
      }

      return self;
    });

    $loc.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

    $loc.mp$subscript = function(index) {
      index = Sk.builtin.asnum$(index);
      if (typeof index === "number" && Math.floor(index) === index) {
        if (index < 0) {
          index = this.children_.length + index;
        }
        if (index < 0 || index >= this.children_.length) {
          throw new Sk.builtin.IndexError("index out of range");
        }
        return this.children_[index];
      }
      else if (index instanceof Sk.builtin.slice) {
        // slices not yet supported
      }
      else {
        throw new Sk.builtin.TypeError("indices must be numbers, not " + typeof index);
      }
    };

    $loc.__str__ = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy("<xml.etree.ElementTree.Element>");
    });

    $loc.__iter__ = new Sk.builtin.func(function(self) {
      var children = self.children_;

      return Sk.builtin.makeGenerator(function() {
        if (this.$index >= this.$children.length) {
          return undefined;
        }
        return this.$children[ this.$index++ ];
      }, {
        $obj      : self,
        $index    : 0,
        $children : children
      });
    });

    var iter_f = function(kwa, self, tag) {
      var children = getAllChildren(self.children_),
          kwargs   = new Sk.builtins.dict(kwa);

      kwargs = Sk.ffi.remapToJs(kwargs);
      if (tag) {
        kwargs.tag = Sk.ffi.remapToJs(tag);
      }

      if (kwargs.tag) {
        children = children.filter(function(elem) {
          return elem.tag === kwargs.tag;
        });
      }
      else {
        children.unshift(self);
      }

      return new Sk.builtin.list(children);
    };

    iter_f.co_kwargs = true;
    $loc.iter = new Sk.builtin.func(iter_f);

    $loc.iterfind = new Sk.builtin.func(function(self, path) {
      var children = getAllChildren(self.children_);
      var elements = [], i;

      path = Sk.ffi.remapToJs(path);

      for (i = 0; i < children.length; i++) {
        if (children[i].tag === path) {
          elements.push(children[i]);
        }
      }

      return new Sk.builtin.list(elements);
    });

    $loc.itertext = new Sk.builtin.func(function(self) {
      var children = getAllChildren(self.children_),
          text = [], i;

      for (i = 0; i < children.length; i++) {
        if (children[i].text.length) {
          text.push(children[i].text);
        }
      }

      return new Sk.builtin.list(text);
    });

    $loc.findall = new Sk.builtin.func(function(self, path) {
      var list = [];
      path = Sk.ffi.remapToJs(path);

      for (var i = 0; i < self.children_.length; i++) {
        if (self.children_[i].tag === path) {
          list.push(self.children_[i]);
        }
      }

      return new Sk.builtin.list(list);
    });

    $loc.find = new Sk.builtin.func(function(self, path) {
      var elem;
      path = Sk.ffi.remapToJs(path);

      for (var i = 0; i < self.children_.length; i++) {
        if (self.children_[i].tag === path) {
          elem = self.children_[i];
          break;
        }
      }

      return elem;
    });

    $loc.findtext = new Sk.builtin.func(function(self, path) {
      var text = "";
      path = Sk.ffi.remapToJs(path);

      for (var i = 0; i < self.children_.length; i++) {
        if (self.children_[i].tag === path) {
          text = self.children_[i].text;
          break;
        }
      }

      return new Sk.builtin.str(text);
    });

    $loc.get = new Sk.builtin.func(function(self, key) {
      var val = "";
      key = Sk.ffi.remapToJs(key);

      for (var i = 0; i < self.attrib.length; i += 2) {
        if (self.attrib[i] === key) {
          val = self.attrib[i + 1];
          break;
        }
      }

      return new Sk.builtin.str(val);
    });

    $loc.set = new Sk.builtin.func(function(self, key, val) {
      var attrib = [],
          i, name, value;

      key = Sk.ffi.remapToJs(key);
      val = Sk.ffi.remapToJs(val);

      self.attrib.push(key);
      self.attrib.push(val);

      for (i = 0; i < self.attrib.length; i += 2) {
        name  = new Sk.builtin.str(self.attrib[i]);
        value = new Sk.builtin.str(self.attrib[i + 1]);
        attrib.push(name);
        attrib.push(value);
      }

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("attrib"), new Sk.builtin.dict(attrib));
    });

    $loc.items = new Sk.builtin.func(function(self) {
      var attrib = [];

      for (var i = 0; i < self.attrib.length; i += 2) {
        var name  = new Sk.builtin.str(self.attrib[i]);
        var value = new Sk.builtin.str(self.attrib[i + 1]);
        attrib.push(name);
        attrib.push(value);
      }

      return new Sk.builtin.dict(attrib);
    });

    $loc.keys = new Sk.builtin.func(function(self) {
      var keys = [];

      for (var i = 0; i < self.attrib.length; i += 2) {
        var name = new Sk.builtin.str(self.attrib[i]);
        keys.push(name);
      }

      return new Sk.builtin.list(keys);
    });

    $loc.insert = new Sk.builtin.func(function(self, index, element) {
      index = Sk.ffi.remapToJs(index);
      self.children_.splice(index, 0, element);
    });

    // remove not yet implemented
    $loc.remove = new Sk.builtin.func(function(self, element) {
      throw new Sk.builtin.NotImplementedError("remove is not yet implemented");
    });

    $loc.clear = new Sk.builtin.func(function(self) {
      self.text      = "";
      self.attrib    = [];
      self.children_ = [];

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("text"),   new Sk.builtin.str(self.text));
      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str("attrib"), new Sk.builtin.dict(self.attrib));
    });

    $loc.append = new Sk.builtin.func(function(self, element) {
      self.children_.push(element);
    });

    $loc.extend = new Sk.builtin.func(function(self, elements) {
      var it, i;
      for (it = elements.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext()) {
        self.children_.push(i);
      }
    });
  };

  mod.Element =
    Sk.misceval.buildClass(mod, Element, "Element", []);

  mod.parse = new Sk.builtin.func(function(source) {
    return Sk.misceval.callsim(mod.ElementTree, source);
  });

  mod.fromstring = new Sk.builtin.func(function(text) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text.v, "application/xml");
    return Sk.misceval.callsim(mod.Element, doc.childNodes[0]);
  });

  mod.XML = mod.parse = mod.fromstring;

  mod.tostring = new Sk.builtin.func(function(element) {
    var element_content = [],
        attrib_list = "",
        xml_str, tag_start, tag_end, i;

    // <tag attrib>text</tag>
    tag_start = "<" + element.tag;
    for (i = 0; i < element.attrib.length; i += 2) {
      attrib_list += " " + element.attrib[i] + "='" + element.attrib[i + 1] + "'";
    }
    tag_start += attrib_list + ">";

    for (i = 0; i < element.children_.length; i++) {
      element_content.push( Sk.ffi.remapToJs( Sk.misceval.callsim(mod.tostring, element.children_[i]) ) );
    }

    if (/\S/.test(element.text)) {
      element_content.push( element.text );
    }

    tag_end = "</" + element.tag + ">";

    xml_str = tag_start + element_content.join("") + tag_end;

    return new Sk.builtin.str(xml_str);
  });

  mod.dump = mod.tostring;

  mod.SubElement = new Sk.builtin.func(function(parent, tag) {
    var element = Sk.misceval.callsim(mod.Element, tag);
    parent.children_.push(element);
    return element;
  });

  return mod;
};
