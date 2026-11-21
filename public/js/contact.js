const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

let timingToken = '';

async function loadTimingToken() {
  try {
    const response = await fetch('/contact-token', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Could not load timing token');
    }

    const result = await response.json();
    timingToken = result.token;
  } catch (error) {
    console.error('Contact form initialization failed:', error);
  }
}

loadTimingToken();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  const data = Object.fromEntries(new FormData(form));
data.timingToken = timingToken;

try {
  if (!timingToken) {
    throw new Error(
      'The contact form could not initialize. Please refresh the page and try again.'
    );
  }

  const response = await fetch('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Something went wrong.');
    }

    form.reset();
    statusEl.textContent = "Thanks, we'll be in touch within one business day.";
    statusEl.classList.add('form-status--success');
  } catch (error) {
    statusEl.textContent = error.message || 'Something went wrong. Please email hello@calicomedia.co instead.';
    statusEl.classList.add('form-status--error');
  } finally {
    button.disabled = false;
  }
});
