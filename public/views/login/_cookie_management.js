const css = `
#cookies-eu-banner {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  background: #eee;
  border-top: 1px solid #ddd;
  box-sizing: border-box;
  color: #444;
  font-size: 14px;
  line-height: 1.4;
  padding: 1em 2em;
  text-align: center;
  transform: translateY(100%);

}

#cookies-eu-banner[style*="display: block"] {
  animation: 1s ease-in-out 1s forwards showCookieBanner;
}

#cookies-eu-banner.before-remove {
  animation: 1s ease-in-out forwards hideCookieBanner;
}

.ib {
  display: inline-block;
}

  
#cookies-eu-banner button {
  cursor: pointer;
  padding: 0.25em 0.5em 0.2em;
  transition: 300ms all;
  font-size: 100%;
}

dialog {
box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  border: none !important;
  border-radius: 2px;
  width: 350px;
  max-height: 70%;
  z-index: 1001;
  user-select: none;
}

dialog::backdrop {
   background-color: #00000033;
}

dialog input[type="checkbox"] { 
   accent-color: #003D57;
}

dialog button {
   font-size: 90%;
}

#cookies-eu-more {
  padding: 0 0.25em;
  transition: 300ms all;
  background: #003D57;
  border: 1px solid #003D57;
  color: #FFFFFF;

  &:hover {
    background: #E18335;
    color: #f2f2f2;
    border: 1px solid #E18335;
  }
}
  
#cookies-eu-reject {
  background: none;
  border: 1px solid #b7b7b7;
  color: #6b6b6b;

  
  &:hover {
    border-color: #003D57;
    color: #003D57;
  }

}
  
#cookies-eu-accept {
  background: #003D57;
  border: 1px solid #003D57;
  color: #FFFFFF;
  
  &:hover {
    background: #E18335;
    color: #f2f2f2;
    border: 1px solid #E18335;
  }
}
  
@keyframes showCookieBanner {
    from { 
      transform: translateY(100%);
    }
    to {
      transform: translateY(0%);
    }

}
  
@keyframes hideCookieBanner {
    from {
      transform: translateY(0%);
    }
    to {
      transform: translateY(100%);
    }
}
`;

const style = document.createElement('style');

document.head.prepend(style);

style.appendChild(document.createTextNode(css));



window.onload = () => {

    console.log('hello I am a cookie management script !')

    const html_content = `
    We use cookies for anonymous website analysis. This helps us to improve this site.
    <div class="ib">
    <button id="cookies-eu-reject">Reject</button>
    <button id="cookies-eu-more">Settings</button>
    <button id="cookies-eu-accept">Accept</button>
    </div>`

    const el_banner = document.createElement('div');

    el_banner.id = "cookies-eu-banner";

    el_banner.style.display = 'none';

    el_banner.innerHTML = html_content;

    document.body.append(el_banner);

    function showBanner() {

        let banner = document.getElementById("cookies-eu-banner"),
        rejectButton = document.getElementById("cookies-eu-reject"),
        acceptButton = document.getElementById("cookies-eu-accept"),
        moreLink = document.getElementById("cookies-eu-more");

        banner.style.display = "block";


        moreLink.addEventListener('click', e => {
            showSettings();
        })

        acceptButton.addEventListener('click', e => {
            hideBanner();
            showConsent({
                "strictly_necessary": true,
                "third_party": true,
                "product_analytics": true
            });
        })

        rejectButton.addEventListener('click', e => {
            hideBanner();
            showConsent({
                "strictly_necessary": false,
                "third_party": false,
                "product_analytics": false
            });
        })

  

    }

    function hideBanner() {
        
        let banner = document.getElementById("cookies-eu-banner");
        banner.classList.add("before-remove");
        setTimeout(function () {
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 1200);

    }

    function showSettings() {
        const dialog = document.createElement('dialog');
        const form = document.createElement('form');
        
        function checkbox(params) {
            let chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.name = params.name;
            chk.checked = params.checked;
            chk.disabled = params.disabled;
            let lbl = document.createElement('label');
            lbl.textContent = params.label;
            lbl.for = params.name;
            const div = document.createElement('div');
            div.style.display = 'grid';
            div.style.gridTemplateColumns = '2em auto'
            div.style.gap = '1em';
            div.appendChild(chk);
            div.appendChild(lbl)
            return div
        }
        form.appendChild(checkbox({name: 'strictly_necessary', label: 'Strictly Necessary Cookies', disabled: true, checked: true}))
        form.appendChild(checkbox({name: 'third_party', label: 'Third Party Cookies', checked: true}))
        form.appendChild(checkbox({name: 'product_analytics', label: 'Product Analytics', checked: true}))

        const submit_btn = document.createElement('button');
        submit_btn.type = "submit";
        submit_btn.textContent = 'Accept';
        form.append(submit_btn);
        dialog.appendChild(form);
        document.body.append(dialog);

        form.onsubmit = e => {
            e.preventDefault();
            const consent = {
                strictly: true
            }
            const formData = new FormData(form);
            [...formData].map(i => {
                consent[i[0]] = true
            });
            console.log(consent);
            dialog.close();
            dialog.remove();
            showConsent(consent);
            hideBanner();
        }

        dialog.showModal();

    }

    function showConsent(consent) {

        const dialog = document.createElement('dialog');
        dialog.onclick = e => (dialog.close());
        dialog.onclose = e =>  (dialog.remove())
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(consent, undefined, 2);
        dialog.append(pre)
        document.body.append(dialog);
        dialog.showModal();

    }

    showBanner();


  

  

  

}