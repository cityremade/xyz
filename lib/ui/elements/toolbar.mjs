export default function toolbar(params) {
  params.target ??= document.body;
  params.tabs ??= mapp.utils.html.node`<div id="ctrl-tabs" class="hover"/>`;
  params.sections ??= mapp.utils.html.node`<div id="ctrl-panel"/>`;
  params.node = mapp.utils.html.node`${params.tabs}${params.sections}`;

  params.elements.map((item) => {
    if (item.href) {
      item.tab = link(item);
    } else {
      item.tab = mapp.utils.html.node`<div><button
        data-id=${item.data_id} 
        class=${'material-symbols-outlined ' + item.css_class}
        style=${item.css_style}
        onclick=${(e) => {
          // Change active class for the tabs and sections
          params.tabs.childNodes.forEach((el) => el.classList.remove('active'));
          params.sections.childNodes.forEach((el) =>
            el.classList.remove('active'),
          );
          // current tab made active
          e.target.classList.add('active');

          // show corresponding section if exists
          if (item.useSection) {
            item.section.classList.add('active');
          }

          // run callback function on click when defined
          if (typeof item.callback == 'function') item.callback(e);
        }}
        >${item.icon_name}`;
    }

    params.tabs.append(item.tab);

    if (item.href) return;

    if (item.useSection) {
      item.section = mapp.utils.html.node`<div id=${item.data_id}>`;
      params.sections.append(item.section);
    }
  });

  // show first section as active
  const active_section = params.sections.firstChild;
  active_section.classList.add('active');
  const active_tab = params.tabs.querySelector(
    `[data-id='${active_section.id}']`,
  );
  active_tab.classList.add('active');

  params.target.append(params.node);
}

function link(item) {
  return mapp.utils.html.node`<div class="material-symbols-outlined" 
    style=${item.css_style}><a 
    class=${item.css_class}
    data-id=${item.data_id} 
    href=${item.href}>${item.icon_name}`;
}
