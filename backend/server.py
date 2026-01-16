import os
import sys
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import instaloader
import yt_dlp
import uuid
from datetime import datetime

# Initialize Flask
app = Flask(__name__)
CORS(app) # Allow React frontend to access

# Setup Downloads Directory (Temp)
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), 'downloads')
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

# Initialize Instaloader
L = instaloader.Instaloader(
    download_pictures=False,
    download_videos=True,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False
)

def cleanup_old_files():
    # Basic cleanup: remove files older than 1 hour
    # In a real app, you might want more robust cleaning
    pass

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "active", "backend": "python-flask"})

@app.route('/download', methods=['POST'])
def download_media():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL missing"}), 400

    try:
        # Determine platform
        if "instagram.com" in url:
            return download_instagram(url)
        elif "tiktok.com" in url or "youtube.com" in url or "youtu.be" in url:
            return download_ytdlp(url)
        else:
            return jsonify({"error": "Plataforma não suportada nativamente. Use os links externos."}), 400

    except Exception as e:
        print(f"Global Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def download_instagram(url):
    try:
        # InstaLoader needs a shortcode usually, but for Reels/Posts URL parsing:
        if "/reel/" in url or "/p/" in url:
            shortcode = url.split("/reel/")[-1].split("/")[0] if "/reel/" in url else url.split("/p/")[-1].split("/")[0]
            
            post = instaloader.Post.from_shortcode(L.context, shortcode)
            
            # Target Filename
            filename = f"{shortcode}_{uuid.uuid4().hex[:6]}"
            
            # Download
            L.download_post(post, target=filename)
            
            # Configurar caminho real do arquivo
            # Instaloader cria uma pasta com o nome do target
            target_dir = filename
            
            # Find the video file in the folder (it downloads as .mp4 usually)
            # Since we are running from 'backend' dir usually or root, we need absolute paths
            # Note: Instaloader downloads to CWD by default relative to purchase.
            # Let's handle file finding
            
            # For simplicity in this PoC, we will return a success message. 
            # Serving the file back requires finding the specific .mp4 created.
            
            return jsonify({
                "status": "success",
                "message": "Download realizado no servidor! (Implementação básica de teste)",
                "details": "O arquivo foi salvo na pasta do servidor."
            })
            
    except Exception as e:
         # Fallback to yt-dlp for Instagram if Instaloader is strict on login
        return download_ytdlp(url)

def download_ytdlp(url):
    filename_id = uuid.uuid4().hex
    params = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': os.path.join(DOWNLOAD_DIR, f'{filename_id}.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(params) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        
    # Return a direct link to stream it back (in a real scenario)
    # sending the file path for local serving
    return jsonify({
        "status": "success_url",
        "access_url": f"http://localhost:5000/serve/{os.path.basename(filename)}"
    })

@app.route('/serve/<filename>', methods=['GET'])
def serve_file(filename):
    return send_file(os.path.join(DOWNLOAD_DIR, filename), as_attachment=True)

if __name__ == '__main__':
    print("🚀 Servidor de Mídia Iniciado na porta 5000")
    app.run(port=5000, debug=True)
