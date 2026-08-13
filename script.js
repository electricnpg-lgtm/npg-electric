document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.dataset.open === 'true';
      menu.dataset.open = String(!open);
      if (!open) {
        menu.style.display='flex';
        menu.style.position='absolute';
        menu.style.top='78px';
        menu.style.left='14px';
        menu.style.right='14px';
        menu.style.flexDirection='column';
        menu.style.alignItems='stretch';
        menu.style.background='#0d131b';
        menu.style.border='1px solid rgba(255,255,255,.1)';
        menu.style.borderRadius='16px';
        menu.style.padding='12px 18px';
      } else {
        menu.removeAttribute('style');
      }
    });
  }

  const form = document.querySelector('#contact-form');
  if (!form) return;

  const submit = document.querySelector('#contact-submit');
  const status = document.querySelector('#form-status');
  const startedAt = document.querySelector('#form-started-at');
  if (startedAt) startedAt.value = String(Date.now());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Изпращане…';
    status.className = 'form-status';
    status.textContent = '';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Неуспешно изпращане.');

      form.reset();
      if (startedAt) startedAt.value = String(Date.now());
      status.className = 'form-status success';
      status.textContent = 'Благодарим! Запитването е изпратено успешно. Ще се свържем с вас възможно най-скоро.';
    } catch (error) {
      status.className = 'form-status error';
      status.textContent = 'Не успяхме да изпратим запитването. Моля, пишете ни на office@npgelectric.bg или опитайте отново.';
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
});
