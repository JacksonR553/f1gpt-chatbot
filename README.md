# F1GPT Chatbot

## Overview
F1GPT is a Retrieval-Augmented Generation (RAG) chatbot specialized in Formula 1 racing information. It uses data scraped from the internet (e.g., Wikipedia, official F1 websites) to provide up-to-date answers beyond the knowledge cutoff of base LLMs like ChatGPT (September 2021). The chatbot is built with JavaScript technologies, leveraging LangChain.js for RAG implementation, Next.js for the frontend, OpenAI for embeddings and text generation, and DataStax Astra DB as a vector database for storing embeddings.

This project follows the freeCodeCamp tutorial by Ania Kubow (video: [Build and Deploy a RAG Chatbot with JavaScript](https://www.youtube.com/watch?v=d-VKYF4Zow0)), which teaches how to create a cost-effective chatbot that augments LLM responses with custom data.

Key benefits:
- Answers questions using recent F1 data (e.g., driver salaries, race winners post-2021).
- Reduces OpenAI costs by relying on retrieved data rather than full LLM queries.
- Can be adapted for any domain by changing the scraped data sources.

## Features
- **RAG Architecture**: Retrieves relevant data from a vector database and augments OpenAI responses for accurate, contextual answers.
- **Data Scraping**: Loads F1-related text from websites, converts to vector embeddings, and stores in a database.
- **Interactive UI**: Simple Next.js interface with pre-made prompt suggestions, chat bubbles, and real-time responses.
- **Up-to-Date Knowledge**: Scrapes live data for responses beyond LLM training cutoffs.
- **Customizable**: Easily swap data sources or LLMs; supports private data (e.g., personal documents).
- **Streaming Responses**: Uses OpenAI streaming for natural, incremental answer generation.
- **Markdown Formatting**: Responses use markdown for readability (e.g., bold, lists).

Example: Asking "Who is the highest-paid F1 driver in 2024?" returns Max Verstappen ($55M), based on scraped data, rather than outdated LLM info (e.g., Lewis Hamilton in 2021).

## Prerequisites
- **Node.js**: Latest version (v20+ recommended).
- **OpenAI Account**: API key for embeddings (text-embedding-3-small) and completions (gpt-4 or gpt-3.5-turbo).
- **DataStax Astra DB**: Free vector database account (sign up at [Astra DB](https://astra.datastax.com/); no credit card required).
- Basic knowledge of Next.js and JavaScript/TypeScript.

## Installation
1. **Clone the Repository**:
   ```
   git clone https://github.com/JacksonR553/f1gpt-chatbot.git
   cd f1gpt-chatbot
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```
   Key packages include: `next`, `react`, `react-dom`, `openai`, `@datastax/astra-db-ts`, `ai` (for useChat hook), and others like `cheerio` for scraping.

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory with the following:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ASTRA_DB_APPLICATION_TOKEN=your_astra_token
   ASTRA_DB_API_ENDPOINT=your_astra_endpoint
   ASTRA_DB_NAMESPACE=default_keyspace
   ASTRA_DB_COLLECTION=your_collection_name (e.g., f1_data)
   ```
   - Get OpenAI key from [OpenAI Dashboard](https://platform.openai.com/account/api-keys).
   - Astra DB details from your DataStax dashboard (create a vector database named e.g., "dbf1").

4. **Load Data into Database**:
   Run the script to scrape F1 websites, generate embeddings, and store them:
   ```
   npx ts-node script/load_db.ts
   ```
   This scrapes sites like F1 Wikipedia pages, driver lists, etc., and populates the Astra DB collection.

5. **Start the Development Server**:
   ```
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- **How the interface look like**:
<img width="1860" height="903" alt="image" src="https://github.com/user-attachments/assets/802c93bf-ecb3-41f3-8625-12dd729b7f67" />

- **Interact with the Chatbot**:
  - Visit the app in your browser.
  - Choose from pre-made prompts (e.g., "Who is the highest-paid F1 driver?") or type your own F1-related question.
  - Submit and view responses in chat bubbles.
  - Responses stream in real-time and use markdown for formatting.

- **Example Questions**:
  - "Who won the 2023 Monaco Grand Prix?" → Max Verstappen (from scraped data).
  - "How much did Lewis Hamilton earn in 2023?" → Accurate figure from recent sources.
  - Custom: Adapt the script to scrape other sites for more data.

- **Deployment**:
  - Deploy to Vercel: Push to GitHub, connect Vercel to the repo, and add env vars in Vercel dashboard.
  - Run `vercel` CLI for quick deployment.

- **Updating Data**:
  - Re-run `load_db.ts` to refresh embeddings with new scraped data.
  - Add more URLs in the script for broader coverage.

## Project Structure
```
nextjs-f1bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Handles POST requests: creates embeddings, queries DB, generates responses with OpenAI.
│   ├── assets/
│   │   ├── background3.jfif        # Background image for UI.
│   │   └── f1logo.png              # F1GPT logo.
│   ├── components/
│   │   ├── bubble.tsx            # Chat message bubble component (user vs. assistant styling).
|   |   ├── LoadingBubble.tsx     # Chat message loading bubble component
│   │   ├── prompt-suggestion-button.tsx # Button for prompt suggestions.
│   │   └── prompt-suggestion-row.tsx    # Row of suggestion buttons.
│   ├── global.css                # Global styles for the app.
│   ├── layout.tsx                # Main layout wrapper.
│   └── page.tsx                  # Core page: chat interface, uses useChat hook for messaging.
├── script/
│   └── load_db.ts                # Script to scrape F1 websites, generate embeddings with OpenAI, and insert into Astra DB.
├── .env.local                    # Environment variables (gitignore'd).
├── .gitignore                    # Git ignore file (e.g., node_modules, .env).
├── next.config.js                # Next.js configuration.
├── package.json                  # Dependencies and scripts.
├── README.md                     # This file.
├── tsconfig.json                 # TypeScript configuration.
└── yarn.lock                     # Dependency lock file (or package-lock.json for npm).
```

- **Key Files Summary**:
  - **load_db.ts**: Connects to Astra DB, scrapes text from F1 URLs using Cheerio, creates embeddings, and stores documents with metadata.
  - **route.ts**: API endpoint for chat; embeds user input, queries similar docs from DB, augments prompt with context, streams OpenAI response.
  - **page.tsx**: Frontend logic; displays chat history, handles input/submit, shows suggestions using components.
  - **Components**: Reusable UI elements for chat bubbles and prompts.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please ensure code follows TypeScript best practices and add tests if applicable.

## Acknowledgments
- Based on the freeCodeCamp tutorial by Ania Kubow.
- Thanks to DataStax for the free vector DB and OpenAI for API access.
- Icons/images: Custom or from public sources (ensure attribution if needed).

For questions, open an issue or contact the repository owner.
