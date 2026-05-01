const express = require('express');
const { body, query, param } = require('express-validator');
const { validationResult } = require('express-validator');
const placeController = require('../controllers/placeController');
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

// 로깅 미들웨어
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

/**
 * @route   GET /api/places
 * @desc    장소 목록 조회
 * @access  Public
 * @query   category - 카테고리 필터
 * @query   lat - 위도 (근처 장소 검색용)
 * @query   lng - 경도 (근처 장소 검색용)
 * @query   radius - 검색 반경 (미터, 기본값 1500)
 * @query   minPrice - 최소 가격
 * @query   maxPrice - 최대 가격
 * @query   isFree - 무료 장소만
 * @query   page - 페이지 번호 (기본값 1)
 * @query   limit - 페이지 당 결과 수 (기본값 20)
 */
router.get('/', [
  query('category').optional().isString(),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 0 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('isFree').optional().isBoolean().toBoolean(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], validateRequest, async (req, res) => {
  try {
    const result = await placeController.getAllPlaces(req.query);
    res.json({
      success: true,
      data: result.places,
      pagination: result.pagination,
      filters: req.query
    });
  } catch (error) {
    logger.error('Error getting places:', error);
    res.status(500).json({
      success: false,
      error: '장소 목록을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/places/nearby
 * @desc    근처 장소 검색
 * @access  Public
 * @query   lat - 위도 (필수)
 * @query   lng - 경도 (필수)
 * @query   radius - 검색 반경 (미터, 기본값 1500)
 * @query   category - 카테고리 필터
 * @query   limit - 결과 수 (기본값 10)
 */
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 0 }).toInt(),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], validateRequest, async (req, res) => {
  try {
    const result = await placeController.getNearbyPlaces(req.query);
    res.json({
      success: true,
      data: result.places,
      center: { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) },
      radius: req.query.radius || 1500
    });
  } catch (error) {
    logger.error('Error getting nearby places:', error);
    res.status(500).json({
      success: false,
      error: '근처 장소를 검색하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/places/:id
 * @desc    장소 상세 정보 조회
 * @access  Public
 * @param   id - 장소 ID
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], validateRequest, async (req, res) => {
  try {
    const place = await placeController.getPlaceById(req.params.id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        error: '장소를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: place
    });
  } catch (error) {
    logger.error('Error getting place:', error);
    res.status(500).json({
      success: false,
      error: '장소 정보를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/places
 * @desc    새 장소 등록
 * @access  Private (관리자)
 * @body    name - 장소명 (필수)
 * @body    category - 카테고리 (필수)
 * @body    address - 주소
 * @body    latitude - 위도 (필수)
 * @body    longitude - 경도 (필수)
 * @body    phone - 전화번호
 * @body    operating_hours - 운영 시간
 * @body    price_range - 가격대
 * @body    description - 설명
 */
router.post('/', [
  body('name').notEmpty().withMessage('장소명은 필수입니다.'),
  body('category').notEmpty().withMessage('카테고리는 필수입니다.'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('유효한 위도를 입력해주세요.'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('유효한 경도를 입력해주세요.'),
  body('address').optional().isString(),
  body('phone').optional().isString(),
  body('operating_hours').optional().isObject(),
  body('price_range').optional().isString(),
  body('description').optional().isString()
], validateRequest, async (req, res) => {
  try {
    const place = await placeController.createPlace(req.body);
    res.status(201).json({
      success: true,
      message: '장소가 성공적으로 등록되었습니다.',
      data: place
    });
  } catch (error) {
    logger.error('Error creating place:', error);
    res.status(500).json({
      success: false,
      error: '장소를 등록하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/places/:id
 * @desc    장소 정보 수정
 * @access  Private (관리자)
 * @param   id - 장소 ID
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], validateRequest, async (req, res) => {
  try {
    const place = await placeController.updatePlace(req.params.id, req.body);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        error: '장소를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '장소 정보가 성공적으로 수정되었습니다.',
      data: place
    });
  } catch (error) {
    logger.error('Error updating place:', error);
    res.status(500).json({
      success: false,
      error: '장소 정보를 수정하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/places/:id
 * @desc    장소 삭제
 * @access  Private (관리자)
 * @param   id - 장소 ID
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], validateRequest, async (req, res) => {
  try {
    const deleted = await placeController.deletePlace(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '장소를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '장소가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    logger.error('Error deleting place:', error);
    res.status(500).json({
      success: false,
      error: '장소를 삭제하는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;