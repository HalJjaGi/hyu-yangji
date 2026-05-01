const express = require('express');
const { body, query } = require('express-validator');
const { validationResult } = require('express-validator');
const courseController = require('../controllers/courseController');
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
 * @route   POST /api/courses/recommend
 * @desc    예산에 맞는 코스 추천
 * @access  Public
 * @body    budget - 예산 (필수)
 * @body    categories - 선호 카테고리 배열
 * @body    lat - 위도 (한양대 위치 기본값)
 * @body    lng - 경도 (한양대 위치 기본값)
 * @body    radius - 검색 반경 (기본값 1500)
 * @body    maxPlaces - 최대 장소 수 (기본값 4)
 */
router.post('/recommend', [
  body('budget')
    .isFloat({ min: 0 })
    .withMessage('예산은 0 이상의 숫자여야 합니다.')
    .toFloat(),
  body('categories')
    .optional()
    .isArray()
    .withMessage('카테고리는 배열이어야 합니다.'),
  body('categories.*')
    .optional()
    .isString()
    .withMessage('카테고리는 문자열이어야 합니다.'),
  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('유효한 위도를 입력해주세요.')
    .toFloat(),
  body('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('유효한 경도를 입력해주세요.')
    .toFloat(),
  body('radius')
    .optional()
    .isInt({ min: 100, max: 5000 })
    .withMessage('검색 반경은 100~5000미터 사이여야 합니다.')
    .toInt(),
  body('maxPlaces')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('최대 장소 수는 1~8개 사이여야 합니다.')
    .toInt()
], validateRequest, async (req, res) => {
  try {
    // 한양대 기본 좌표
    const defaultLat = 37.5573; // 한양대 서울캠퍼스 위도
    const defaultLng = 127.0000; // 한양대 서울캠퍼스 경도

    const options = {
      budget: req.body.budget,
      categories: req.body.categories || [],
      lat: req.body.lat || defaultLat,
      lng: req.body.lng || defaultLng,
      radius: req.body.radius || 1500,
      maxPlaces: req.body.maxPlaces || 4
    };

    const recommendations = await courseController.recommendCourses(options);

    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        searchOptions: options,
        totalRecommendations: recommendations.length
      },
      message: `${recommendations.length}개의 코스를 추천했습니다.`
    });

  } catch (error) {
    logger.error('Error recommending courses:', error);
    res.status(500).json({
      success: false,
      error: '코스 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/courses
 * @desc    코스 목록 조회
 * @access  Public
 * @query   page - 페이지 번호 (기본값 1)
 * @query   limit - 페이지 당 결과 수 (기본값 20)
 * @query   sortBy - 정렬 기준 (기본값 created_at)
 * @query   sortOrder - 정렬 순서 (기본값 DESC)
 * @query   budgetMin - 최소 예산
 * @query   budgetMax - 최대 예산
 * @query   difficulty - 난이도 (초급, 중급, 고급)
 * @query   tags - 태그
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['created_at', 'budget_min', 'budget_max', 'rating', 'view_count']),
  query('sortOrder').optional().isIn(['ASC', 'DESC']),
  query('budgetMin').optional().isFloat({ min: 0 }).toFloat(),
  query('budgetMax').optional().isFloat({ min: 0 }).toFloat(),
  query('difficulty').optional().isIn(['초급', '중급', '고급']),
  query('tags').optional().isString()
], validateRequest, async (req, res) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC',
      budgetMin: req.query.budgetMin,
      budgetMax: req.query.budgetMax,
      difficulty: req.query.difficulty,
      tags: req.query.tags ? req.query.tags.split(',') : []
    };

    const result = await courseController.getAllCourses(options);

    res.json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
      filters: req.query
    });

  } catch (error) {
    logger.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      error: '코스 목록을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    코스 상세 정보 조회
 * @access  Public
 * @param   id - 코스 ID
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await courseController.getCourseById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: '코스를 찾을 수 없습니다.'
      });
    }

    // 조회수 증가 (나중에 구현)
    // await courseController.incrementViewCount(req.params.id);

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    logger.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      error: '코스 정보를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/courses
 * @desc    새 코스 생성
 * @access  Private (관리자)
 * @body    name - 코스명 (필수)
 * @body    budgetMin - 최소 예산 (필수)
 * @body    budgetMax - 최대 예산 (필수)
 * @body    difficultyLevel - 난이도
 * @body    tags - 태그 배열
 * @body    places - 장소 배열 (필수)
 */
router.post('/', [
  body('name').notEmpty().withMessage('코스명은 필수입니다.'),
  body('budgetMin')
    .isFloat({ min: 0 })
    .withMessage('최소 예산은 0 이상의 숫자여야 합니다.')
    .toFloat(),
  body('budgetMax')
    .isFloat({ min: 0 })
    .withMessage('최대 예산은 0 이상의 숫자여야 합니다.')
    .toFloat()
    .custom((value, { req }) => {
      if (value < req.body.budgetMin) {
        throw new Error('최대 예산은 최소 예산보다 크거나 같아야 합니다.');
      }
      return true;
    }),
  body('difficultyLevel')
    .optional()
    .isIn(['초급', '중급', '고급'])
    .withMessage('난이도는 초급, 중급, 고급 중 하나여야 합니다.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열이어야 합니다.'),
  body('places')
    .isArray({ min: 1 })
    .withMessage('최소 1개 이상의 장소가 필요합니다.'),
  body('places.*.id')
    .isInt({ min: 1 })
    .withMessage('장소 ID는 유효한 정수여야 합니다.'),
  body('places.*.visitOrder')
    .isInt({ min: 1 })
    .withMessage('방문 순서는 1 이상의 정수여야 합니다.')
], validateRequest, async (req, res) => {
  try {
    // 코스 생성 로직 (나중에 구현)
    // const course = await courseController.createCourse(req.body);
    
    res.status(201).json({
      success: true,
      message: '코스 생성 기능은 아직 개발 중입니다.',
      // data: course
    });

  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: '코스를 생성하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    코스 수정
 * @access  Private (관리자)
 */
router.put('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: '코스 수정 기능은 아직 개발 중입니다.'
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: '코스를 수정하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    코스 삭제
 * @access  Private (관리자)
 */
router.delete('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: '코스 삭제 기능은 아직 개발 중입니다.'
    });
  } catch (error) {
    logger.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: '코스를 삭제하는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;