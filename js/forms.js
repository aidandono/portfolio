// Form Handling & Validation

// Form validation and submission
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearErrors);
        });
    }
});

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields before submission
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Simulate form submission (replace with your actual endpoint)
        await simulateFormSubmission(formData);
        
        // Show success message
        showFormMessage('success', 'Message sent successfully! I\'ll get back to you soon.');
        form.reset();
        
    } catch (error) {
        // Show error message
        showFormMessage('error', 'Oops! Something went wrong. Please try again.');
        console.error('Form submission error:', error);
        
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
    }
}

// Validate entire form
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Remove existing error styling
    field.classList.remove('error');
    removeErrorMessage(field);
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${capitalize(fieldName)} is required`);
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Name validation (no numbers or special characters)
    if (fieldName === 'name' && value) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(value)) {
            showFieldError(field, 'Name should only contain letters and spaces');
            return false;
        }
    }
    
    // Message length validation
    if (fieldName === 'message' && value && value.length < 10) {
        showFieldError(field, 'Message should be at least 10 characters long');
        return false;
    }
    
    // Success styling
    field.classList.add('form-success');
    setTimeout(() => {
        field.classList.remove('form-success');
    }, 600);
    
    return true;
}

// Clear errors on input
function clearErrors(e) {
    const field = e.target;
    field.classList.remove('error');
    removeErrorMessage(field);
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff6b6b';
    errorElement.style.fontSize = '0.9rem';
    errorElement.style.marginTop = '0.5rem';
    errorElement.style.display = 'block';
    
    // Insert after the field
    field.parentNode.appendChild(errorElement);
}

// Remove error message
function removeErrorMessage(field) {
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show form-wide message
function showFormMessage(type, message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.padding = '1rem';
    messageElement.style.borderRadius = '10px';
    messageElement.style.marginTop = '1rem';
    messageElement.style.textAlign = 'center';
    messageElement.style.animation = 'fadeInUp 0.5s ease';
    
    if (type === 'success') {
        messageElement.style.background = 'rgba(0, 255, 0, 0.1)';
        messageElement.style.border = '1px solid rgba(0, 255, 0, 0.3)';
        messageElement.style.color = '#00ff00';
    } else {
        messageElement.style.background = 'rgba(255, 0, 0, 0.1)';
        messageElement.style.border = '1px solid rgba(255, 0, 0, 0.3)';
        messageElement.style.color = '#ff6b6b';
    }
    
    // Insert after form
    const form = document.getElementById('contactForm');
    form.parentNode.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageElement.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 5000);
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) {
                resolve({
                    status: 'success',
                    message: 'Form submitted successfully'
                });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// Utility function to capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Auto-save form data to prevent loss (optional feature)
function autoSaveForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    // Load saved data on page load
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_${input.name}`);
        if (savedValue) {
            input.value = savedValue;
        }
        
        // Save on input
        input.addEventListener('input', () => {
            localStorage.setItem(`form_${input.name}`, input.value);
        });
    });
    
    // Clear saved data on successful submission
    form.addEventListener('submit', () => {
        inputs.forEach(input => {
            localStorage.removeItem(`form_${input.name}`);
        });
    });
}

// Character counter for textarea
function addCharacterCounter() {
    const textarea = document.querySelector('textarea[name="message"]');
    if (!textarea) return;
    
    const maxLength = 500;
    textarea.setAttribute('maxlength', maxLength);
    
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.textAlign = 'right';
    counter.style.fontSize = '0.9rem';
    counter.style.color = '#888';
    counter.style.marginTop = '0.5rem';
    
    textarea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${remaining} characters remaining`;
        
        if (remaining < 50) {
            counter.style.color = '#ff6b6b';
        } else {
            counter.style.color = '#888';
        }
    }
    
    textarea.addEventListener('input', updateCounter);
    updateCounter(); // Initial count
}

// Initialize form enhancements
document.addEventListener('DOMContentLoaded', () => {
    console.log('Form handling initialized');
    
    // Add CSS for form states
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group textarea.error {
            border-color: #ff6b6b !important;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize optional features
    // autoSaveForm(); // Uncomment if you want auto-save
    addCharacterCounter();
});