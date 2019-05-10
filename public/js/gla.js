_xyz({
  host: document.head.dataset.dir || new String(''),
  hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: 51.52,
        lng: 0.24,
        z: 6,
      }
    });

    //_xyz.layers.list['Advice Center'].show();
    //console.log(_xyz.layers.list['Advice Center']);


    customDropdown(_xyz);

    searchPostcode(_xyz);

    _xyz.tableview.layerTable({
      layer: _xyz.layers.list['Advice Center'],
      target: document.getElementById('List'),
      key: 'gla',
      visible: ['organisation'],
      groupBy: 'borough',
      initialSort: [
        {
          column: 'organisation', dir: 'asc'
        },
        {
          column: 'borough', dir: 'asc'
        }
      ],
      groupStartOpen: false,
      groupToggleElement: 'header',
      rowClick: (e, row) => {
        const rowData = row.getData();

        if (!rowData.qid) return;

        _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: _xyz.layers.list['Advice Center'].key,
          table: _xyz.layers.list['Advice Center'].table,
          id: rowData.qid,
        });

      }
    });

  }
});


function customDropdown(_xyz) {
  
    var x, i, j, selElmnt, a, b, c, d;

    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");

    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);

        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < selElmnt.length; j++) {
            /*for each option in the original select element, create a new DIV that will act as an option item:*/

            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", e => {
                /*when an item is clicked, update the original select box,
                and the selected item:*/
                var y, i, k, s, h;
                s = e.target.parentNode.parentNode.getElementsByTagName("select")[0];
                h = e.target.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML == e.target.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = e.target.innerHTML;
                        y = e.target.parentNode.getElementsByClassName("same-as-selected");
                        for (k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }
                        e.target.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }

        x[i].appendChild(b);

        a.addEventListener("click", e => {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            
            closeAllSelect(e.target);
            e.target.nextSibling.classList.toggle("select-hide");
            e.target.classList.toggle("select-arrow-active");

        });
    }

    function closeAllSelect(elmnt) {
        /*a function that will close all select boxes in the document,
        except the current select box:*/
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        for (i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener("click", closeAllSelect);
}

function searchPostcode(_xyz){

  let input = document.querySelector('#postcode-search input'),
      find = document.querySelector('#postcode-find');
  
  input.addEventListener('focus', e => {
    document.getElementById('postcode-find').classList.remove('darkish');
    document.getElementById('postcode-find').classList.add('pink-bg');
    e.target.parentNode.classList.add('pink-br');
  });

  input.addEventListener('blur', e => {
    document.getElementById('postcode-find').classList.add('darkish');
    document.getElementById('postcode-find').classList.remove('pink-bg');
    e.target.parentNode.classList.remove('pink-br');
  });

  input.addEventListener('keyup', e => {
    if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
    _xyz.gazetteer.search(e.target.value);
  });

  find.addEventListener('click', e => {
    console.log('find postcode');
  });




}