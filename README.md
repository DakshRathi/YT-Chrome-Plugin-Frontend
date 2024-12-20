# YouTube Comment Sentiment Analysis Chrome Extension 🚀

This Chrome extension allows users to analyze YouTube video comments directly from their browser. It provides insights such as comment sentiment distribution, average sentiment scores, word clouds, and trends over time.

# Table of Contents 📑

- [Features](#features-)
- [Demonstration](#demonstration-)
- [Installation](#installation-)
   - [Prerequisites](#prerequisites-)
   - [Steps](#steps-)
- [Usage](#usage-)
- [API Integration](#api-integration-)
   - [Backend Endpoints Used](#backend-endpoints-used-)
- [Backend Repository](#backend-repository-)
- [Download and Start Docker Image](#download-and-start-docker-image-)
- [File Structure](#file-structure-)
- [Technologies Used](#technologies-used-)
- [Contributing](#contributing-)
   - [Steps to Contribute](#steps-to-contribute-)
- [License](#license-)
- [Author](#author-)


## Features 🌟

- **Fetch YouTube Comments:** Extracts up to 500 comments from a YouTube video 📹.
- **Sentiment Analysis:** Analyzes comment sentiments as positive, neutral, or negative using a backend service 🤖.
- **Analytics Summary:** Displays metrics such as average comment length, sentiment scores, and unique commenters 📊.
- **Visualization:**
  - Sentiment trend graphs over time 📈.
  - Word cloud visualization of comment keywords 🌐.
- **AI-Generated Summary:** Summarizes recurring themes and feedback using LLM-powered APIs 🧠.
- **Top Comments Display:** Highlights top 50 comments with their respective sentiments 💬.

## Demonstration 🎥
- Watch a video demonstration of the project [here](https://drive.google.com/file/d/1UTHbLKF0OUMFRKTS92f9uY2nt9AaHBLE/view?usp=sharing).

## Installation ⚙️

### Prerequisites 🔧
Ensure the following software is installed on your system:
- **Node.js** (for local development and testing)

### Steps 📝

1. Clone the repository:
   ```bash
   git clone https://github.com/DakshRathi/YT-Chrome-Plugin-Frontend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd YT-Chrome-Plugin-Frontend
   ```
3. Install dependencies for local testing:
   ```bash
   npm install
   ```
4. **Add your YouTube API Key, backend URL running Docker image, and Google Generative API Key in the JavaScript code.**  
   Update the following variables in `popup.js`:
   - `YT_API_KEY` (line 3 of `popup.js`)
   - `API_URL` (line 4 of `popup.js`)
   - `apiKey` (line 257 of `popup.js`)

5. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable “Developer mode” in the top-right corner 🔨.
   - Click on “Load unpacked” and select the project folder 📂.

## Usage 🚀

1. Open a YouTube video in your browser 🎥.
2. Click on the extension icon in the Chrome toolbar 🛠️.
3. Analyze the comment sentiment and view interactive visualizations in the popup window 📊.

## API Integration 🔌

This extension communicates with a backend service to perform advanced sentiment analysis and generate visualizations.

### Backend Endpoints Used 🌐
- **`/predict_with_timestamps`:** Returns sentiment predictions for fetched comments.
- **`/generate_trend_graph`:** Generates and returns a sentiment trend graph 📉.
- **`/generate_wordcloud`:** Creates a word cloud from comment data 💬.
- **`/process_comments`:** Processes comments to be supplied to LLM for detailed insights ✍️.


## Backend Repository 📂

To explore the backend code, visit the [Comment Sentiment Analysis repository](https://github.com/DakshRathi/Comment-Sentiment-Analysis).

## Download and Start Docker Image 🐳

1. You can pull the latest version of the Docker image from the public Amazon ECR repository using the following command:

```bash
docker pull public.ecr.aws/m3t3s7a1/yt-plugin:latest
```

2. Run the Docker container:

```bash
docker run -p 8000:5000 sentiment-analysis-backend
```

This will start the backend service, which will be accessible at `http://localhost:8000`. (add this url to line 4 of popup.js)

## File Structure 🗂️

```plaintext
yt-comment-sentiment-extension/
├── manifest.json          # Chrome extension manifest file 📑
├── popup.html             # HTML for the extension popup 🌍
├── popup.js               # Main JavaScript file for fetching data and rendering UI 💻
├── styles.css             # Styling for the extension popup 🎨
└── README.md              # Documentation for the repository 📚
```

## Technologies Used ⚡

- **Frontend:** JavaScript, HTML, CSS 🖥️
- **APIs:** YouTube Data API v3, Custom Backend API 🔗
- **Visualization:** Trend graphs, Word Clouds 📈

## Contributing 💡

Contributions are welcome! If you have suggestions for new features or find a bug, feel free to open an issue or submit a pull request.

### Steps to Contribute 🤝

1. Fork the repository 🍴.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-or-bug-branch-name
   ```
3. Make changes and commit:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-or-bug-branch-name
   ```
5. Open a pull request on the main repository 🔄.

## License 📝

Copyright 2024 Daksh Rathi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
This project is licensed under the MIT License.

## Author 👨‍💻

Developed and maintained by **Daksh Rathi**.
