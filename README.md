# Tweel

A modern, real-time social media platform inspired by Twitter, built with cutting-edge web technologies. Share your thoughts, connect with others, and stay updated with the latest trends.

![Tweel Logo](public/logo.png)

## ✨ Features

- **Real-time Feed**: Instant updates as new posts appear
- **User Authentication**: Secure sign-in with Google OAuth
- **Rich Posts**: Share text and images with your followers
- **Interactive Engagement**: Like and comment on posts
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Beautiful interface built with Tailwind CSS and Framer Motion

## � Tech Stack

- **[Next.js 15.1.11](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React 19.1.0](https://reactjs.org/)** - UI library
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with real-time database
- **[Framer Motion 12.23.24](https://www.framer.com/motion/)** - Animation library for React
- **[Jotai 2.15.0](https://jotai.org/)** - State management
- **[Heroicons 2.2.0](https://heroicons.com/)** - Icon library
- **[Day.js 1.11.18](https://day.js.org/)** - Date manipulation library
- **[React Responsive Modal 7.1.0](https://github.com/pradel/react-responsive-modal)** - Modal component
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing

## �🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tweel.git
   cd tweel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file in the root directory:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Configure Supabase Database**
   - Run the SQL migrations in your Supabase dashboard to create the necessary tables:
     - `posts` table with columns: id, user_id, name, user_name, user_image, text, image, created_at, timestamp
     - `likes` table with columns: id, post_id, user_id, user_name
     - `comments` table with columns: id, post_id, user_id, name, user_name, user_image, text, created_at
   - Set up storage bucket: `posts_images`

5. **Configure OAuth**
   - In Supabase Dashboard, go to Authentication > Providers
   - Enable Google provider and add your Google OAuth credentials
   - Set the redirect URL to: `http://localhost:3000/auth/callback` (for development)

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) and sign in with Google to start using Tweel!

## 📖 Usage

### Creating a Post

1. Sign in with your Google account
2. Click on the input field at the top of the feed
3. Type your message and optionally add an image
4. Click "Post" to share with your followers

### Engaging with Content

- **Like**: Click the heart icon on any post
- **Comment**: Click the comment icon to add your thoughts
- **Share**: Use the share button to copy the post link

### Navigation

- Use the sidebar to navigate between different sections
- View trending news and suggested users in the widgets panel

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### Project Structure

```
src/
├── app/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── auth/           # Authentication routes
│   └── posts/          # Dynamic post pages
├── store/              # Jotai state management
└── utils/              # Utility functions and Supabase clients
```
