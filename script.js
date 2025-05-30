
let captchaCode = '';
let captchaAttempts = 0;

document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('order-form');
  
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showCaptchaModal();
    });
  }

  // Allow submitting captcha with Enter key
  const captchaInput = document.getElementById('captchaInput');
  if (captchaInput) {
    captchaInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        validateCaptcha();
      }
    });
  }
});

function generateCaptcha() {
  captchaCode = Math.floor(1000 + Math.random() * 9000).toString();
  const captchaDisplay = document.getElementById('captchaDisplay');
  if (captchaDisplay) {
    captchaDisplay.textContent = captchaCode;
  }
}

function showCaptchaModal() {
  generateCaptcha();
  const captchaModal = document.getElementById('captchaModal');
  if (captchaModal) {
    captchaModal.style.display = 'block';
    const captchaInput = document.getElementById('captchaInput');
    if (captchaInput) {
      captchaInput.value = '';
      captchaInput.focus();
    }
  }
}

function closeCaptchaModal() {
  const captchaModal = document.getElementById('captchaModal');
  if (captchaModal) {
    captchaModal.style.display = 'none';
  }
}

function validateCaptcha() {
  const captchaInput = document.getElementById('captchaInput');
  if (!captchaInput) return;
  
  const input = captchaInput.value;
  if (input === captchaCode) {
    closeCaptchaModal();
    captchaAttempts = 0;
    submitForm();
  } else {
    captchaAttempts++;
    if (captchaAttempts >= 3) {
      alert('تعداد تلاش‌های شما بیش از حد مجاز است. صفحه بازنشانی می‌شود.');
      location.reload();
      return;
    }
    alert('کد وارد شده اشتباه است. لطفا دوباره تلاش کنید.');
    generateCaptcha();
    captchaInput.value = '';
  }
}

function submitForm() {
  const orderForm = document.getElementById('order-form');
  if (!orderForm) return;
  
  // Get form data
  const formData = new FormData(orderForm);
  const orderData = {
    name: formData.get('name'),
    telegram: formData.get('telegram'),
    country: formData.get('country'),
    message: formData.get('message')
  };

  // Validate form data
  if (!validateForm(orderData)) {
    return;
  }

  try {
    // Submit order to server
    submitOrder(orderData)
      .then(result => {
        // Show success message
        showNotification('سفارش شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.', 'success');
        
        // Reset form
        orderForm.reset();
      })
      .catch(error => {
        showNotification('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.', 'error');
        console.error('Error submitting order:', error);
      });
  } catch (error) {
    showNotification('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.', 'error');
    console.error('Error submitting order:', error);
  }
}

// Form validation
function validateForm(data) {
  // Check required fields
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'message' && (!value || value.trim() === '')) {
      showNotification(`لطفا ${getFieldLabel(key)} را وارد کنید`, 'error');
      return false;
    }
  }

  return true;
}

// Get field label for error messages
function getFieldLabel(fieldName) {
  const labels = {
    name: 'نام و نام خانوادگی',
    telegram: 'آیدی تلگرام',
    country: 'کشور'
  };

  return labels[fieldName] || fieldName;
}

// Submit order to server and telegram bot
async function submitOrder(orderData) {
  try {
    console.log('Order data:', orderData);

    // Send order data to the worker endpoint
    const response = await fetch('https://telegram-66-bot.amirvictus2024.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'new_order',
        data: orderData
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'خطا در ارسال سفارش');
    }

    return {
      success: true,
      message: 'سفارش با موفقیت ثبت و به تلگرام ارسال شد'
    };
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add icon based on type
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  notification.prepend(icon);

  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-notification';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => notification.remove();
  notification.appendChild(closeBtn);

  // Add to document
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    z-index: 1000;
    display: flex;
    align-items: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    min-width: 280px;
    max-width: 400px;
    text-align: right;
    direction: rtl;
  }

  .notification i {
    margin-left: 10px;
    font-size: 1.2rem;
  }

  .notification.success {
    background-color: #4CAF50;
    color: white;
  }

  .notification.error {
    background-color: #F44336;
    color: white;
  }

  .notification.info {
    background-color: #2196F3;
    color: white;
  }

  .close-notification {
    position: absolute;
    top: 5px;
    left: 10px;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .close-notification:hover {
    opacity: 1;
  }

  .fade-out {
    opacity: 0;
    transition: opacity 0.5s ease;
  }
`;
document.head.appendChild(notificationStyles);
