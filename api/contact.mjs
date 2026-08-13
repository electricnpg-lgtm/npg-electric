import nodemailer from 'nodemailer';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }
});

const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const safeHeader = (value, max) => clean(value, max).replace(/[\r\n]+/g, ' ');
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({error: 'Method not allowed'}, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({error: 'Невалидно запитване.'}, 400);
    }

    // Honeypot: bots often fill hidden fields. Return success without sending.
    if (clean(body.companyWebsite, 200)) {
      return json({ok: true});
    }

    const name = safeHeader(body.name, 100);
    const phone = safeHeader(body.phone, 50);
    const email = safeHeader(body.email, 150);
    const message = clean(body.message, 4000);
    const startedAt = Number(body.startedAt || 0);

    if (!name || !phone || !message) {
      return json({error: 'Моля, попълнете име, телефон и съобщение.'}, 400);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({error: 'Моля, въведете валиден имейл адрес.'}, 400);
    }

    // Very fast submissions are usually automated.
    if (startedAt && Date.now() - startedAt < 1200) {
      return json({ok: true});
    }

    const user = process.env.CONTACT_EMAIL_USER;
    const appPassword = String(process.env.CONTACT_EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const to = process.env.CONTACT_EMAIL_TO || user;

    if (!user || !appPassword || !to) {
      console.error('Contact form email environment variables are not configured.');
      return json({error: 'Формата временно не е налична.'}, 503);
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {user, pass: appPassword}
    });

    const text = [
      'Ново запитване от npgelectric.bg',
      '',
      `Име: ${name}`,
      `Телефон: ${phone}`,
      `Имейл: ${email || 'Не е посочен'}`,
      '',
      'Съобщение:',
      message
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18202a;max-width:680px">
        <h2 style="margin:0 0 20px">Ново запитване от npgelectric.bg</h2>
        <p><strong>Име:</strong> ${escapeHtml(name)}<br>
        <strong>Телефон:</strong> ${escapeHtml(phone)}<br>
        <strong>Имейл:</strong> ${escapeHtml(email || 'Не е посочен')}</p>
        <p><strong>Съобщение:</strong></p>
        <div style="white-space:pre-wrap;background:#f4f6f8;padding:16px;border-radius:10px">${escapeHtml(message)}</div>
      </div>`;

    try {
      await transporter.sendMail({
        from: `NPG Electric Website <${user}>`,
        to,
        replyTo: email || undefined,
        subject: `Ново запитване от сайта — ${name}`,
        text,
        html
      });
      return json({ok: true});
    } catch (error) {
      console.error('Contact form send failed:', error?.message || error);
      return json({error: 'Неуспешно изпращане.'}, 500);
    }
  }
};
