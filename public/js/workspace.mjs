import _xyz from './_xyz.mjs';

export default (init, token) => {

  // Assign token to _xyz.
  _xyz.token = token;

  // XHR to retrieve workspace from backend.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  xhr.onload = e => {

    // Assign workspace to _xyz. Continue with init.
    _xyz.ws = e.target.response;
    init();
  };

  xhr.send();
};