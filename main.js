// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Enhanced delete function with better UX
function deleteBook(id) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this book? This action cannot be undone.</p>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDelete(${id})">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function confirmDelete(id) {
    closeModal();
    const loadingToast = showToast('Deleting book...', 'info');
    
    fetch(`/books/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete book');
        }
        return response.json();
    })
    .then(() => {
        showToast('Book deleted successfully!', 'success');
        // Animate the book card removal
        const bookCard = document.querySelector(`[data-book-id="${id}"]`);
        if (bookCard) {
            bookCard.style.transition = 'all 0.3s ease';
            bookCard.style.transform = 'scale(0.8)';
            bookCard.style.opacity = '0';
            setTimeout(() => bookCard.remove(), 300);
        } else {
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to delete book. Please try again.', 'error');
    });
}

// Search functionality with debouncing
let searchTimeout;
function searchBooks(query) {
    clearTimeout(searchTimeout);
    const searchResults = document.querySelector('.search-results');
    
    // Show loading state
    searchResults.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Searching...</p></div>';
    
    searchTimeout = setTimeout(() => {
        fetch(`/books/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    searchResults.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No books found</p></div>';
                    return;
                }
                
                searchResults.innerHTML = data.map(book => `
                    <div class="book-card" data-book-id="${book.id}">
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            <p>By ${book.author}</p>
                            <p>ISBN: ${book.isbn}</p>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-sm" onclick="viewBook(${book.id})">View</button>
                            <button class="btn btn-sm btn-warning" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                        </div>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error:', error);
                searchResults.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-circle"></i><p>Error searching books</p></div>';
            });
    }, 300);
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            showToast(`${input.name} is required`, 'error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 5}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Fetch all books
function fetchBooks() {
  const tbody = document.querySelector("#booksTable tbody");
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading books...</td></tr>';

  fetch('/books', {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return response.json();
  })
  .then(data => {
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No books found</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(book => `
      <tr data-id="${book.id || book._id}">
        <td>${book.id || book._id || 'N/A'}</td>
        <td>${book.title || 'N/A'}</td>
        <td>${book.author || 'N/A'}</td>
        <td>${book.isbn || 'N/A'}</td>
        <td>${book.quantity || 'N/A'}</td>
        <td>
          <a href="update-book.html?id=${book.id || book._id}" class="btn btn-sm btn-warning">
            <i class="fas fa-edit"></i> Edit
          </a>
        </td>
      </tr>
    `).join('');
  })
  .catch(error => {
    console.error('Error:', error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">
      <i class="fas fa-exclamation-circle"></i> Error loading books. Please try again.
    </td></tr>`;
  });
}

// Call fetchBooks when the page loads
document.addEventListener('DOMContentLoaded', fetchBooks);