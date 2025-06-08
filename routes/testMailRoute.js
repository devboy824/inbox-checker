// routes/testEmail.js
const express = require('express');
const router = express.Router();
const db = require('../firebase'); // Make sure path matches

router.post('/add-test-email', async (req, res) => {
  const { testMail, appPass } = req.body;

  if (!testMail || !appPass) {
    return res.status(400).json({ error: "testMail and appPass are required" });
  }

  try {
    const newRef = db.ref('testEmails').push(); // push creates a unique ID
    await newRef.set({ testMail, appPass });

    res.status(200).json({ message: "Test email added successfully", id: newRef.key });
  } catch (error) {
    console.error("Firebase error:", error);
    res.status(500).json({ error: "Failed to save test email" });
  }
});


router.get('/get-test-emails', async (req, res) => {
    try {
        const ref = db.ref('testEmails');
        ref.once('value', (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                return res.status(404).json({ message: 'No test emails found' });
            }

            // Convert object to array
            const result = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));

            res.status(200).json(result);
        });
    } catch (error) {
        console.error('Error fetching test emails:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// DELETE /delete-test-email/:id
router.delete('/delete-test-email/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.ref(`testEmails/${id}`).remove();
        res.status(200).json({ message: 'Test email deleted successfully' });
    } catch (error) {
        console.error('Error deleting test email:', error);
        res.status(500).json({ message: 'Failed to delete test email', error });
    }
});


module.exports = router;
