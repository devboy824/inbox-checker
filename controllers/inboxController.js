const imaps = require('imap-simple');
const db = require('../firebase');
require('dotenv').config();


exports.checkEmailStatus = async (req, res) => {
  const { search } = req.query;
  if (!search) return res.status(400).json({ error: 'Search term (name or email) is required' });
  console.log(`Searching for: ${search}`);

  const lowerSearch = search.toLowerCase();

  // Fetch testAccounts from Realtime Database
  let testAccounts = [];
  try {
    const snapshot = await db.ref('testEmails').once('value');
    const data = snapshot.val();
    // Convert object to array if needed
    testAccounts = data ? Object.values(data) : [];
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load test accounts from Firebase' });
  }

  // Process all accounts in parallel
  const results = await Promise.all(
    testAccounts.map(async (account) => {
      const imapConfig = {
        imap: {
          user: account.testMail,
          password: account.appPass,
          host: 'imap.gmail.com',
          port: 993,
          tls: true,
          authTimeout: 3000,
          tlsOptions: { rejectUnauthorized: false }
        }
      };

      try {
        const connection = await imaps.connect(imapConfig);

        // let inboxCount = 0;
        // let spamCount = 0;
        let totalSent = 0;
        let latestEmail = null;

        for (const folder of ['INBOX', '[Gmail]/Spam']) {
          await connection.openBox(folder);

          const messages = await connection.search(['ALL'], {
            bodies: ['HEADER'],
            markSeen: false
          });

          for (const msg of messages) {
            const header = msg.parts[0].body;
            const fromRaw = header.from?.[0] || '';
            const subject = header.subject?.[0] || '';
            const date = new Date(header.date?.[0] || Date.now());

            const match = fromRaw.match(/^(.*?)\s*<(.+?)>$/);
            const senderName = match ? match[1] : '';
            const senderEmail = match ? match[2] : fromRaw;

            if (
              senderEmail.toLowerCase().includes(lowerSearch) ||
              senderName.toLowerCase().includes(lowerSearch)
            ) {
              totalSent++;
              // if (folder === 'INBOX') inboxCount++;
              // if (folder === '[Gmail]/Spam') spamCount++;

              if (!latestEmail || date > latestEmail.receivedAt) {
                latestEmail = {
                  sender: senderEmail,
                  senderName,
                  subject,
                  folder: folder === 'INBOX' ? 'Inbox' : 'Spam',
                  receivedAt: date
                };
              }
            }
          }
        }

        connection.end();

        if (totalSent > 0 && latestEmail) {
          return {
            testEmail: account.testMail,
            // inboxPercentage: Math.round((inboxCount / totalSent) * 100),
            // spamPercentage: Math.round((spamCount / totalSent) * 100),
            totalSent,
            senderName: latestEmail.senderName,
            subject: latestEmail.subject,
            folder: latestEmail.folder,
            sentTime: latestEmail.receivedAt.toISOString(),
          };
        }
      } catch (err) {
        console.error(`Failed for ${account.user}:`, err.message);
      }
      return null;
    })
  );

  // Filter out null results
  const finalResults = results.filter(Boolean);

  res.status(200).json(finalResults);
};
