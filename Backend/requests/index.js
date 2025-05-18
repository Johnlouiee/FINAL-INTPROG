const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(), create);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);

async function create(req, res, next) {
    try {
        const requestData = {
            employeeId: req.user.employeeId,
            type: req.body.type,
            description: req.body.description,
            status: 'Pending',
            requestItems: req.body.requestItems || []
        };

        const request = await db.Request.create(requestData, {
            include: [{
                model: db.RequestItem,
                as: 'requestItems'
            }]
        });

        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            include: [
                { model: db.RequestItem, as: 'requestItems' },
                { model: db.Employee, as: 'employee' }
            ]
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [
                { model: db.RequestItem, as: 'requestItems' },
                { model: db.Employee, as: 'employee' }
            ]
        });
        
        if (!request) throw new Error('Request not found');
        
        if (req.user.role !== Role.Admin && request.employeeId !== req.user.employeeId) {
            throw new Error('Unauthorized');
        }
        
        res.json(request);
    } catch (err) {
        next(err);
    }
}

async function getByEmployeeId(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            where: { employeeId: req.params.employeeId },
            include: [
                { model: db.RequestItem, as: 'requestItems' },
                { model: db.Employee, as: 'employee' }
            ]
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [{ model: db.RequestItem, as: 'requestItems' }]
        });
        
        if (!request) throw new Error('Request not found');

        // Update request
        await request.update({
            type: req.body.type,
            description: req.body.description,
            status: req.body.status
        });

        // Update request items
        if (req.body.requestItems) {
            // Delete existing items
            await db.RequestItem.destroy({
                where: { requestId: request.id }
            });

            // Create new items
            await db.RequestItem.bulkCreate(
                req.body.requestItems.map(item => ({
                    ...item,
                    requestId: request.id
                }))
            );
        }

        // Get updated request with items
        const updatedRequest = await db.Request.findByPk(request.id, {
            include: [
                { model: db.RequestItem, as: 'requestItems' },
                { model: db.Employee, as: 'employee' }
            ]
        });

        res.json(updatedRequest);
    } catch (err) {
        next(err);
    }
}

async function _delete(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        
        // Delete associated request items first
        await db.RequestItem.destroy({
            where: { requestId: request.id }
        });
        
        // Delete the request
        await request.destroy();
        
        res.json({ message: 'Request deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = router;