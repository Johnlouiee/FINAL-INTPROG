const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);

async function create(req, res, next) {
    try {
        const department = await db.Department.create(req.body);
        res.status(201).json(department);
    } catch (err) {
        console.error('Error creating department:', err);
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        console.log('Fetching all departments...');
        const departments = await db.Department.findAll({
            attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
        });
        console.log('Departments found:', departments.length);
        res.json(departments);
    } catch (err) {
        console.error('Error fetching departments:', err);
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (err) {
        console.error('Error fetching department by id:', err);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        await department.update(req.body);
        res.json(department);
    } catch (err) {
        console.error('Error updating department:', err);
        next(err);
    }
}

async function _delete(req, res, next) {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        await department.destroy();
        res.json({ message: 'Department deleted' });
    } catch (err) {
        console.error('Error deleting department:', err);
        next(err);
    }
}

module.exports = router;