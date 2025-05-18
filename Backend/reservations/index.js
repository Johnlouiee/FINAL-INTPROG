const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');

router.post('/', async (req, res) => {
    const { employeeId, resource, date, status } = req.body;
    const reservation = await db.Reservation.create({ employeeId, resource, date, status });
    res.status(201).json(reservation);
});

router.get('/', async (req, res) => {
    const reservations = await db.Reservation.findAll();
    res.json(reservations);
});

// Add PUT and DELETE as needed

module.exports = router; 