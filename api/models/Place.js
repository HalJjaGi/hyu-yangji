const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  // 기본 정보
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  aliases: [{
    type: String,
    trim: true
  }],
  
  // 위치 정보
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    accuracy: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  },
  
  // 주소 정보
  address: {
    full: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      default: '서울특별시'
    },
    district: {
      type: String,
      required: true
    },
    detail: {
      type: String,
      trim: true
    },
    postal_code: {
      type: String,
      trim: true
    }
  },
  
  // 카테고리 정보
  category: {
    main: {
      type: String,
      required: true,
      enum: ['food', 'culture', 'shopping', 'activity', 'accommodation']
    },
    sub: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  
  // 운영 정보
  operating_hours: [{
    day: {
      type: String,
      enum: ['월', '화', '수', '목', '금', '토', '일', '공휴일'],
      required: true
    },
    open: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format (HH:MM)'
      }
    },
    close: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format (HH:MM)'
      }
    },
    closed: {
      type: Boolean,
      default: false
    }
  }],
  
  // 연락처 정보
  contact: {
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    kakao: {
      type: String,
      trim: true
    }
  },
  
  // 가격 정보
  pricing: {
    level: {
      type: String,
      enum: ['₩', '₩₊', '₩₊₊', '₩₊₊₊', '₩₊₊₊₊'],
      required: true
    },
    min: {
      type: Number,
      min: 0,
      default: 0
    },
    max: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'KRW'
    },
    description: {
      type: String,
      trim: true
    }
  },
  
  // 콘텐츠 정보
  description: {
    short: {
      type: String,
      trim: true,
      maxlength: 200
    },
    full: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    features: [{
      type: String,
      trim: true
    }],
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        trim: true
      },
      width: Number,
      height: Number,
      uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // 평가 정보
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  
  // 데이터 소스 정보
  quality_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
    description: 'Data quality score (0-1)'
  },
  enhancement_history: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['auto_enhance', 'sync_update', 'manual_edit']
    },
    source: String,
    details: Object
  }],
  data_sources: [{
    source: {
      type: String,
      required: true,
      enum: ['api_seoul', 'api_tourism', 'api_culture', 'user', 'admin']
    },
    type: {
      type: String,
      required: true,
      enum: ['api', 'user', 'admin']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    reference_id: String // 외부 API ID
  }],
  
  // 상태 관리
  status: {
    visibility: {
      type: String,
      enum: ['visible', 'hidden', 'pending'],
      default: 'pending'
    },
    verification: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    last_sync: {
      type: Date
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewed_at: {
      type: Date
    },
    review_notes: {
      type: String,
      trim: true
    }
  },
  
  // 품질 메트릭
  quality: {
    overall_score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    completeness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    freshness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    trust_score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  
  // 통계 정보
  stats: {
    view_count: {
      type: Number,
      default: 0
    },
    favorite_count: {
      type: Number,
      default: 0
    },
    review_count: {
      type: Number,
      default: 0
    },
    report_count: {
      type: Number,
      default: 0
    },
    last_viewed: {
      type: Date
    }
  },
  
  // 생성 및 수정 정보
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// 지리공간 인덱스
placeSchema.index({ location: '2dsphere' });

// 검색을 위한 텍스트 인덱스
placeSchema.index({
  name: 'text',
  'address.full': 'text',
  'address.district': 'text',
  'category.sub': 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    'address.district': 5,
    'category.sub': 3,
    tags: 1
  },
  name: 'place_search_index'
});

// 상태 인덱스
placeSchema.index({
  'status.visibility': 1,
  'status.verification': 1,
  'category.main': 1,
  'quality.overall_score': -1
});

// 가상 필드
placeSchema.virtual('is_verified').get(function() {
  return this.status.verification === 'verified';
});

placeSchema.virtual('is_visible').get(function() {
  return this.status.visibility === 'visible';
});

// 메서드
placeSchema.methods.updateRating = async function(rating) {
  const newRating = Math.round(rating * 10) / 10; // 소수점 첫째자리까지
  
  this.ratings.average = newRating;
  this.ratings.count = this.ratings.count + 1;
  
  // 분포 업데이트
  const ratingKey = Math.floor(newRating);
  if (ratingKey >= 1 && ratingKey <= 5) {
    this.ratings.distribution[ratingKey] = (this.ratings.distribution[ratingKey] || 0) + 1;
  }
  
  return this.save();
};

placeSchema.methods.updateQuality = function() {
  // 품질 점수 계산 로직
  let completeness = 0.5; // 기본 점수
  
  // 필드 완성도 체크
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
      return this[parent] && this[parent][child];
    }
    return this[field];
  }).length;
  
  completeness = Math.min(1, 0.3 + (completedFields / fields.length) * 0.7);
  
  // 전체 품질 점수 (단순 가중평균)
  this.quality.overall_score = (
    completeness * 0.4 +
    this.quality.accuracy * 0.3 +
    this.quality.freshness * 0.3
  );
  
  this.quality.completeness = completeness;
  
  return this.save();
};

// 미들웨어
placeSchema.pre('save', function(next) {
  // updated_at 자동 업데이트
  this.updated_at = new Date();
  
  // 위치 좌표 저장 [lng, lat] 형식으로
  if (this.isModified('location.coordinates')) {
    this.location.coordinates = this.location.coordinates.map(coord => {
      return typeof coord === 'string' ? parseFloat(coord) : coord;
    });
  }
  
  next();
});

// 정적 메서드
placeSchema.statics.findByCategory = function(mainCategory, subCategory = null) {
  const query = { 'category.main': mainCategory };
  if (subCategory) {
    query['category.sub'] = subCategory;
  }
  return this.find(query);
};

placeSchema.statics.nearby = function(coordinates, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    'status.visibility': 'visible'
  });
};

module.exports = mongoose.model('Place', placeSchema);