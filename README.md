# Link Chat - AI-Powered Link Q&A Chatbot

A Next.js chatbot application that allows users to input a link URL and ask questions about its content. Built with shadcn/ui for a beautiful, accessible interface.

## Features

- 🔗 **URL Content Loading** - Load and parse any webpage
- 💬 **Intelligent Q&A** - Ask questions about loaded content
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Real-time Responses** - Get instant answers from webpage content
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔒 **Client-Server Architecture** - Secure content processing

## Tech Stack

- **Framework**: Next.js 16+ with TypeScript
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Load a URL**: Enter any valid website URL in the "Load a URL" panel
2. **Ask Questions**: Once loaded, type your questions about the content
3. **Get Answers**: The chatbot will analyze the content and provide relevant answers
4. **Reset**: Click "Reset" to load a new URL

## Project Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts          # API endpoint for processing questions
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── ChatBot.tsx           # Main chatbot component
├── globals.css               # Global styles
├── layout.tsx                # Root layout
└── page.tsx                  # Home page
```

## API Route

### POST `/api/chat`

Processes a URL and question, returns relevant answers from the webpage content.

**Request:**
```json
{
  "url": "https://example.com",
  "question": "What is this about?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "The answer based on the content...",
  "contentPreview": "First 200 characters of the content..."
}
```

## How It Works

1. User submits a URL
2. Server fetches the webpage content
3. HTML is parsed to extract text
4. User asks questions about the content
5. Server performs keyword matching to find relevant sentences
6. Answers are returned to the chat interface

## Limitations

- **Content Size**: Content is limited to ~4000 characters to maintain performance
- **Answer Quality**: Uses simple keyword matching (can be enhanced with AI APIs like OpenAI)
- **Content Type**: Works best with text-based content

## Future Enhancements

- [ ] Integration with OpenAI/Claude API for more intelligent answers
- [ ] Support for PDF files and documents
- [ ] Multi-turn conversations with memory
- [ ] Source citations for answers
- [ ] Dark mode toggle
- [ ] Chat history persistence
- [ ] Support for multiple languages

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting and Formatting

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Note**: For production use, consider integrating with an AI service like OpenAI or Claude to significantly improve answer quality and relevance.
