function showLoading(id) {
    document.getElementById(id).style.display = 'inline-block';
}

function hideLoading(id) {
    document.getElementById(id).style.display = 'none';
}

function searchRepos() {
    const query = document.getElementById('query').value;
    const maxResults = document.getElementById('max_results').value;
    const language = document.getElementById('language').value;
    const searchButton = document.getElementById('search-button');

    // Show the search loading spinner
    showLoading('loading-search');
    searchButton.classList.add('is-loading');

    fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${query}&max_results=${maxResults}&language=${language}`
    })
    .then(response => response.json())
    .then(data => {
        // Hide the search loading spinner
        hideLoading('loading-search');
        searchButton.classList.remove('is-loading');

        if (data.error) {
            alert(data.error);
            return;
        }
        displayResults(data);
    });
}

function displayResults(repos) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    repos.forEach(repo => {
        const repoDiv = document.createElement('div');
        repoDiv.className = 'box';
        const cloneButtonId = `clone-button-${repo.name}`;
        
        repoDiv.innerHTML = `
            <p><i class="fas fa-book"></i> <strong>Repository:</strong> ${repo.name}</p>
            <p><i class="fas fa-user"></i> <strong>Owner:</strong> ${repo.owner}</p>
            <p><i class="fas fa-star"></i> <strong>Stars:</strong> ${repo.stars}</p>
            <p><i class="fas fa-code-branch"></i> <strong>Forks:</strong> ${repo.forks}</p>
            <p><i class="fas fa-exclamation-circle"></i> <strong>Open Issues:</strong> ${repo.open_issues}</p>
            <p><i class="fas fa-balance-scale"></i> <strong>License:</strong> ${repo.license}</p>
            <p><i class="fas fa-clock"></i> <strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleString()}</p>
            <p><i class="fas fa-info-circle"></i> <strong>Description:</strong> ${repo.description}</p>
            <p><i class="fas fa-link"></i> <strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p><br>
            <button id="${cloneButtonId}" class="button is-small is-link" onclick="cloneRepo('${repo.clone_url}', '${repo.name}', '${cloneButtonId}')">Clone</button><br>
            <div id="loading-clone-${repo.name}" class="loading-spinner">Cloning...</div>
            <!-- <div class="readme-content"><strong>README Preview:</strong><br>${repo.readme}</div> -->
        `;
        resultsDiv.appendChild(repoDiv);
    });
}

function cloneRepo(repoUrl, repoName, buttonId) {
    const cloneButton = document.getElementById(buttonId);
    const loadingCloneId = `loading-clone-${repoName}`;

    // Show the cloning loading spinner
    cloneButton.classList.add('is-loading');
    showLoading(loadingCloneId);

    fetch('/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `repo_url=${encodeURIComponent(repoUrl)}&repo_name=${encodeURIComponent(repoName)}`
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        
        // Hide the cloning loading spinner
        hideLoading(loadingCloneId);
        cloneButton.classList.remove('is-loading');

        if (data.message.includes("cloned successfully")) {
            cloneButton.textContent = 'Cloned';
            cloneButton.classList.remove('is-link');
            cloneButton.classList.add('is-success');
            cloneButton.disabled = true;
        }
    });
}