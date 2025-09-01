let jobs = {};

// Submit new URLs to backend
function submitUrls() {
    const urls = document.getElementById('urls').value
        .split("\n")
        .map(u => u.trim())
        .filter(u => u !== "");
    
    if (urls.length === 0) return alert("Please enter at least one URL");

    fetch('https://YOUR_BACKEND_URL/add_jobs', { // replace with your Render URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
    })
    .then(res => res.json())
    .then(data => {
        data.added_jobs.forEach(job => { jobs[job.job_id] = job; });
    });
}

// Update job statuses from backend
function updateStatus() {
    fetch('https://YOUR_BACKEND_URL/status') // replace with your Render URL
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('jobs');
            container.innerHTML = '';
            for (let job_id in data) {
                let job = data[job_id];
                let html = `<div class="job">
                    URL: ${job.url} <span class="status">${job.status}</span>`;
                if (job.status === "Done") {
                    html += ` - <a href="https://YOUR_BACKEND_URL/downloads/${job.file}" target="_blank">Download</a>`;
                }
                html += `</div>`;
                container.innerHTML += html;
            }
        });
}

// Poll backend every 2 seconds
setInterval(updateStatus, 2000);
