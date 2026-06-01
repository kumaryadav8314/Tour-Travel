
function setCookie(cname, cvalue, exhours) {
  const d = new Date();
  d.setTime(d.getTime() + (30 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length);
    }
  }
  return "";
}

function deleteCookie(cname) {
  const d = new Date();
  d.setTime(d.getTime() - 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=;${expires};path=/`;
}

/* ----------------------------
   Contact & Subscription Forms
----------------------------- */
function contactForm() {

  // reCAPTCHA callbacks
  window.verifyRecaptchaCallback = function (response) {
    const recaptchaInput = document.querySelector('input[data-recaptcha]');
    if (recaptchaInput) {
      recaptchaInput.value = response;
      recaptchaInput.dispatchEvent(new Event('change'));
    }
  };

  window.expiredRecaptchaCallback = function () {
    const recaptchaInput = document.querySelector('input[data-recaptcha]');
    if (recaptchaInput) {
      recaptchaInput.value = "";
      recaptchaInput.dispatchEvent(new Event('change'));
    }
  };

  // Contact form handler
  document.querySelectorAll('.dzForm').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const msgContainer = form.querySelector('.dzFormMsg');
      if (msgContainer) {
        msgContainer.innerHTML = '<div class="gen alert dz-alert alert-success">Submitting..</div>';
      }

      const formData = new FormData(form);
      let actionUrl = form.getAttribute('action') || '/api/contact';
      const apiBase = window.CONTACT_API_BASE || '';
      if (apiBase && actionUrl.startsWith('/')) {
        actionUrl = apiBase.replace(/\/$/, '') + actionUrl;
      }

      fetch(actionUrl, {
        method: 'POST',
        body: new URLSearchParams(formData),
        headers: { 'Accept': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(dzRes => {
          let msgHtml = '';
          if (dzRes.status === 1) {
            msgHtml = `<div class="gen alert dz-alert alert-success">${dzRes.msg}</div>`;
          } else {
            msgHtml = `<div class="err alert dz-alert alert-danger">${dzRes.msg || 'Something went wrong.'}</div>`;
          }

          if (msgContainer) {
            msgContainer.innerHTML = msgHtml;
            setTimeout(() => {
              const alert = msgContainer.querySelector('.alert');
              if (alert) alert.style.display = 'none';
            }, 5000);
          }

          if (dzRes.status === 1) {
            form.reset();
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
          }
        })
        .catch(() => {
          if (msgContainer) {
            msgContainer.innerHTML =
              '<div class="err alert dz-alert alert-danger">Unable to send message. Please check that the server is running and try again.</div>';
          }
        });
    });
  });

  // Subscription form handler
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (!form.classList.contains('dzSubscribe')) return;

    e.preventDefault();

    const msgContainer = document.querySelector('.dzSubscribeMsg');
    const formData = new FormData(form);
    const actionUrl = form.getAttribute('action');

    form.classList.add('dz-ajax-overlay');

    fetch(actionUrl, {
      method: 'POST',
      body: new URLSearchParams(formData),
      headers: { 'Accept': 'application/json' }
    })
      .then(response => response.json())
      .then(dzRes => {
        form.classList.remove('dz-ajax-overlay');

        let msgHtml = '';
        if (dzRes.status === 1) {
          msgHtml = `<div class="gen alert dz-alert alert-success">${dzRes.msg}</div>`;
          setCookie('prevent_subscription', 'true', 1);
        } else {
          msgHtml = `<div class="err alert dz-alert alert-danger">${dzRes.msg}</div>`;
        }

        if (msgContainer) {
          msgContainer.innerHTML = msgHtml;
          setTimeout(() => {
            const alert = msgContainer.querySelector('.alert');
            if (alert) alert.style.display = 'none';
          }, 5000);
        }

        form.reset();
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  contactForm();
});