document.addEventListener('DOMContentLoaded', function () {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const selectedLang = document.getElementById('selected-lang');
    const searchButton = document.getElementById('search-button');
    const loadingSpinner = document.getElementById('loading-search');

    // Toggle dropdown menu visibility
    dropdownTrigger.addEventListener('click', function () {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Update selected language and close dropdown on item click
    dropdownItems.forEach(item => {
        item.addEventListener('click', function () {
            selectedLang.textContent = this.textContent;
            dropdownTrigger.setAttribute('data-value', this.getAttribute('data-value'));
            dropdownMenu.style.display = 'none';
        });
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', function (event) {
        if (!dropdownTrigger.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Handle search button click
    searchButton.addEventListener('click', function () {
        const query = document.getElementById('query').value;
        const maxResults = document.getElementById('max_results').value;
        const language = dropdownTrigger.getAttribute('data-value');

        // Validate input
        if (!query) {
            alert('Please enter a search query.');
            return;
        }

        // Show loading spinner
        loadingSpinner.style.display = 'block';

        // Perform search request
        fetch(`/search?query=${encodeURIComponent(query)}&max_results=${encodeURIComponent(maxResults)}&language=${encodeURIComponent(language)}`)
            .then(response => response.json())
            .then(data => {
                displayResults(data);
                loadingSpinner.style.display = 'none';
            })
            .catch(error => {
                console.error('Error:', error);
                loadingSpinner.style.display = 'none';
            });
    });

    // Display search results
    function displayResults(repos) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = ''; // Clear previous results

        if (repos.length === 0) {
            resultsContainer.innerHTML = '<p>No repositories found.</p>';
            return;
        }

        repos.forEach(repo => {
            const repoElement = document.createElement('div');
            repoElement.className = 'repo';
            repoElement.innerHTML = `
                <h2 class="repo-name">${repo.name}</h2>
                <p><i class="fas fa-user"></i> Owner: ${repo.owner}</p>
                <p><i class="fas fa-star"></i> Stars: ${repo.stars}</p>
                <p><i class="fas fa-code-branch"></i> Forks: ${repo.forks}</p>
                <p><i class="fas fa-exclamation-circle"></i> Open Issues: ${repo.open_issues}</p>
                <p><i class="fas fa-book"></i> License: ${repo.license}</p>
                <p><i class="fas fa-calendar-alt"></i> Last Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
                <p><i class="fas fa-info-circle"></i> Description: ${repo.description || 'No description available'}</p>
                <p><i class="fas fa-link"></i> <a href="${repo.html_url}" target="_blank">URL</a></p>
                <button class="button is-link clone-button" data-repo-url="${repo.clone_url}" data-repo-name="${repo.name}">Clone</button>
                <hr>
            `;
            resultsContainer.appendChild(repoElement);
        });

        // Add event listeners for clone buttons
        const cloneButtons = document.querySelectorAll('.clone-button');
        cloneButtons.forEach(button => {
            button.addEventListener('click', function () {
                const repoUrl = this.getAttribute('data-repo-url');
                const repoName = this.getAttribute('data-repo-name');
                this.textContent = 'Cloning...';

                fetch(`/clone?repo_url=${encodeURIComponent(repoUrl)}&repo_name=${encodeURIComponent(repoName)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.textContent = 'Cloned';
                        } else {
                            this.textContent = 'Failed to Clone';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        this.textContent = 'Failed to Clone';
                    });
            });
        });
    }
});
