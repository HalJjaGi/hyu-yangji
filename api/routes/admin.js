const express = require('express');
const Place = require('../models/Place');
const AppError = require('../middleware/errorHandler').AppError;
const router = express.Router();

// 관리자 미들웨어 (TODO: 실제 인증 구현 필요)
const adminAuth = (req, res, next) => {
  // 임시로 모든 요청 통과 (실제로는 인증 체크 필요)
  if (req.headers['x-admin-token'] === 'temp-token') {
    next();
  } else {
    throw new AppError('Admin authentication required', 401);
  }
};

// 대기 중인 장소 목록
router.get('/pending', adminAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all', // 'all', 'new', 'updated'
      priority = 'all'
    } = req.query;
    
    let query = {
      'status.verification': 'pending',
      'status.visibility': { $ne: 'hidden' }
    };
    
    // 유형 필터
    if (type !== 'all') {
      if (type === 'new') {
        query.created_at = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
      } else if (type === 'updated') {
        query.updated_at = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
      }
    }
    
    // 우선순위 필터
    if (priority !== 'all') {
      query['status.priority'] = priority;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const places = await Place.find(query)
      .sort({ 'status.priority': -1, created_at: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('created_by', 'name email')
      .lean();
    
    const total = await Place.countDocuments(query);
    
    // 통계 정보
    const stats = {
      total_pending: total,
      by_priority: {
        high: await Place.countDocuments({ ...query, 'status.priority': 'high' }),
        normal: await Place.countDocuments({ ...query, 'status.priority': 'normal' }),
        low: await Place.countDocuments({ ...query, 'status.priority': 'low' })
      },
      by_category: await Place.aggregate([
        { $match: query },
        { $group: { _id: '$category.main', count: { $sum: 1 } } }
      ])
    };
    
    res.status(200).json({
      success: true,
      data: places,
      stats,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// 장소 상세 검토
router.get('/review/:id', adminAuth, async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('created_by', 'name email phone')
      .lean();
    
    if (!place) {
      throw new AppError('Place not found', 404);
    }
    
    // 유사 장소 검색
    const similarPlaces = await Place.find({
      _id: { $ne: place._id },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: place.location.coordinates
          },
          $maxDistance: 500 // 500m 이내
        }
      },
      'status.verification': 'verified'
    })
    .select('name category address created_at')
    .limit(5)
    .lean();
    
    // 품질 점수 상세
    const qualityAnalysis = {
      completeness: calculateCompletenessScore(place),
      accuracy: place.quality.accuracy,
      freshness: place.quality.freshness,
      trust_score: place.quality.trust_score,
      overall: place.quality.overall_score
    };
    
    res.status(200).json({
      success: true,
      data: place,
      similar_places: similarPlaces,
      quality_analysis: qualityAnalysis,
      recommendations: generateRecommendations(place, similarPlaces, qualityAnalysis)
    });
    
  } catch (error) {
    next(error);
  }
});

// 장소 승인
router.put('/approve/:id', adminAuth, async (req, res, next) => {
  try {
    const { notes, priority } = req.body;
    
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      throw new AppError('Place not found', 404);
    }
    
    const updateData = {
      'status.visibility': 'visible',
      'status.verification': 'verified',
      'status.reviewed_by': req.user.id, // TODO: 실제 사용자 ID
      'status.reviewed_at': new Date(),
      'status.priority': priority || place.status.priority,
      'status.review_notes': notes || ''
    };
    
    // 데이터 소스 신뢰도 업데이트
    updateData.data_sources = place.data_sources.map(source => ({
      ...source.toObject(),
      verified: true,
      confidence: Math.min(1.0, source.confidence + 0.2)
    }));
    
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // 품질 점수 재계산
    await updatedPlace.updateQuality();
    
    res.status(200).json({
      success: true,
      message: 'Place approved successfully',
      data: updatedPlace
    });
    
  } catch (error) {
    next(error);
  }
});

