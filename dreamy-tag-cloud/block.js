(function (blocks, element, components, blockEditor, serverSideRender) {

  const { registerBlockType } = blocks;
  const { createElement: el } = element;
  const { InspectorControls, useBlockProps } = blockEditor;
  const { PanelBody, TextControl, TextareaControl, ToggleControl } = components;

  function toNumbers(value) {
    return (value || "")
      .split(",")
      .map(s => s.trim())
      .filter(s => !isNaN(s))
      .filter(Boolean)
      .map(s => parseInt(s, 10));
  }


  registerBlockType("lewismoten/dreamy-tag-cloud", {
    edit:  (props) => {
      const attrs = props.attributes;
      const blockProps = useBlockProps({ className: "dreamy-tag-cloud-editor" });

      return [
        el(
          'div',
          blockProps,
          el(
            InspectorControls,
            { key: "inspector" },
            el(
              PanelBody,
              { title: "Dreamy Tag Cloud Settings", initialOpen: true },

              el(TextControl, {
                label: "Title",
                value: attrs.title || "",
                onChange: (v) => props.setAttributes({ title: v }),
              }),

              el(TextareaControl, {
                label: "Filter Categories",
                help: "Example: 3, 9",
                value: attrs.cat_raw || "",
                onChange: (v) => props.setAttributes({ cat_raw: v }),
                onBlur: () =>
                  props.setAttributes({ cat: toNumbers(attrs.cat_raw) })
              }),

              el(TextareaControl, {
                label: "Filter Tags",
                value: attrs.tags_raw || '',
                onChange: (v) => props.setAttributes({ tags_raw: v }),
                onBlur:  () => props.setAttributes({ tags : toNumbers(attrs.tags_raw)})
              }),

              el(TextareaControl, {
                label: "Exclude Tags",
                value: attrs.exclude_raw || '',
                onChange: (v) => props.setAttributes({ exclude_raw: v }),
                onBlur: () => props.setAttributes({ exclude: toNumbers(attrs.exclude_raw) }),
              }),

              el(ToggleControl, {
                label: "Auto-exclude filtered tags",
                checked: !!attrs.exclude,
                onChange: (v) => props.setAttributes({ exclude: v }),
              })
            )
          )
        )
        ,

        el(serverSideRender, {
          key: "preview",
          block: "lewismoten/dreamy-tag-cloud",
          attributes: attrs,
        }),
      ];
    },

    save: () => null
  });
})(
  window.wp.blocks,
  window.wp.element,
  window.wp.components,
  window.wp.blockEditor,
  window.wp.serverSideRender
);
