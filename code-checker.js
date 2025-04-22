// This file can be included in your HTML with a script tag:
// <script src="code-checker.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const codeForm = document.getElementById('code-form');
    const resultsSection = document.getElementById('results');
    const spinner = document.getElementById('spinner');
    const pasteContainer = document.getElementById('paste-container');
    const uploadContainer = document.getElementById('upload-container');
    const codeInput = document.getElementById('code-input');
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    const filePreview = document.getElementById('file-preview');
    const filePreviewContent = document.getElementById('file-preview-content');
    const analyzeButton = document.getElementById('analyze-button');
    const languageSelect = document.getElementById('language');
    const thoroughnessSlider = document.getElementById('thoroughness');
    
    // Example code snippets for different languages
    const exampleCodes = {
        javascript: `// Simple JavaScript function with some issues
function processData(data) {
  // This is a bug - should check if data exists first
  let results = [];
  
  for (let i = 0; i < data.length; i++) {
    // Inefficient data processing
    results.push({
      id: data[i].id,
      value: data[i].value * 2
    });
  }
  
  // No error handling here
  return JSON.stringify(results);
}

// Hard-coded API key (security issue)
const API_KEY = "1234567890abcdef";

async function fetchData() {
  const response = await fetch("https://api.example.com/data?key=" + API_KEY);
  const data = await response.json();
  return processData(data);
}`,
        python: `# Simple Python function with some issues
import json
import requests

# Hard-coded API key (security issue)
API_KEY = "1234567890abcdef"

def process_data(data):
    # This is a bug - should check if data exists first
    results = []
    
    # Inefficient data processing
    for item in data:
        results.append({
            "id": item["id"],
            "value": item["value"] * 2
        })
    
    # No error handling here
    return json.dumps(results)

def fetch_data():
    response = requests.get(f"https://api.example.com/data?key={API_KEY}")
    data = response.json()
    return process_data(data)`,
        java: `// Simple Java class with some issues
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.json.JSONArray;
import org.json.JSONObject;

public class DataProcessor {
    // Hard-coded API key (security issue)
    private static final String API_KEY = "1234567890abcdef";
    
    public String processData(JSONArray data) {
        // This is a bug - should check if data exists first
        JSONArray results = new JSONArray();
        
        // Inefficient data processing
        for (int i = 0; i < data.length(); i++) {
            JSONObject item = data.getJSONObject(i);
            JSONObject result = new JSONObject();
            result.put("id", item.getString("id"));
            result.put("value", item.getInt("value") * 2);
            results.put(result);
        }
        
        // No error handling here
        return results.toString();
    }
    
    public String fetchData() {
        try {
            URL url = new URL("https://api.example.com/data?key=" + API_KEY);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            
            JSONArray data = new JSONArray(response.toString());
            return processData(data);
        } catch (Exception e) {
            // Poor error handling
            return "Error";
        }
    }
}`
    };
    
    // Add example code buttons
    const exampleButtonsContainer = document.createElement('div');
    exampleButtonsContainer.className = 'example-buttons mt-2';
    exampleButtonsContainer.innerHTML = '<label>Try an example:</label>';
    
    Object.keys(exampleCodes).forEach(lang => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'example-button';
        button.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
        button.dataset.language = lang;
        
        button.addEventListener('click', function() {
            codeInput.value = exampleCodes[lang];
            languageSelect.value = lang;
            
            // Switch to paste mode if in upload mode
            document.querySelector('input[name="input-method"][value="paste"]').checked = true;
            pasteContainer.classList.remove('hidden');
            uploadContainer.classList.add('hidden');
        });
        
        exampleButtonsContainer.appendChild(button);
    });
    
    pasteContainer.appendChild(exampleButtonsContainer);
    
    // Input method toggle
    const radioButtons = document.querySelectorAll('input[name="input-method"]');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'paste') {
                pasteContainer.classList.remove('hidden');
                uploadContainer.classList.add('hidden');
            } else {
                pasteContainer.classList.add('hidden');
                uploadContainer.classList.remove('hidden');
            }
        });
    });
    
    // File upload handling
    fileUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileName.textContent = `Selected file: ${file.name}`;
            
            // Auto-select language based on file extension
            const extension = file.name.split('.').pop().toLowerCase();
            const extensionToLanguage = {
                'js': 'javascript',
                'py': 'python',
                'java': 'java',
                'cpp': 'cpp',
                'go': 'go',
                'rb': 'ruby',
                'php': 'php',
                'swift': 'swift',
                'ts': 'typescript',
                'rs': 'rust'
            };
            
            if (extensionToLanguage[extension]) {
                languageSelect.value = extensionToLanguage[extension];
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                // Show preview of the first 500 characters
                filePreviewContent.textContent = content.length > 500 ? 
                    content.substring(0, 500) + '...' : content;
                filePreview.classList.remove('hidden');
            };
            reader.readAsText(file);
        }
    });
    
    // Form validation
    function validateForm() {
        const inputMethod = document.querySelector('input[name="input-method"]:checked').value;
        
        if (inputMethod === 'paste' && !codeInput.value.trim()) {
            showError('Please enter some code');
            return false;
        }
        
        if (inputMethod === 'upload' && (!fileUpload.files || !fileUpload.files[0])) {
            showError('Please select a file');
            return false;
        }
        
        return true;
    }
    
    function showError(message) {
        // Create error element if it doesn't exist
        let errorEl = document.getElementById('form-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'form-error';
            errorEl.className = 'error-message';
            errorEl.style.color = '#F44336';
            errorEl.style.marginTop = '0.5rem';
            errorEl.style.marginBottom = '0.5rem';
            analyzeButton.parentNode.insertBefore(errorEl, analyzeButton);
        }
        
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
    
    // Form submission
    codeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show spinner and disable button
        spinner.style.display = 'block';
        analyzeButton.disabled = true;
        
        // Get form data
        const inputMethod = document.querySelector('input[name="input-method"]:checked').value;
        let codeInput;
        
        if (inputMethod === 'paste') {
            codeInput = document.getElementById('code-input').value;
            processAnalysis(codeInput);
        } else {
            const fileInput = document.getElementById('file-upload');
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    codeInput = e.target.result;
                    processAnalysis(codeInput);
                };
                reader.readAsText(fileInput.files[0]);
            }
        }
    });
    
    function processAnalysis(codeInput) {
        const language = document.getElementById('language').value;
        const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
            .map(checkbox => checkbox.value);
        const thoroughness = document.getElementById('thoroughness').value;
        
        // In a real application, you would send this data to your backend API
        // For example:
        /*
        fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: codeInput,
                language: language,
                preferences: preferences,
                thoroughness: thoroughness
            })
        })
        .then(response => response.json())
        .then(data => {
            displayResults(codeInput, data);
            spinner.style.display = 'none';
            analyzeButton.disabled = false;
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred during analysis');
            spinner.style.display = 'none';
            analyzeButton.disabled = false;
        });
        */
        
        // For this example, we'll simulate a response after a delay
        setTimeout(() => {
            // Generate dynamic response based on code and thoroughness
            const response = generateMockResponse(codeInput, language, thoroughness);
            
            // Display results
            displayResults(codeInput, response);
            
            // Hide spinner and enable button
            spinner.style.display = 'none';
            analyzeButton.disabled = false;
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    }
    
    function generateMockResponse(code, language, thoroughness) {
        // Calculate issues based on code content and thoroughness
        const linesOfCode = code.split('\n').length;
        const complexity = Math.min(10, Math.ceil(linesOfCode / 10));
        
        // More thorough analysis finds more issues
        const thoroughnessMultiplier = thoroughness / 3;
        
        // Calculate issue counts
        const bugs = Math.floor(Math.random() * 3 * thoroughnessMultiplier) + 1;
        const securityVulnerabilities = Math.floor(Math.random() * 2 * thoroughnessMultiplier);
        const performanceIssues = Math.floor(Math.random() * 3 * thoroughnessMultiplier);
        
        // Calculate overall score (10 - issues, with thoroughness adjustment)
        let overallScore = 10 - ((bugs + securityVulnerabilities * 1.5 + performanceIssues * 0.5) / thoroughnessMultiplier);
        overallScore = Math.max(1, Math.min(10, Math.round(overallScore)));
        
        // Generate fixed code with some simple transformations
        let fixedCode = code
            .replace(/\/\/ This is a bug/g, '// This bug was fixed')
            .replace(/\/\/ Hard-coded API key/g, '// Using environment variable for API key')
            .replace(/const API_KEY = ".*"/g, 'const API_KEY = process.env.API_KEY')
            .replace(/API_KEY = ".*"/g, 'API_KEY = os.getenv("API_KEY")')
            .replace(/private static final String API_KEY = ".*"/g, 'private static final String API_KEY = System.getenv("API_KEY")');
        
        // More complex transformations for performance improvements
        if (language === 'javascript') {
            fixedCode = fixedCode
                .replace(/for \(let i = 0; i < (\w+)\.length; i\+\+\) {[\s\S]*?}/, (match, array) => {
                    return `// Using map for better performance
const results = ${array}.map(item => ({
  id: item.id,
  value: item.value * 2
}));`;
                });
        } else if (language === 'python') {
            fixedCode = fixedCode
                .replace(/for item in (\w+):[\s\S]*?(\s{4})results\.append\({[\s\S]*?}\)/, (match, array, indent) => {
                    return `# Using list comprehension for better performance
results = [{"id": item["id"], "value": item["value"] * 2} for item in ${array}]`;
                });
        }
        
        // Add error handling
        if (fixedCode.includes('try') === false && fixedCode.includes('catch') === false) {
            fixedCode = fixedCode.replace(/async function fetchData\(\) {/, `async function fetchData() {
  try {`);
            fixedCode = fixedCode.replace(/return processData\(data\);/, `return processData(data);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    throw error;
  }`);
        }
        
        // Generate suggestions based on common issues
        const suggestions = [];
        
        // Security suggestions
        if (code.includes('API_KEY') && code.includes('"')) {
            suggestions.push({
                issue: "Hardcoded API key",
                recommendation: "Store API keys in environment variables or a secure configuration system",
                impact: "Hardcoded credentials can be exposed if code is shared or committed to version control",
                priority: "high"
            });
        }
        
        // Error handling suggestions
        if (!code.includes('try') || !code.includes('catch')) {
            suggestions.push({
                issue: "Missing error handling",
                recommendation: "Add proper try/catch blocks around API calls and data processing",
                impact: "Unhandled exceptions can cause application crashes and poor user experience",
                priority: "medium"
            });
        }
        
        // Performance suggestions
        if (code.includes('for (') || code.includes('for ')) {
            suggestions.push({
                issue: "Inefficient data processing in loop",
                recommendation: language === 'javascript' ? 
                    "Use map/filter/reduce methods instead of traditional for loops" : 
                    language === 'python' ? 
                        "Use list comprehensions or built-in functions instead of for loops" :
                        "Consider using Stream API for more efficient data processing",
                impact: "For loops can be less performant and harder to read than functional alternatives",
                priority: "low"
            });
        }
        
        // Input validation suggestions
        if (!code.includes('undefined') && !code.includes('null') && !code.includes('None')) {
            suggestions.push({
                issue: "Missing input validation",
                recommendation: "Add checks for null/undefined values before processing data",
                impact: "Can lead to runtime errors when processing invalid input",
                priority: "medium"
            });
        }
        
        // Generate summary
        let summary = `The code analysis identified ${bugs} bug(s), ${securityVulnerabilities} security issue(s), and ${performanceIssues} performance concern(s). `;
        
        if (overallScore >= 8) {
            summary += "Overall, the code is well-structured but could benefit from the suggested improvements.";
        } else if (overallScore >= 5) {
            summary += "The code has several issues that should be addressed, particularly around security and error handling.";
        } else {
            summary += "The code requires significant improvements in multiple areas. Consider refactoring with a focus on security and robustness.";
        }
        
        return {
            overall_quality_score: overallScore,
            bugs: bugs,
            security_vulnerabilities: securityVulnerabilities,
            performance_issues: performanceIssues,
            fixed_code: fixedCode,
            suggestions: suggestions,
            summary: summary
        };
    }
    
    function displayResults(originalCode, results) {
        // Update metrics
        document.getElementById('quality-score').textContent = `${results.overall_quality_score}/10`;
        document.getElementById('bugs-count').textContent = results.bugs;
        document.getElementById('security-count').textContent = results.security_vulnerabilities;
        document.getElementById('performance-count').textContent = results.performance_issues;
        
        // Apply color coding to metrics based on values
        const qualityEl = document.getElementById('quality-score').parentElement;
        qualityEl.style.color = results.overall_quality_score >= 8 ? '#4CAF50' : 
                               results.overall_quality_score >= 5 ? '#FF9800' : '#F44336';
        
        // Update code comparison
        document.getElementById('original-code').textContent = originalCode;
        document.getElementById('fixed-code').textContent = results.fixed_code;
        
        // Syntax highlighting for code blocks (would require a library like highlight.js)
        // In a real application, you would add syntax highlighting here
        
        // Update suggestions
        const suggestionsContainer = document.getElementById('suggestions-container');
        suggestionsContainer.innerHTML = '';
        
        if (results.suggestions && results.suggestions.length > 0) {
            results.suggestions.forEach((suggestion, index) => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion';
                
                const priorityColor = suggestion.priority === 'high' ? '#F44336' : 
                                     suggestion.priority === 'medium' ? '#FF9800' : '#4CAF50';
                
                suggestionEl.innerHTML = `
                    <div class="suggestion-header" onclick="toggleSuggestion(${index})">
                        ${index + 1}. ${suggestion.issue}
                        <span style="color: ${priorityColor}">(${suggestion.priority})</span>
                    </div>
                    <div id="suggestion-content-${index}" class="suggestion-content">
                        <p><strong>Recommendation:</strong> ${suggestion.recommendation}</p>
                        <p><strong>Impact:</strong> ${suggestion.impact}</p>
                    </div>
                `;
                suggestionsContainer.appendChild(suggestionEl);
            });
        } else {
            suggestionsContainer.innerHTML = '<div class="card">No specific issues found in your code.</div>';
        }
        
        // Update summary
        document.getElementById('summary').innerHTML = `<p>${results.summary}</p>`;
        
        // Add copy buttons for code blocks
        addCopyButtons();
    }
    
    // Add copy buttons to code blocks
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('.code-block');
        
        codeBlocks.forEach((block, index) => {
            // Skip if button already exists
            if (block.querySelector('.copy-button')) return;
            
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.textContent = 'Copy';
            button.style.position = 'absolute';
            button.style.top = '0.5rem';
            button.style.right = '0.5rem';
            button.style.padding = '0.25rem 0.5rem';
            button.style.fontSize = '0.8rem';
            button.style.backgroundColor = '#f0f0f0';
            button.style.border = '1px solid #ddd';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            
            // Ensure the code block has relative positioning
            block.style.position = 'relative';
            
            button.addEventListener('click', function() {
                const codeText = block.querySelector('pre').textContent;
                navigator.clipboard.writeText(codeText).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                });
            });
            
            block.appendChild(button);
        });
    }
    
    // Handle suggestion toggle
    window.toggleSuggestion = function(index) {
        const content = document.getElementById(`suggestion-content-${index}`);
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    };
    
    // Add feature to download fixed code
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-fixed-code';
    downloadButton.textContent = '⬇️ Download Fixed Code';
    downloadButton.style.marginTop = '1rem';
    downloadButton.style.display = 'none';
    
    resultsSection.appendChild(downloadButton);
    
    downloadButton.addEventListener('click', function() {
        const fixedCode = document.getElementById('fixed-code').textContent;
        const blob = new Blob([fixedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fixed-code.${languageSelect.value.toLowerCase() === 'javascript' ? 'js' : 
                               languageSelect.value.toLowerCase() === 'python' ? 'py' : 
                               languageSelect.value.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Show download button when results are displayed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'style' && mutation.target.style.display === 'block') {
                downloadButton.style.display = 'block';
            }
        });
    });
    
    observer.observe(resultsSection, { 
        attributes: true, 
        attributeFilter: ['style'] 
    });
    
    // Add dark mode toggle
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.textContent = '🌙';
    darkModeToggle.style.position = 'fixed';
    darkModeToggle.style.bottom = '1rem';
    darkModeToggle.style.right = '1rem';
    darkModeToggle.style.borderRadius = '50%';
    darkModeToggle.style.width = '40px';
    darkModeToggle.style.height = '40px';
    darkModeToggle.style.fontSize = '1.2rem';
    darkModeToggle.style.backgroundColor = '#f0f0f0';
    darkModeToggle.style.border = '1px solid #ddd';
    darkModeToggle.style.cursor = 'pointer';
    darkModeToggle.style.zIndex = '1000';
    
    document.body.appendChild(darkModeToggle);
    
    // Check for saved theme preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
    
    // Add dark mode styles
    const darkModeStyles = document.createElement('style');
    darkModeStyles.textContent = `
        body.dark-mode {
            background-color: #1a1a1a;
            color: #e0e0e0;
        }
        
        body.dark-mode .card,
        body.dark-mode .feature-container,
        body.dark-mode .tip-container,
        body.dark-mode .metric-container,
        body.dark-mode .suggestion {
            background-color: #2a2a2a;
            border-color: #3a3a3a;
        }
        
        body.dark-mode .code-block {
            background-color: #2c2c2c;
            color: #e0e0e0;
        }
        
        body.dark-mode input, 
        body.dark-mode textarea, 
        body.dark-mode select {
            background-color: #333;
            color: #e0e0e0;
            border-color: #444;
        }
        
        body.dark-mode .sub-header,
        body.dark-mode .feature-description,
        body.dark-mode .tip-description,
        body.dark-mode .metric-label {
            color: #aaa;
        }
        
        body.dark-mode button {
            background-color: #5846f6;
        }
        
        body.dark-mode .copy-button,
        body.dark-mode #dark-mode-toggle {
            background-color: #444;
            border-color: #555;
            color: #e0e0e0;
        }
        
        body.dark-mode .file-upload-label {
            background-color: #333;
            border-color: #5846f6;
            color: #e0e0e0;
        }
    `;
    
    document.head.appendChild(darkModeStyles);
});

