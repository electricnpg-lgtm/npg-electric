
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
});
