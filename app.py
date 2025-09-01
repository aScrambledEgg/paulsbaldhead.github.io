from flask import Flask, request, jsonify, send_from_directory
import subprocess, os, uuid
from threading import Thread
from queue import Queue

app = Flask(__name__)
DOWNLOAD_DIR = "./downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

job_queue = Queue()
job_status = {}

def worker():
    while True:
        job_id, url = job_queue.get()
        job_status[job_id]['status'] = "Downloading"
        filename = f"{uuid.uuid4()}.%(ext)s"
        output_path = os.path.join(DOWNLOAD_DIR, filename)
        try:
            subprocess.run([
                "yt-dlp",
                "-x", "--audio-format", "mp3",
                "-o", output_path,
                url
            ], check=True)
            mp3_file = output_path.replace("%(ext)s", "mp3")
            job_status[job_id]['status'] = "Done"
            job_status[job_id]['file'] = os.path.basename(mp3_file)
        except subprocess.CalledProcessError:
            job_status[job_id]['status'] = "Failed"
        job_queue.task_done()

Thread(target=worker, daemon=True).start()

@app.route("/add_jobs", methods=["POST"])
def add_jobs():
    urls = request.json.get("urls", [])
    added_jobs = []
    for url in urls:
        url = url.strip()
        if url:
            job_id = str(uuid.uuid4())[:8]
            job_status[job_id] = {"url": url, "status": "Queued"}
            job_queue.put((job_id, url))
            added_jobs.append({"job_id": job_id, "url": url})
    return jsonify({"added_jobs": added_jobs})

@app.route("/status")
def status():
    return jsonify(job_status)

@app.route("/downloads/<filename>")
def serve_file(filename):
    return send_from_directory(DOWNLOAD_DIR, filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
