import confetti from 'canvas-confetti';

export function initContactComponent() {
  const form = document.getElementById('contact-form');
  const successContainer = document.getElementById('contact-success');
  const resetButton = document.getElementById('reset-contact-form');

  if (!form || !successContainer) return;

  const fields = {
    name: {
      input: document.getElementById('contact-name'),
      error: document.getElementById('name-error'),
      validate: (val) => {
        if (!val.trim()) return 'Name is required.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
    },
    email: {
      input: document.getElementById('contact-email'),
      error: document.getElementById('email-error'),
      validate: (val) => {
        if (!val.trim()) return 'Email address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val.trim()) || val.trim().includes('..')) return 'Please enter a valid email address.';
        return '';
      }
    },
    subject: {
      input: document.getElementById('contact-subject'),
      error: document.getElementById('subject-error'),
      validate: (val) => {
        if (!val.trim()) return 'Subject is required.';
        if (val.trim().length < 3) return 'Subject must be at least 3 characters.';
        return '';
      }
    },
    message: {
      input: document.getElementById('contact-message'),
      error: document.getElementById('message-error'),
      validate: (val) => {
        if (!val.trim()) return 'Message is required.';
        if (val.trim().length < 10) return 'Message must be at least 10 characters.';
        return '';
      }
    }
  };

  // Helper to validate single field
  function validateField(fieldKey) {
    const field = fields[fieldKey];
    if (!field || !field.input) return true;

    const errorMsg = field.validate(field.input.value);

    if (errorMsg) {
      field.input.classList.remove('is-valid');
      field.input.classList.add('is-invalid');
      if (field.error) field.error.textContent = errorMsg;
      return false;
    } else {
      field.input.classList.remove('is-invalid');
      field.input.classList.add('is-valid');
      if (field.error) field.error.textContent = '';
      return true;
    }
  }

  // Attach live input & blur listeners
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (field.input) {
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid')) {
          validateField(key);
        }
      });
      field.input.addEventListener('blur', () => {
        validateField(key);
      });
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(fields).forEach((key) => {
      const fieldValid = validateField(key);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) return;

    // Show Loading state on button
    const submitBtn = document.getElementById('contact-submit');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnIcon = submitBtn ? submitBtn.querySelector('.btn-icon') : null;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';

    // Simulate submission delay
    setTimeout(() => {
      form.reset();
      Object.keys(fields).forEach((key) => {
        if (fields[key].input) {
          fields[key].input.classList.remove('is-valid', 'is-invalid');
        }
      });

      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';

      // Hide form & show success UI
      form.style.display = 'none';
      successContainer.classList.remove('hidden');

      // Trigger Confetti Micro-interaction celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#4facfe', '#7f00ff', '#10b981']
        });
      } catch (err) {
        console.log('Confetti effect triggered.');
      }
    }, 1000);
  });

  // Reset Form Handler
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      successContainer.classList.add('hidden');
      form.style.display = 'block';
    });
  }
}
