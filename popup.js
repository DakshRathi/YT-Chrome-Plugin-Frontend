document.addEventListener("DOMContentLoaded", async () => {
  const outputDiv = document.getElementById("output");
  const YT_API_KEY = 'ENTER_YOUR_API_KEY'; // Replace with your API key
  const API_URL = 'http://yt-plugin-elb-2016020879.eu-north-1.elb.amazonaws.com'; // Replace with your localhost URL running docker image

  // Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = tabs[0].url;
    const youtubeRegex = /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      outputDiv.innerHTML = `<div class="section-title">YouTube Video ID</div><p>${videoId}</p><p>Fetching comments...</p>`;

      const comments = await fetchComments(videoId);
      if (comments.length === 0) {
        outputDiv.innerHTML += "<p>No comments found for this video.</p>";
        return;
      }

      // Remove "Fetching comments..." and show the number of comments fetched
      outputDiv.innerHTML = `<div class="section-title">YouTube Video ID</div><p>${videoId}</p><p>Fetched ${comments.length} comments. Performing sentiment analysis...</p>`;
      
      const predictions = await getSentimentPredictions(comments);

      if (predictions) {
        // Remove "Performing sentiment analysis..." after analysis is complete
        outputDiv.innerHTML = `<div class="section-title">YouTube Video ID</div><p>${videoId}</p><p>Fetched ${comments.length} comments. Sentiment analysis completed.</p>`;
        
        // Process the predictions to get sentiment counts and sentiment data
        const sentimentCounts = { "1": 0, "0": 0, "-1": 0 };
        const sentimentData = []; // For trend graph
        const totalSentimentScore = predictions.reduce((sum, item) => sum + parseInt(item.sentiment), 0);
        predictions.forEach((item, index) => {
          sentimentCounts[item.sentiment]++;
          sentimentData.push({
            timestamp: item.timestamp,
            sentiment: parseInt(item.sentiment)
          });
        });

        // Compute metrics
        const totalComments = comments.length;
        const uniqueCommenters = new Set(comments.map(comment => comment.authorId)).size;
        const totalWords = comments.reduce((sum, comment) => sum + comment.text.split(/\s+/).filter(word => word.length > 0).length, 0);
        const avgWordLength = (totalWords / totalComments).toFixed(2);
        const avgSentimentScore = (totalSentimentScore / totalComments).toFixed(2);

        // Normalize the average sentiment score to a scale of 0 to 10
        const normalizedSentimentScore = (((parseFloat(avgSentimentScore) + 1) / 2) * 10).toFixed(2);

        // Add the Comment Analysis Summary section
        outputDiv.innerHTML += `
          <div class="section">
            <div class="section-title">Comment Analysis Summary</div>
            <div class="metrics-container">
              <div class="metric">
                <div class="metric-title">Total Comments</div>
                <div class="metric-value">${totalComments}</div>
              </div>
              <div class="metric">
                <div class="metric-title">Unique Commenters</div>
                <div class="metric-value">${uniqueCommenters}</div>
              </div>
              <div class="metric">
                <div class="metric-title">Avg Comment Length</div>
                <div class="metric-value">${avgWordLength} words</div>
              </div>
              <div class="metric">
                <div class="metric-title">Avg Sentiment Score</div>
                <div class="metric-value">${normalizedSentimentScore}/10</div>
              </div>
            </div>
          </div>
        `;

        // Add the Sentiment Analysis Results section with sentiment percentages
        const positivePercentage = ((sentimentCounts["1"] / totalComments) * 100).toFixed(2);
        const neutralPercentage = ((sentimentCounts["0"] / totalComments) * 100).toFixed(2);
        const negativePercentage = ((sentimentCounts["-1"] / totalComments) * 100).toFixed(2);

        outputDiv.innerHTML += `
          <div class="section">
            <div class="section-title">Sentiment Analysis Results</div>
            <div class="sentiment-box">
              <div class="sentiment-item positive">
                <div class="sentiment-title">Positive</div>
                <div class="sentiment-value">${positivePercentage}%</div>
              </div>
              <div class="sentiment-item neutral">
                <div class="sentiment-title">Neutral</div>
                <div class="sentiment-value">${neutralPercentage}%</div>
              </div>
              <div class="sentiment-item negative">
                <div class="sentiment-title">Negative</div>
                <div class="sentiment-value">${negativePercentage}%</div>
              </div>
            </div>
          </div>`;

        // Add the Sentiment Trend Graph section
        outputDiv.innerHTML += `
          <div class="section">
            <div class="section-title">Sentiment Trend Over Time</div>
            <div id="trend-graph-container"></div>
          </div>`;

        // Fetch and display the sentiment trend graph
        await fetchAndDisplayTrendGraph(sentimentData);

        // Add the Word Cloud section
        outputDiv.innerHTML += `
          <div class="section">
            <div class="section-title">Comment Wordcloud</div>
            <div id="wordcloud-container"></div>
          </div>`;

        // Fetch and display the word cloud inside the wordcloud-container div
        await fetchAndDisplayWordCloud(comments);

        // Add a section for AI-generated Summary directly
        outputDiv.innerHTML += `
        <div class="section">
          <div class="section-title">AI Generated Summary</div>
          <div id="summary-output" class="summary-section">
            <p>Generating summary...</p>
          </div>
        </div>
        `;

        // Generate the AI summary and update the summary section
        const summaryOutputDiv = document.getElementById("summary-output");

        if (summaryOutputDiv) {
        try {
          const summary = await generateSummary(comments);
          
          // Hide the "Generating summary..." text
          summaryOutputDiv.innerHTML = `<p>${summary}</p>`;
        } catch (error) {
          summaryOutputDiv.innerHTML = `<p>Error generating summary. Please try again.</p>`;
          console.error("Error generating summary:", error);
        }
        } else {
        console.error("Summary output div not found!");
        }
        // Add the top comments section
        outputDiv.innerHTML += `
          <div class="section">
            <div class="section-title">Top 50 Comments with Sentiments</div>
            <ul class="comment-list">
              ${predictions.slice(0, 50).map((item, index) => `
                <li class="comment-item">
                  <span>${index + 1}. ${item.comment}</span><br>
                  <span class="comment-sentiment">Sentiment: <span class="value">${item.sentiment}</span></span>
                </li>`).join('')}
            </ul>
          </div>`;
      }
    } else {
      outputDiv.innerHTML = "<p>This is not a valid YouTube video URL.</p>";
    }
  });

  async function fetchComments(videoId) {
    let comments = [];
    let pageToken = "";
    try {
      while (comments.length < 500) {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&pageToken=${pageToken}&key=${YT_API_KEY}`);
        const data = await response.json();
        if (data.items) {
          data.items.forEach(item => {
            const commentText = item.snippet.topLevelComment.snippet.textOriginal;
            const timestamp = item.snippet.topLevelComment.snippet.publishedAt;
            const authorId = item.snippet.topLevelComment.snippet.authorChannelId?.value || 'Unknown';
            comments.push({ text: commentText, timestamp: timestamp, authorId: authorId });
          });
        }
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      outputDiv.innerHTML += "<p>Error fetching comments.</p>";
    }
    return comments;
  }

  async function getSentimentPredictions(comments) {
    try {
      const response = await fetch(`${API_URL}/predict_with_timestamps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments })
      });
      const result = await response.json();
      if (response.ok) {
        return result; // The result now includes sentiment and timestamp
      } else {
        throw new Error(result.error || 'Error fetching predictions');
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      outputDiv.innerHTML += "<p>Error fetching sentiment predictions.</p>";
      return null;
    }
  }

  async function fetchAndDisplayTrendGraph(sentimentData) {
    try {
      const response = await fetch(`${API_URL}/generate_trend_graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment_data: sentimentData })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch trend graph image');
      }
      const blob = await response.blob();
      const imgURL = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.src = imgURL;
      img.style.width = '100%';
      img.style.maxWidth = '500px';
      document.getElementById('trend-graph-container').appendChild(img);
    } catch (error) {
      console.error("Error fetching or displaying trend graph:", error);
    }
  }

  async function fetchAndDisplayWordCloud(comments) {
    try {
      const response = await fetch(`${API_URL}/generate_wordcloud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch word cloud');
      }
      const blob = await response.blob();
      const imgURL = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.src = imgURL;
      img.style.width = '100%';
      img.style.maxWidth = '500px';
      document.getElementById('wordcloud-container').appendChild(img);
    } catch (error) {
      console.error("Error fetching or displaying word cloud:", error);
    }
  }

  // Function to fetch a summary using Google Gemini
  async function generateSummary(comments) {
    const apiKey = "ENTER_YOUR_API_KEY"; // Replace with your actual API key
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(`${API_URL}/process_comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comments })
        });

        if (!response.ok) {
            throw new Error(`FastAPI Error (${response.status}): ${response.statusText}`);
        }

        const fastApiData = await response.json();
        let processedComments = fastApiData.processed_comments;

        // Step 1: Sanitize the comments by removing non-ASCII characters
        processedComments = processedComments.replace(/[^\x00-\x7F]/g, "");

        // Step 2: Ensure the length is within the API's token limits
        const MAX_LENGTH = 2000;
        const truncatedComments = processedComments.slice(0, MAX_LENGTH);

        // Step 3: Format the prompt as per the curl example
        const prompt = `
            Analyze the overall sentiment (positive, neutral, or negative) and summarize the main themes expressed in these comments.
            Comments:
            ${truncatedComments}
            Please provide a concise response in 5-10 sentences, highlighting any notable trends or recurring topics or points of improvement for creators.
        `.trim();

        // Step 4: Send the request to the LLM API in the correct format
        const llmResponse = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            }),
        });

        if (!llmResponse.ok) {
          throw new Error(`LLM API Error (${llmResponse.status}): ${llmResponse.statusText}`);
        }

        const llmData = await llmResponse.json(); // Parse only once
        console.log("LLM Response Data:", llmData);  // Log or handle the API response
        return llmData?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    } catch (error) {
        console.error("Error generating summary:", error);
        return `Failed to generate summary. Error: ${error.message}`;
    }
  }
});