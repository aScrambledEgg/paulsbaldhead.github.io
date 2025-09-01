let jobs = {};

function submitUrls() {
    const urls = document.getElementById('urls').value
        .split("\n")
        .filter(u => u.trim() !== "");
    fetch('https://YOUR_BACKEND_URL/add_jobs', {  // replace with your deployed backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
    })
    .then(res => res.json())
    .then(data => {
        data.added_jobs.forEach(job => { jobs[job.job_id] = job; });
    });
}

function updateStatus() {
    fetch('https://YOUR_BACKEND_URL/status')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('jobs');
            container.innerHTML = '';
            for (let job_id in data) {
                let job = data[job_id];
                let html = `<div class="job">
                    URL: ${job.url} <span class="status">${job.status}</span>`;
                if (job.status === "Done") {
                    html += ` - <a href="https://paulsbaldhead-github-io.onrender.com/downloads/${job.file}" target="_blank">Download</a>`;
                }
                html += `</div>`;
                container.innerHTML += html;
            }
        });
}

// Poll every 2 seconds
setInterval(updateStatus, 2000);
