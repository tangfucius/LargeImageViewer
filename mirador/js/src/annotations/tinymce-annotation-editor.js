(function($){

  $.TinyMCEAnnotationBodyEditor = function(options) {

    jQuery.extend(this, {
      annotation: null,
      windowId: null
    }, options);

    this.init();
  };

  $.TinyMCEAnnotationBodyEditor.prototype = {
    init: function() {
      var _this = this;
      var annoText = "",
        tags = [],
        author = "";

      if (!jQuery.isEmptyObject(_this.annotation)) {
        if (jQuery.isArray(_this.annotation.resource)) {
          jQuery.each(_this.annotation.resource, function(index, value) {
            if (value['@type'] === "oa:Tag") {
              tags.push(value.chars);
            }
            else if (value['@type'] === "oa:annotatedBy") {
              author = value.chars;
            }  
            else {
              annoText = value.chars;
            }
          });
        } else {
          annoText = _this.annotation.resource.chars;
        }
      }

      this.editorMarkup = this.editorTemplate({
        content: annoText,
        tags : tags.join(" "),
        author: author,
        windowId : _this.windowId
      });
    },

    show: function(selector) {
      var self = this;
      this.editorContainer = jQuery(selector)
        .prepend(this.editorMarkup);

      console.log(self.editorMarkup);

      var tagSet = new Set();
      jQuery.ajax({
              url: 'annotation/',
              type: 'GET',
              success: function(data) {
                annoList = data.resources;
                jQuery.each(annoList, function(index, value){
                    jQuery.each(value.resource, function(ix, v){
                        if (v['@type']=="oa:Tag") {
                            tagSet.add({"tag": v.chars});
                        }
                    });
                });
                currentTags = Array.from(tagSet);
                //console.log(currentTags);
                $tagSelect = self.editorContainer.find('#selectize-editor').selectize({
                    create: true,
                    valueField: 'tag',
                    labelField: 'tag',
                    searchField: ['tag'],
                    options: currentTags,
                    render: {
                      item: function(item, escape) {
                        return '<div>' + escape(item.tag) + '</div>';
                      },
                      option: function(item, escape) {
                        return '<div>' + escape(item.tag) + '</div>';
                      }
                    }
                });

                $tagSelect[0].selectize.setValue(currentTags[0]);

                // $tagSelect.on('change', function() {
                //       console.log($tagSelect.val());
                // });
              }
      });

      tinymce.init({
        selector: selector + ' textarea',
        plugins: "image link media",
        menubar: false,
        statusbar: false,
        toolbar_items_size: 'small',
        toolbar: "bold italic | bullist numlist | link image media | removeformat",
        default_link_target:"_blank",
        setup: function(editor) {
          editor.on('init', function(args) {
            tinymce.execCommand('mceFocus', false, args.target.id);
          });
        }
      });
    },

    isDirty: function() {
      return tinymce.activeEditor.isDirty();
    },

    createAnnotation: function() {
      // var tagText = this.editorContainer.find('.tags-editor').val(),
      //   resourceText = tinymce.activeEditor.getContent(),
      //   tags = [];
      // tagText = $.trimString(tagText);
      // if (tagText) {
      //   tags = tagText.split(/\s+/);
      // }
      var resourceText = tinymce.activeEditor.getContent(),
      tags = [$tagSelect.val()];

      author = $.trimString(this.editorContainer.find('.author-editor').val());

      var motivation = [],
        resource = [],
        on;

      if (tags && tags.length > 0) {
        motivation.push("oa:tagging");
        jQuery.each(tags, function(index, value) {
          resource.push({
            "@type": "oa:Tag",
            "chars": value
          });
        });
      }

      if (author && author.length>0) {
        resource.push({
          "@type": "oa:annotatedBy",
          "chars": author
        });
      }

      motivation.push("oa:commenting");
      resource.push({
        "@type": "dctypes:Text",
        "format": "text/html",
        "chars": resourceText
      });

      var obj = {
        "@context": "http://iiif.io/api/presentation/2/context.json",
        "@type": "oa:Annotation",
        "motivation": motivation,
        "resource": resource
      };

      return obj;
    },

    updateAnnotation: function(oaAnno) {
      // var tagText = this.editorContainer.find('.tags-editor').val(),
      //   resourceText = tinymce.activeEditor.getContent(),
      //   tags = [];
      // tagText = $.trimString(tagText);
      // if (tagText) {
      //   tags = tagText.split(/\s+/);
      // }

      var resourceText = tinymce.activeEditor.getContent(),
      tags = [$tagSelect.val()];

      author = $.trimString(this.editorContainer.find('.author-editor').val());

      var motivation = [],
        resource = [];

      //remove all tag-related content in annotation
      oaAnno.motivation = jQuery.grep(oaAnno.motivation, function(value) {
        return value !== "oa:tagging";
      });
      oaAnno.resource = jQuery.grep(oaAnno.resource, function(value) {
        return value["@type"] !== "oa:Tag";
      });
      //re-add tagging if we have them
      if (tags.length > 0) {
        oaAnno.motivation.push("oa:tagging");
        jQuery.each(tags, function(index, value) {
          oaAnno.resource.push({
            "@type": "oa:Tag",
            "chars": value
          });
        });
      }
      jQuery.each(oaAnno.resource, function(index, value) {
        if (value["@type"] === "dctypes:Text") {
          value.chars = resourceText;
        }
        if (value["@type"] === "oa:annotatedBy") {
          value.chars = author;
        }
      });
    },

    editorTemplate: Handlebars.compile([
      '<select id="selectize-editor" placeholder="Pick a tag"></select>',
      '<textarea class="text-editor" placeholder="{{t "comments"}}…">{{#if content}}{{content}}{{/if}}</textarea>',
      '<input id="author-editor-{{windowId}}" class="author-editor" placeholder="{{t "addAuthorsHere"}}…" {{#if author}}value="{{author}}"{{/if}}>'
    ].join(''))
  };
}(Mirador));
