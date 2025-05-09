// Function to handle book deletion
function deleteBook(id) {
    if (confirm("Are you sure you want to delete this book?")) {
        fetch(`http://localhost:8080/api/books/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete book');
            }
            alert("Book deleted successfully!");
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error deleting book: " + error.message);
        });
    }
}

// Add book functionality
document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;

            const book = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                isbn: document.getElementById('isbn').value,
                genre: "General",
                availability: true
            };

            fetch('http://localhost:8080/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(book)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || 'Failed to add book');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Book added successfully!
                `;
                document.querySelector('.form-container').prepend(successMessage);

                // Reset form
                addBookForm.reset();

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'books.html';
                }, 1500);
            })
            .catch(error => {
                console.error('Error:', error);
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    Error adding book: ${error.message}
                `;
                document.querySelector('.form-container').prepend(errorMessage);

                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}); 