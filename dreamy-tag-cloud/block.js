(({
  serverSideRender,
  blocks: { registerBlockType },
  element: { createElement: el, useState },
  blockEditor: { InspectorControls, useBlockProps },
  components: {
    PanelBody,
    TextControl,
    ToggleControl,
    ComboboxControl,
    Button
  },
  data: { useSelect },
  coreData: { store: coreStore }
}) => {

  const pluginName = 'dreamy-tag-cloud';
  const typeName = `lewismoten/${pluginName}`;
  const deleteIcon = "×";

  const asNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const toNumbers = (value) => (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
    .map((n) => parseInt(n, 10));

  registerBlockType(typeName, {
    edit: (props) => {
      const attrs = props.attributes || {};
      const blockProps = useBlockProps({ className: `${pluginName}-editor` });

      const [catSearch, setCatSearch] = useState("");
      const [tagSearch, setTagSearch] = useState("");
      const [excludeSearch, setExcludeSearch] = useState("");

      const allCats = useSelect(
        (select) =>
          select(coreStore).getEntityRecords("taxonomy", "category", {
            search: catSearch || undefined,
            per_page: 50,
            hide_empty: false,
            orderby: "name",
            order: "asc"
          }),
        [catSearch]
      );

      const catOptions = (allCats || []).map((c) => ({
        label: c.name,
        value: c.id
      }));

      const selectedCatIds = Array.isArray(attrs.cat)
        ? attrs.cat.map(asNumber).filter((n) => n !== null)
        : [];

      const selectedCats = useSelect(
        (select) => {
          if (!selectedCatIds.length) return [];
          return select(coreStore).getEntityRecords("taxonomy", "category", {
            include: selectedCatIds,
            per_page: selectedCatIds.length,
            hide_empty: false
          });
        },
        [selectedCatIds.join(",")]
      );

      const catNameById = {};
      (selectedCats || []).forEach((c) => {
        catNameById[c.id] = c.name;
      });

      const addCat = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        if (!selectedCatIds.includes(idNum)) {
          props.setAttributes({ cat: [...selectedCatIds, idNum] });
        }
      };

      const removeCat = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        props.setAttributes({ cat: selectedCatIds.filter((c) => c !== idNum) });
      };

      const allTags = useSelect(
        (select) =>
          select(coreStore).getEntityRecords("taxonomy", "post_tag", {
            search: tagSearch || undefined,
            per_page: 50,
            hide_empty: false,
            orderby: "name",
            order: "asc"
          }),
        [tagSearch]
      );

      const tagOptions = (allTags || []).map((t) => ({
        label: t.name,
        value: t.id
      }));

      const selectedTagIds = Array.isArray(attrs.tags)
        ? attrs.tags.map(asNumber).filter((n) => n !== null)
        : [];

      const selectedTags = useSelect(
        (select) => {
          if (!selectedTagIds.length) return [];
          return select(coreStore).getEntityRecords("taxonomy", "post_tag", {
            include: selectedTagIds,
            per_page: selectedTagIds.length,
            hide_empty: false
          });
        },
        [selectedTagIds.join(",")]
      );

      const tagNameById = {};
      (selectedTags || []).forEach((t) => {
        tagNameById[t.id] = t.name;
      });

      const addTag = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        if (excludeTagIds.includes(idNum)) return;
        if (!selectedTagIds.includes(idNum)) {
          props.setAttributes({ tags: [...selectedTagIds, idNum] });
        }
      };

      const removeTag = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        props.setAttributes({ tags: selectedTagIds.filter((t) => t !== idNum) });
      };

      const excludeAllTags = useSelect(
        (select) =>
          select(coreStore).getEntityRecords("taxonomy", "post_tag", {
            search: excludeSearch || undefined,
            per_page: 50,
            hide_empty: false,
            orderby: "name",
            order: "asc"
          }),
        [excludeSearch]
      );

      const excludeOptions = (excludeAllTags || []).map((t) => ({
        label: t.name,
        value: t.id
      }));

      const excludeTagIds = Array.isArray(attrs.exclude)
        ? attrs.exclude.map(asNumber).filter((n) => n !== null)
        : [];

      const excludedTags = useSelect(
        (select) => {
          if (!excludeTagIds.length) return [];
          return select(coreStore).getEntityRecords("taxonomy", "post_tag", {
            include: excludeTagIds,
            per_page: excludeTagIds.length,
            hide_empty: false
          });
        },
        [excludeTagIds.join(",")]
      );

      const excludeNameById = {};
      (excludedTags || []).forEach((t) => {
        excludeNameById[t.id] = t.name;
      });

      const addExcludeTag = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        if (selectedTagIds.includes(idNum)) return;
        if (!excludeTagIds.includes(idNum)) {
          props.setAttributes({ exclude: [...excludeTagIds, idNum] });
        }
      };

      const removeExcludeTag = (id) => {
        const idNum = asNumber(id);
        if (!idNum) return;
        props.setAttributes({ exclude: excludeTagIds.filter((t) => t !== idNum) });
      };

      return el(
        "div",
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
              onChange: (v) => props.setAttributes({ title: v })
            }),

            el(ComboboxControl, {
              label: "Filter Categories",
              help: "Type to search categories, then click to add",
              options: catOptions,
              value: null,
              onFilterValueChange: (input) => setCatSearch(input || ""),
              onChange: (catId) => addCat(catId)
            }),

            el(
              "div",
              { style: { marginTop: "8px" } },
              selectedCatIds.length
                ? el(
                    "ul",
                    { style: { margin: 0, paddingLeft: "18px" } },
                    selectedCatIds.map((id) => {
                      const label = catNameById[id] || `Category #${id}`;
                      return el(
                        "li",
                        { key: id, style: { display: "flex", gap: "8px", alignItems: "center" } },
                        el("span", null, label),
                        el(
                          Button,
                          {
                            isDestructive: true,
                            isSmall: true,
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeCat(id);
                            }
                          },
                          deleteIcon
                        )
                      );
                    })
                  )
                : el("div", { style: { opacity: 0.7 } }, "No categories selected yet.")
            ),
            el(ComboboxControl, {
              label: "Filter Tags",
              help: "Type to search tags, then click to add",
              options: tagOptions,
              value: null,
              onFilterValueChange: (input) => setTagSearch(input || ""),
              onChange: (tagId) => addTag(tagId)
            }),

            el(
              "div",
              { style: { marginTop: "8px" } },
              selectedTagIds.length
                ? el(
                    "ul",
                    { style: { margin: 0, paddingLeft: "18px" } },
                    selectedTagIds.map((id) => {
                      const label = tagNameById[id] || `Tag #${id}`;
                      return el(
                        "li",
                        { key: id, style: { display: "flex", gap: "8px", alignItems: "center" } },
                        el("span", null, label),
                        el(
                          Button,
                          {
                            isDestructive: true,
                            isSmall: true,
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeTag(id);
                            }
                          },
                          deleteIcon
                        )
                      );
                    })
                  )
                : el("div", { style: { opacity: 0.7 } }, "No filter tags selected yet.")
            ),

            el(ToggleControl, {
              label: "Auto-exclude filtered tags",
              checked: !!attrs.auto_exclude,
              onChange: (v) => props.setAttributes({ auto_exclude: v })
            }),

            el(ComboboxControl, {
              label: "Exclude Tags",
              help: "Type to search tags, then click to exclude",
              options: excludeOptions,
              value: null,
              onFilterValueChange: (input) => setExcludeSearch(input || ""),
              onChange: (tagId) => addExcludeTag(tagId)
            }),

            el(
              "div",
              { style: { marginTop: "8px" } },
              excludeTagIds.length
                ? el(
                    "ul",
                    { style: { margin: 0, paddingLeft: "18px" } },
                    excludeTagIds.map((id) => {
                      const label = excludeNameById[id] || `Tag #${id}`;
                      return el(
                        "li",
                        { key: id, style: { display: "flex", gap: "8px", alignItems: "center" } },
                        el("span", null, label),
                        el(
                          Button,
                          {
                            isDestructive: true,
                            isSmall: true,
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeExcludeTag(id);
                            }
                          },
                          deleteIcon
                        )
                      );
                    })
                  )
                : el("div", { style: { opacity: 0.7 } }, "No excluded tags yet.")
            ),

          )
        ),

        el(
          "div",
          { className: `${pluginName}-preview`, style: { marginTop: "8px" } },
          el(serverSideRender, {
            key: "preview",
            block: typeName,
            attributes: attrs
          })
        )
      );
    },

    save: () => null
  });

})(window.wp);
