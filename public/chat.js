// Create an EventSource to listen for new messages
new window.EventSource("/sse").onmessage = function(event) {
    window.messages.innerHTML += `<p>${event.data}</p>`;
};

// Handle form submission
window.form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    window.fetch(`/chat?message=${window.input.value}`);
    window.input.value = '';
});