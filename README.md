# Gmail Clone

A local Gmail-like email client for PC, Mac, and Android with IMAP/SMTP support and offline storage.

## Features

- Multiple email accounts support (Gmail, Outlook, Yahoo, etc.)
- Gmail-like UI with sidebar, labels, and search
- IMAP/SMTP integration for fetching and sending emails
- Offline storage with SQLite database
- Cross-platform: Windows, macOS, Linux (Electron) + Android (Capacitor)
- Read, reply, forward, and delete emails
- Star, mark as read, labels
- Search functionality

## Installation

### For Windows/macOS/Linux (Electron)

```bash
# Clone the repository
git clone https://github.com/joostdb/gmail-clone.git
cd gmail-clone

# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build:electron
```

### For Android (Capacitor)

```bash
# Make sure you have Android Studio installed

# Add Android platform
npm run add:android

# Build the web app and sync to Android
npm run build:android

# Open in Android Studio
npm run open:android
```

## Configuration

### Adding an Email Account

1. Click the "+" button in the top-right corner
2. Enter your email address and password
3. Select your provider (Gmail, Outlook, Yahoo) or manually enter IMAP/SMTP details
4. Test the connection
5. Add the account

### Manual IMAP/SMTP Settings

| Provider | IMAP Host | IMAP Port | SMTP Host | SMTP Port |
|----------|-----------|------------|-----------|------------|
| Gmail | imap.gmail.com | 993 | smtp.gmail.com | 465 |
| Outlook | outlook.office365.com | 993 | smtp.office365.com | 587 |
| Yahoo | imap.mail.yahoo.com | 993 | smtp.mail.yahoo.com | 465 |

**Note**: For Gmail, you may need to enable "Less secure apps" or generate an "App password" in your Google Account settings.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Electron
- **Database**: SQLite (better-sqlite3)
- **Email**: imap-simple + Nodemailer
- **Mobile**: Capacitor (for Android)
- **Build**: Electron Builder + Vite

## Project Structure

```
gmail-clone/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js     # Electron app entry
│   │   └── preload.js  # Preload script
│   ├── renderer/       # React frontend
│   │   ├── components/ # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── EmailList.jsx
│   │   │   ├── EmailView.jsx
│   │   │   ├── ComposeModal.jsx
│   │   │   └── AccountModal.jsx
│   │   ├── hooks/      # Custom hooks
│   │   │   ├── useEmail.js
│   │   │   └── useAccounts.js
│   │   ├── styles/     # CSS styles
│   │   │   └── index.css
│   │   ├── App.jsx     # Main App component
│   │   └── main.jsx    # React entry
│   └── shared/         # Shared code
│       ├── database.js  # SQLite database functions
│       └── emailHandlers.js # IMAP/SMTP handlers
├── capacitor.config.ts # Capacitor config
├── vite.config.js      # Vite config
├── package.json
├── index.html
└── README.md
```

## Security

- Passwords are stored **locally** in the SQLite database
- All connections use **SSL/TLS** by default
- No data is sent to external servers

## License

MIT License