// 장소 거절
router.put('/reject/:id', adminAuth, async (req, res, next) => {
  try {
    const { reason, notes } = req.body;
    
    if (!reason) {
      throw new AppError('Rejection reason is required', 400);
    }
    
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      throw new AppError('Place not found', 404);
    }
    
    const updateData = {
      'status.visibility': 'hidden',
      'status.verification': 'rejected',
      'status.reviewed_by': req.user.id, // TODO: 실제 사용자 ID
      'status.reviewed_at': new Date(),
      'status.review_notes': notes || '',
      'data_sources': place.data_sources.map(source => ({
        ...source.toObject(),
        confidence: Math.max(0.0, source.confidence - 0.1)
      }))
    };
    
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Place rejected successfully',
      data: {
        id: updatedPlace._id,
        name: updatedPlace.name,
        reason: reason,
        notes: notes
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// API 데이터와 병합
router.put('/merge/:id', adminAuth, async (req, res, next) => {
  try {
    const { api_source_id, notes } = req.body;
    
    const userPlace = await Place.findById(req.params.id);
    const apiPlace = await Place.findOne({
      'data_sources.reference_id': api_source_id,
      'data_sources.type': 'api'
    });
    
    if (!userPlace || !apiPlace) {
      throw new AppError('Place not found', 404);
    }
    
    // 데이터 병합 로직
    const mergedData = mergePlaceData(userPlace.toObject(), apiPlace.toObject());
    
    const updateData = {
      ...mergedData,
      'status.visibility': 'visible',
      'status.verification': 'verified',
      'status.reviewed_by': req.user.id,
      'status.reviewed_at': new Date(),
      'status.review_notes': notes || 'Merged with API data',
      updated_by: req.user.id
    };
    
    // 데이터 소스 업데이트
    updateData.data_sources = [
      ...apiPlace.data_sources.map(source => ({
        ...source.toObject(),
        verified: true,
        confidence: Math.min(1.0, source.confidence + 0.3)
      })),
      {
        source: 'admin_merge',
        type: 'admin',
        confidence: 0.9,
        timestamp: new Date(),
        verified: true
      }
    ];
    
    const mergedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // API 장소는 숨김 처리
    await Place.findByIdAndUpdate(apiPlace._id, {
      'status.visibility': 'hidden',
      updated_by: req.user.id
    });
    
    // 품질 점수 재계산
    await mergedPlace.updateQuality();
    
    res.status(200).json({
      success: true,
      message: 'Places merged successfully',
      data: mergedPlace
    });
    
  } catch (error) {
    next(error);
  }
});

// 대시보드 통계
router.get('/dashboard', adminAuth, async (req, res, next) => {
  try {
    // 기본 통계
    const stats = {
      total_places: await Place.countDocuments(),
      verified_places: await Place.countDocuments({ 'status.verification': 'verified' }),
      pending_places: await Place.countDocuments({ 'status.verification': 'pending' }),
      hidden_places: await Place.countDocuments({ 'status.visibility': 'hidden' }),
      
      by_category: await Place.aggregate([
        { $group: { _id: '$category.main', count: { $sum: 1 } } }
      ]),
      
      by_source: await Place.aggregate([
        { $unwind: '$data_sources' },
        { $group: { _id: '$data_sources.source', count: { $sum: 1 } } }
      ]),
      
      by_quality: {
        high: await Place.countDocuments({ 'quality.overall_score': { $gte: 0.8 } }),
        medium: await Place.countDocuments({ 
          'quality.overall_score': { $gte: 0.5, $lt: 0.8 } 
        }),
        low: await Place.countDocuments({ 'quality.overall_score': { $lt: 0.5 } })
      }
    };
    
    // 최근 활동
    const recentActivities = await Place.find({
      'status.verification': 'pending'
    })
    .sort({ created_at: -1 })
    .limit(10)
    .select('name category status created_by created_at')
    .populate('created_by', 'name')
    .lean();
    
    // 품질 추이 (최근 7일)
    const qualityTrend = await getQualityTrend();
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        recent_activities,
        quality_trend: qualityTrend
      },
      timestamp: new Date()
    });
    
  } catch (error) {
    next(error);
  }
});

// 유틸리티 함수
function calculateCompletenessScore(place) {
  const fields = [
    'contact.phone',
    'operating_hours',
    'pricing.max',
    'description.short',
    'images'
  ];
  
  const completedFields = fields.filter(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return place[parent] && place[parent][child];
    }
    return place[field];
  }).length;
  
  return Math.min(1, 0.3 + (completedFields / fields.length) * 0.7);
}

function generateRecommendations(place, similarPlaces, quality) {
  const recommendations = [];
  
  // 품질 개선 추천
  if (quality.completeness < 0.7) {
    recommendations.push({
      type: 'quality',
      priority: 'high',
      message: 'Fill in missing information to improve completeness score'
    });
  }
  
  // 중복 장소 확인
  if (similarPlaces.length > 0) {
    recommendations.push({
      type: 'duplicate',
      priority: 'medium',
      message: `Found ${similarPlaces.length} similar places nearby. Consider merging.`
    });
  }
  
  // 데이터 소스 개선
  const hasApiSource = place.data_sources.some(source => source.type === 'api');
  if (!hasApiSource) {
    recommendations.push({
      type: 'source',
      priority: 'low',
      message: 'Consider merging with API data for better accuracy'
    });
  }
  
  return recommendations;
}

function mergePlaceData(userPlace, apiPlace) {
  const merged = { ...userPlace };
  
  // API 데이터가 더 신뢰할 수 있는 필드들
  const trustApiFields = [
    'operating_hours',
    'contact.phone',
    'contact.website',
    'pricing'
  ];
  
  trustApiFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (apiPlace[parent] && apiPlace[parent][child]) {
        merged[parent] = merged[parent] || {};
        merged[parent][child] = apiPlace[parent][child];
      }
    } else if (apiPlace[field]) {
      merged[field] = apiPlace[field];
    }
  });
  
  // 태그 병합 (중복 제거)
  const allTags = new Set([
    ...(userPlace.category.tags || []),
    ...(apiPlace.category.tags || [])
  ]);
  merged.category.tags = Array.from(allTags);
  
  return merged;
}

async function getQualityTrend() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const trend = await Place.aggregate([
    {
      $match: {
        updated_at: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$updated_at' } }
        },
        avg_quality: { $avg: '$quality.overall_score' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
  
  return trend.map(item => ({
    date: item._id.date,
    avg_quality: Math.round(item.avg_quality * 100) / 100,
    count: item.count
  }));
}

module.exports = router;