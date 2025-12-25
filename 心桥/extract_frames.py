#!/usr/bin/env python3
import os
import subprocess
import requests
from pathlib import Path

# Configuration
md_file = "/Users/sam/Desktop/work-/work-/心桥/三年级英语.md"
ffmpeg_path = "/Users/sam/Desktop/work-/work-/心桥/ffmpeg"
output_dir = "/Users/sam/Desktop/work-/work-/心桥/三年级英语"
temp_dir = "/Users/sam/Desktop/work-/work-/心桥/temp_videos"

def read_video_links(file_path):
    """Extract video URLs from markdown file"""
    video_links = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by lines and process each line
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        # Look for URLs that contain the video domain
        if 'https://static.17xueba.com' in line:
            # Extract the URL from the line (remove numbering if present)
            if '. ' in line:
                # Handle numbered lines like "1. https://..."
                parts = line.split('. ', 1)
                if len(parts) > 1 and parts[1].startswith('https://'):
                    url = parts[1]
                else:
                    continue
            else:
                url = line

            # Clean up the URL
            url = url.strip()
            if url.startswith('https://static.17xueba.com'):
                video_links.append(url)

    return video_links

def download_video(url, temp_path):
    """Download video from URL to temporary path"""
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(temp_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Downloaded to: {temp_path}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def extract_last_frame(video_path, output_path, ffmpeg_path):
    """Extract the last frame from video using ffmpeg"""
    try:
        # Use -ss to seek to the last 0.1 second and extract 1 frame
        cmd = [
            ffmpeg_path,
            '-sseof', '-0.1',  # Seek to 0.1 seconds before end
            '-i', video_path,
            '-vframes', '1',
            '-q:v', '2',  # High quality
            '-y',  # Overwrite output file
            output_path
        ]

        print(f"Extracting last frame to: {output_path}")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Successfully extracted frame: {output_path}")
        return True

    except subprocess.CalledProcessError as e:
        print(f"Error extracting frame from {video_path}: {e}")
        print(f"FFmpeg stderr: {e.stderr}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

def main():
    # Create necessary directories
    os.makedirs(temp_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # Read video links
    video_links = read_video_links(md_file)
    print(f"Found {len(video_links)} video links")

    success_count = 0

    for i, url in enumerate(video_links, 1):
        try:
            # Generate filenames
            video_filename = f"video_{i:02d}.mp4"
            video_path = os.path.join(temp_dir, video_filename)

            # Extract video ID from URL for output filename
            video_id = url.split('/')[-1].replace('.mp4', '')
            output_filename = f"frame_{i:02d}_{video_id}.jpg"
            output_path = os.path.join(output_dir, output_filename)

            print(f"\nProcessing video {i}/{len(video_links)}")

            # Download video
            if download_video(url, video_path):
                # Extract last frame
                if extract_last_frame(video_path, output_path, ffmpeg_path):
                    success_count += 1

                # Clean up downloaded video
                try:
                    os.remove(video_path)
                    print(f"Cleaned up: {video_path}")
                except:
                    pass

        except Exception as e:
            print(f"Error processing video {i}: {e}")

    print(f"\n=== Summary ===")
    print(f"Total videos: {len(video_links)}")
    print(f"Successfully processed: {success_count}")
    print(f"Failed: {len(video_links) - success_count}")
    print(f"Output directory: {output_dir}")

    # Clean up temp directory
    try:
        os.rmdir(temp_dir)
        print(f"Cleaned up temp directory: {temp_dir}")
    except:
        pass

if __name__ == "__main__":
    main()