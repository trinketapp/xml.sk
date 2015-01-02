var $builtinmodule = function(name) {
  "use strict";
  var mod = {};

  var ElementTree = function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, str) {
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy('<xml.etree.ElementTree>');
    });
  };

  mod.ElementTree =
    Sk.misceval.buildClass(mod, ElementTree, 'ElementTree', []);

  var Element = function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, doc) {
      var attrib = [],
          i;

      self.tag       = doc.tagName;
      self.text      = '';
      self.attrib    = [];
      self.children_ = [];

      if (doc.nodeValue !== null) {
        self.text = doc.nodeValue;
      }

      // if no children, this is the text inside an element
      if (!doc.childNodes.length) {
        return self;
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

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('tag'),    new Sk.builtin.str(doc.tagName));
      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('attrib'), new Sk.builtin.dict(attrib));

      if (doc.childNodes) {
        for (i = 0; i < doc.childNodes.length; i++) {
          var child = Sk.misceval.callsim(mod.Element, doc.childNodes[i]);
          if (child.text !== undefined && !child.children_.length) {
            self.text = child.text;
            Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('text'), new Sk.builtin.str(child.text));
          }
          self.children_.push(child);
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
      return Sk.ffi.remapToPy('<xml.etree.ElementTree.Element>');
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
    $loc.iter = $loc.__iter__;

    $loc.iterfind = new Sk.builtin.func(function(self, path) {
      var children = self.children_;

      path = Sk.ffi.remapToJs(path);

      return Sk.builtin.makeGenerator(function() {
        var index = this.$index;

        if (index >= this.$children.length) {
          return undefined;
        }

        this.$index++;
        if (this.$children[index].tag == path) {
          return this.$children[index];
        }
      }, {
        $obj      : self,
        $index    : 0,
        $children : children
      });
    });

    $loc.itertext = new Sk.builtin.func(function(self) {
      var children = self.children_;

      return Sk.builtin.makeGenerator(function() {
        var index = this.$index;

        if (index >= this.$children.length) {
          return undefined;
        }

        this.$index++;
        if (this.$children[index].text) {
          return this.$children[index].text;
        }

        if (this.$children[index].children_.length) {
          for (var i = 0; i < this.$children[index].children_.length; i++) {
            return Sk.misceval.callsim($loc.itertext, this.$children[index].children_[i]);
          }
        }
      }, {
        $obj      : self,
        $index    : 0,
        $children : children
      });
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
      var text = '';
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
      var val = '';
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
      key = Sk.ffi.remapToJs(key);
      val = Sk.ffi.remapToJs(val);

      self.attrib.push(key);
      self.attrib.push(val);

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('attrib'), new Sk.builtin.dict(self.attrib));

      return;
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

    // remove not yet implemented
    $loc.remove = new Sk.builtin.func(function(self, element) {
      throw new Sk.builtin.NotImplementedError("remove is not yet implemented");
    });

    $loc.clear = new Sk.builtin.func(function(self) {
      self.text      = '';
      self.attrib    = [];
      self.children_ = [];

      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('text'),   new Sk.builtin.str(self.text));
      Sk.abstr.objectSetItem(self.$d, new Sk.builtin.str('attrib'), new Sk.builtin.dict(self.attrib));
    });
  };

  mod.Element =
    Sk.misceval.buildClass(mod, Element, 'Element', []);

  mod.parse = new Sk.builtin.func(function(source) {
    return Sk.misceval.callsim(mod.ElementTree, source);
  });

  mod.fromstring = new Sk.builtin.func(function(text) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text.v, 'application/xml');
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

    if (element.text) {
      element_content.push( element.text );
    }
    else {
      for (i = 0; i < element.children_.length; i++) {
        element_content.push( Sk.ffi.remapToJs( Sk.misceval.callsim(mod.tostring, element.children_[i]) ) );
      }
    }

    tag_end = "</" + element.tag + ">";

    xml_str = tag_start + element_content.join("") + tag_end;

    return new Sk.builtin.str(xml_str);
  });

  return mod;
};
