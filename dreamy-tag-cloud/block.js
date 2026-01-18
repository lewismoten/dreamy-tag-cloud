(({
  serverSideRender,
  blocks: { registerBlockType },
  element: {
    createElement: el,
    useState
  },
  blockEditor: { InspectorControls, useBlockProps },
  components: {
    PanelBody,
    TextControl,
    TextareaControl,
    ToggleControl,
    ComboboxControl,
    Button
  },
  data: { useSelect },
  coreData: { store: coreStore }
}) => {

  const pluginName = 'dreamy-tag-cloud';
  const typeName = `lewismoten/${pluginName}`;

  const [tagSearch, setTagSearch] = useState("");
  const tags = useSelect(
    (select) =>
      select(coreStore).getEntityRecords("taxonomy", "post_tag", {
        search: tagSearch || undefined,
        per_page: 20,
        hide_empty: false,
        orderby: "count",
        order: "desc"
      }),
    [tagSearch]
  );
  const tagOptions = (tags || []).map((t) => ({ label: t.name, value: t.id }));

  const asNumber = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  const toNumbers = (value) => (value || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !isNaN(s))
    .map(s => parseInt(s, 10));

  registerBlockType(typeName, {
    edit: (props) => {
      const attrs = props.attributes;

      const blockProps = useBlockProps({
        className: `${pluginName}-editor`
      });

      const tags = useSelect(
        (select) => {
          return select(coreStore).getEntityRecords(
            'taxonomy',
            'post_tag',
            { per_page: 100 }
          );
        },
        []
      );

      const tagOptions = (tags || []).map(tag => ({
        label: tag.name,
        value: asNumber(tag.id),
      }));

      return el(
        'div',
        blockProps,
        el(
          InspectorControls,
          { key: "inspector" },
          el(
            PanelBody,
            { title: "Dreamy Tags Settings", initialOpen: true },

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
              onBlur: () => props.setAttributes({ cat: toNumbers(attrs.cat_raw) }),
            }),

            el(ComboboxControl, {
              label: "Filter Tags",
              help: "Type to search tags, then click to select",
              options: tagOptions,
              value: null,
              onFilterValueChange: (input) => setTagSearch(input),
              onChange: (tagId) => {
                const id = Number(tagId);
                if (!Number.isFinite(id)) return;
                
                const tags = props.attributes.tags.map(asNumber);
                if (!tags.includes(id)) {
                  props.setAttributes({
                    tags: [...tags, id]
                  });
                }
              }
            }),
            el(
              'ul',
              { style: { marginTop: '8px' } },
              (props.attributes.tags || []).map(id => {
                id = asNumber(id);
                const tag = tags?.find(t => t.id === id);
                if (!tag) return null;
                return el(
                  'li',
                  { key: id, style: { display: 'flex', alignItems: 'center' } },
                  el('span', { style: { marginRight: '8px' } }, tag.name),
                  el(Button, {
                    isDestructive: true,
                    isSmall: true,
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      id = asNumber(id);
                      props.setAttributes({
                        tag_ids: (props.attributes.tags || []).filter(t => t !== id)
                      });
                    }
                  },
                    '×'
                  )
                );
              })
            ),
            el(ToggleControl, {
              label: "Auto-exclude filtered tags",
              checked: !!attrs.auto_exclude,
              onChange: (v) => props.setAttributes({ auto_exclude: v }),
            }),

            el(TextareaControl, {
              label: "Exclude Tags",
              value: attrs.exclude_raw || "",
              onChange: (v) => props.setAttributes({ exclude_raw: v }),
              onBlur: () => props.setAttributes({ exclude: toNumbers(attrs.exclude_raw) }),
            })
          )
        ),
        el('div', { className: 'dreamy-tag-cloud-preview' },
          el(serverSideRender, { key: 'preview', block: typeName, attributes: attrs })
        )
      );
    },

    save: () => null
  });

})(window.wp);
