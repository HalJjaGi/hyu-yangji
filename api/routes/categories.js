const express = require('express');
const { query } = require('express-validator');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router = express.Router();

// 유효성 검사 미들웨어
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '유효성 검사 실패',
      details: errors.array()
    });
  }
  next();
};

/**
 * @route   GET /api/categories
 * @desc    카테고리 목록 조회
 * @access  Public
 * @query   activeOnly - 활성 카테고리만 조회 (기본값 true)
 */
router.get('/', [
  query('activeOnly').optional().isBoolean().toBoolean()
], validateRequest, async (req, res) => {
  try {
    const { activeOnly = true } = req.query;

    let queryText = `
      SELECT 
        c.*,
        (
          SELECT COUNT(*) 
          FROM places p 
          WHERE p.category = c.name AND p.is_active = true
        ) as place_count
      FROM categories c
    `;

    const queryParams = [];

    if (activeOnly) {
      queryText += ' WHERE c.is_active = true';
    }

    queryText += ' ORDER BY c.sort_order, c.name';

    // 데이터베이스 쿼리 직접 실행 (간단한 구현)
    const { query } = require('../config/database');
    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 목록을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    카테고리 상세 정보 조회
 * @access  Public
 * @param   id - 카테고리 ID
 */
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const queryText = `
      SELECT 
        c.*,
        (
          SELECT COUNT(*) 
          FROM places p 
          WHERE p.category = c.name AND p.is_active = true
        ) as place_count
      FROM categories c
      WHERE c.id = $1 AND c.is_active = true
    `;

    const { query } = require('../config/database');
    const result = await query(queryText, [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 정보를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/categories
 * @desc    새 카테고리 생성
 * @access  Private (관리자)
 */
router.post('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: '카테고리 생성 기능은 아직 개발 중입니다.'
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 생성하는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;