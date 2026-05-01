const { query } = require('../config/database');
const logger = require('../utils/logger');

class PlaceController {
  /**
   * 모든 장소 조회
   */
  async getAllPlaces(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      lat,
      lng,
      radius,
      minPrice,
      maxPrice,
      isFree
    } = options;

    let whereConditions = ['p.is_active = true'];
    const queryParams = [];
    let paramIndex = 1;

    // 카테고리 필터
    if (category) {
      whereConditions.push(`p.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // 위치 기반 검색
    if (lat && lng && radius) {
      whereConditions.push(`
        6371 * acos(
          cos(radians($${paramIndex})) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians($${paramIndex + 1})) + 
          sin(radians($${paramIndex})) * sin(radians(p.latitude))
        ) <= $${paramIndex + 2}
      `);
      queryParams.push(lat, lng, radius / 1000); // radius를 km로 변환
      paramIndex += 3;
    }

    // 가격 필터
    if (minPrice !== undefined) {
      whereConditions.push(`p.avg_price_per_person >= $${paramIndex}`);
      queryParams.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      whereConditions.push(`p.avg_price_per_person <= $${paramIndex}`);
      queryParams.push(maxPrice);
      paramIndex++;
    }

    // 무료 장소 필터
    if (isFree !== undefined) {
      whereConditions.push(`p.is_free = $${paramIndex}`);
      queryParams.push(isFree);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // 전체 카운트
    const countQuery = `
      SELECT COUNT(*) 
      FROM places p
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 메인 쿼리
    let mainQuery = `
      SELECT 
        p.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'menu_name', m.menu_name,
              'price', m.price,
              'category', m.category,
              'description', m.description,
              'is_popular', m.is_popular
            )
            ORDER BY m.is_popular DESC, m.price
          )
          FROM menus m 
          WHERE m.place_id = p.id
        ) as menus
    `;

    // 위치 검색인 경우 거리 정보 추가
    if (lat && lng && radius) {
      mainQuery += `,
        (
          6371 * acos(
            cos(radians($${paramIndex - 3})) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($${paramIndex - 2})) + 
            sin(radians($${paramIndex - 3})) * sin(radians(p.latitude))
          )
        ) as distance
      `;
    }

    mainQuery += `
      FROM places p
      WHERE ${whereClause}
    `;

    // 위치 검색인 경우 거리 순으로 정렬
    if (lat && lng && radius) {
      mainQuery += ` ORDER BY distance, p.rating DESC, p.review_count DESC`;
    } else {
      mainQuery += ` ORDER BY p.rating DESC, p.review_count DESC, p.created_at DESC`;
    }

    mainQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(mainQuery, queryParams);

    return {
      places: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 근처 장소 검색
   */
  async getNearbyPlaces(options) {
    const {
      lat,
      lng,
      radius = 1500, // 미터
      category,
      limit = 10
    } = options;

    const queryText = `
      SELECT 
        p.*,
        m.menus,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(p.latitude))
          )
        ) as distance
      FROM places p
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', m.id,
            'menu_name', m.menu_name,
            'price', m.price,
            'category', m.category,
            'description', m.description,
            'is_popular', m.is_popular
          )
            ORDER BY m.is_popular DESC, m.price
        ) as menus
        FROM menus m 
        WHERE m.place_id = p.id
      ) m ON true
      WHERE p.is_active = true
        AND 6371 * acos(
          cos(radians($1)) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(p.latitude))
        ) <= $3
    `;

    const queryParams = [lat, lng, radius / 1000]; // radius를 km로 변환
    let paramIndex = 4;

    if (category) {
      queryText += ` AND p.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    queryText += ` ORDER BY distance, p.rating DESC, p.review_count DESC`;
    queryText += ` LIMIT $${paramIndex}`;
    queryParams.push(limit);

    const result = await query(queryText, queryParams);

    return {
      places: result.rows
    };
  }

  /**
   * 장소 상세 정보 조회
   */
  async getPlaceById(placeId) {
    const queryText = `
      SELECT 
        p.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'menu_name', m.menu_name,
              'price', m.price,
              'category', m.category,
              'description', m.description,
              'is_popular', m.is_popular
            )
            ORDER BY m.is_popular DESC, m.price
          )
          FROM menus m 
          WHERE m.place_id = p.id
        ) as menus
      FROM places p
      WHERE p.id = $1 AND p.is_active = true
    `;

    const result = await query(queryText, [placeId]);
    return result.rows[0] || null;
  }

  /**
   * 새 장소 생성
   */
  async createPlace(placeData) {
    const {
      name,
      category,
      sub_category,
      address,
      latitude,
      longitude,
      phone,
      operating_hours,
      price_range,
      avg_price_per_person,
      description,
      website,
      is_free = false,
      data_source = 'manual'
    } = placeData;

    const queryText = `
      INSERT INTO places (
        name, category, sub_category, address, latitude, longitude,
        phone, operating_hours, price_range, avg_price_per_person,
        description, website, is_free, data_source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const queryParams = [
      name, category, sub_category, address, latitude, longitude,
      phone, operating_hours, price_range, avg_price_per_person,
      description, website, is_free, data_source
    ];

    const result = await query(queryText, queryParams);
    return result.rows[0];
  }

  /**
   * 장소 정보 수정
   */
  async updatePlace(placeId, updateData) {
    // 업데이트 가능한 필드
    const allowedFields = [
      'name', 'category', 'sub_category', 'address', 'latitude', 'longitude',
      'phone', 'operating_hours', 'price_range', 'avg_price_per_person',
      'rating', 'review_count', 'description', 'website', 'is_free',
      'last_synced_at'
    ];

    // 필터링
    const updates = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('업데이트할 필드가 없습니다.');
    }

    // SET 절 생성
    const setClause = Object.keys(updates)
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const queryText = `
      UPDATE places 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `;

    const queryParams = [placeId, ...Object.values(updates)];
    const result = await query(queryText, queryParams);

    return result.rows[0] || null;
  }

  /**
   * 장소 삭제 (소프트 삭제)
   */
  async deletePlace(placeId) {
    const queryText = `
      UPDATE places 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id
    `;

    const result = await query(queryText, [placeId]);
    return result.rows.length > 0;
  }
}

module.exports = new PlaceController();