# AI-Powered Todo List

This project is an innovative todo list application that combines blockchain technology with artificial intelligence to create a unique and powerful task management experience. Built on the Aptos blockchain and featuring AI-generated task suggestions, this app offers a seamless way to organize and manage your tasks.

## Features

- **Blockchain-based Task Storage**: Securely store your tasks on the Aptos blockchain.
- **AI Task Generation**: Get AI-generated task suggestions based on your goals.
- **User-friendly Interface**: Clean and intuitive UI built with React and Ant Design.
- **Wallet Integration**: Connect your Aptos wallet to interact with the blockchain.
- **Task Management**: Add, complete, and view tasks with ease.

## Technologies Used

- React
- TypeScript
- Aptos Blockchain
- Google Generative AI (Gemini model)
- Ant Design
- Aptos Wallet Adapter

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn
- An Aptos-compatible wallet (e.g., Petra, Martian)

## Setup and Installation

1. Clone the repository:
   ```
   git clone [your-repo-url]
   cd [your-repo-name]
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Google AI API key:
   ```
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Connect your Aptos wallet using the WalletSelector in the top right corner.
2. If you don't have a todo list, click "Add new list" to create one.
3. Add tasks manually by typing them into the input field and clicking "Add".
4. Use the AI-powered task generation by entering a prompt about your goals and clicking "Generate".
5. Mark tasks as completed by checking the checkbox next to each task.

## Acknowledgments

- Aptos Labs for the blockchain infrastructure and wallet adapter
- Google for the Generative AI capabilities
- The React and Ant Design communities for their excellent tools and documentation