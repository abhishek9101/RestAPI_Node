const express = require('express');
const fs = require('fs');
const users = require('./MOCK_DATA.json');
const cors = require('cors'); // Import the cors package
const app = express();
const PORT = 8000;

app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: false })); // Middleware

// This API for the web browser
app.get('/users', (req, res) => {
    const html = `
        <ul>
            ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
        </ul>
    `;
    res.send(html);
});

// REST API (For mobile)
app.get('/api/users', (req, res) => {
    return res.json(users);
});

// Selecting data with the help of ID
app.get('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
        return res.json(user);
    } else {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }
});

app.post('/api/users', (req, res) => {
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Failed to save user' });
        }
        return res.json({ status: 'Success', id: users.length });
    });
});

app.patch('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const updateUser = req.body;

    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        // Update user fields
        users[index] = { ...users[index], ...updateUser };

        // Update the MOCK_DATA.json file (optional)
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Failed to update user' });
            }
            return res.json({ status: 'success', updatedUser: users[index] });
        });
    } else {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);

    // Find the index of the user in the array
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        // Remove user from array
        const deletedUser = users.splice(index, 1);

        // Update the MOCK_DATA.json file (optional)
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Failed to delete user' });
            }
            return res.json({ status: 'success', deletedUser: deletedUser[0] });
        });
    } else {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
