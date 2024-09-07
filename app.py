from flask import Flask, render_template, request, jsonify
import requests
import os
import git

app = Flask(__name__)

# Set your GitHub token here
GITHUB_TOKEN = 'your_github_token'
GITHUB_API_URL = 'https://api.github.com'
PROJECTS_DIR = 'reps'  # Directory where repos will be cloned

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

def search_repos(query, language=None, max_results=10):
    # Add language filter to the query if specified
    if language:
        query += f"+language:{language}"
    
    url = f"{GITHUB_API_URL}/search/repositories?q={query}&sort=stars&order=desc"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        repos = response.json()['items'][:max_results]
        return repos
    else:
        return None

def clone_repo(repo_url, repo_name):
    # Ensure the projects directory exists
    if not os.path.exists(PROJECTS_DIR):
        os.makedirs(PROJECTS_DIR)

    repo_path = os.path.join(PROJECTS_DIR, repo_name)

    if os.path.exists(repo_path):
        return f"Repository {repo_name} already exists. Skipping download."
    else:
        git.Repo.clone_from(repo_url, repo_path)
        return f"Repository {repo_name} cloned successfully."

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('query')
    max_results = int(request.form.get('max_results', 10))
    language = request.form.get('language', None)
    repos = search_repos(query, language, max_results)
    if repos:
        return jsonify(repos)
    else:
        return jsonify({'error': 'Failed to retrieve data'}), 500

@app.route('/clone', methods=['POST'])
def clone():
    repo_url = request.form.get('repo_url')
    repo_name = request.form.get('repo_name')
    result = clone_repo(repo_url, repo_name)
    return jsonify({'message': result})

if __name__ == '__main__':
    app.run(debug=True)