/* Add JavaScript to handle suggestion toggles properly */
document.addEventListener('DOMContentLoaded', function() {
    // Update the toggleSuggestion function
    window.toggleSuggestion = function(index) {
        const content = document.getElementById(`suggestion-content-${index}`);
        const header = content.previousElementSibling;
        
        if (content.style.display === 'block') {
            content.style.display = 'none';
            content.classList.remove('active');
            header.setAttribute('aria-expanded', 'false');
        } else {
            content.style.display = 'block';
            content.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
        }
    };
    
    // Update slider background as it moves
    const slider = document.getElementById('thoroughness');
    if (slider) {
        slider.addEventListener('input', function() {
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            const val = parseInt(this.value);
            const percentage = ((val - min) * 100) / (max - min);
            this.style.backgroundSize = percentage + '% 100%';
        });
        
        // Initialize slider position
        slider.style.setProperty('--value', slider.value);
        slider.style.setProperty('--min', slider.min);
        slider.style.setProperty('--max', slider.max);
        slider.style.backgroundSize = ((slider.value - slider.min) * 100) / (slider.max - slider.min) + '% 100%';
    }
    
    // Add copy functionality to code blocks
    document.querySelectorAll('.code-block').forEach(block => {
        block.addEventListener('click', function(e) {
            if (e.target === this || e.target === this.querySelector('pre')) {
                const textToCopy = this.querySelector('pre').textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show feedback
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 500);
                });
            }
        });
    });
});