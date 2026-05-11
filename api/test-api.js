require('dotenv').config();
const APIService = require('./services/APIService');

async function testAPIs() {
  console.log('🔗 Testing API connections...\n');
  
  const apiService = new APIService();
  
  try {
    // 1. API 상태 확인
    console.log('📊 Checking API status...');
    const status = await apiService.checkAPIStatus();
    
    console.log('=== API Status Results ===');
    console.log('Seoul API:', status.seoul_api.status);
    console.log('Tourism API:', status.tourism_api.status);
    
    if (status.seoul_api.error) {
      console.log('❌ Seoul API Error:', status.seoul_api.error);
    }
    
    if (status.tourism_api.error) {
      console.log('❌ Tourism API Error:', status.tourism_api.error);
    }
    
    console.log('\n');
    
    // 2. 서울 데이터 테스트 (소량)
    console.log('🏢 Testing Seoul Culture API (first 5 items)...');
    try {
      const seoulResult = await apiService.fetchSeoulData('culture', 1, 5);
      
      if (seoulResult.success) {
        console.log('✅ Seoul API test successful!');
        console.log(`Total items: ${seoulResult.total}`);
        
        if (seoulResult.data.length > 0) {
          console.log('Sample item:');
          const sample = seoulResult.data[0];
          console.log(`  - Name: ${sample.FACIL_NM || 'Unknown'}`);
          console.log(`  - Address: ${sample.ADDR || 'No address'}`);
          console.log(`  - Category: ${sample.CLSFC_NM || 'Unknown'}`);
        }
      } else {
        console.log('❌ Seoul API test failed:', seoulResult.error);
      }
    } catch (error) {
      console.log('❌ Seoul API test error:', error.message);
    }
    
    console.log('\n');
    
    // 3. 관광 데이터 테스트 (소량)
    console.log('🏛️ Testing Tourism API (first 5 items)...');
    try {
      const tourismResult = await apiService.fetchTourismData('areaBased', {
        areaCode: 1,
        numOfRows: 5
      });
      
      if (tourismResult.success) {
        console.log('✅ Tourism API test successful!');
        console.log(`Total items: ${tourismResult.total}`);
        
        if (tourismResult.data.length > 0) {
          console.log('Sample item:');
          const sample = tourismResult.data[0];
          console.log(`  - Title: ${sample.title || 'Unknown'}`);
          console.log(`  - Address: ${sample.addr1 || 'No address'}`);
          console.log(`  - Category: ${sample.cat1 || 'Unknown'}`);
        }
      } else {
        console.log('❌ Tourism API test failed:', tourismResult.error);
      }
    } catch (error) {
      console.log('❌ Tourism API test error:', error.message);
    }
    
    console.log('\n');
    
    // 4. 데이터 유효성 테스트
    console.log('🔍 Testing data validation...');
    const testData = [
      { FACIL_NM: '테스트 장소', ADDR: '서울특별시 성동구 테스트로 123', X_COORD: '127.0554', Y_COORD: '37.5445' },
      { FACIL_NM: '', ADDR: '서울특별시', X_COORD: '127.0554', Y_COORD: '37.5445' }, // 이름 없음 (무효)
      { FACIL_NM: '좌표 없음', ADDR: '서울특별시' } // 좌표 없음 (무효)
    ];
    
    const validated = apiService.validateAPIData(testData, 'test');
    console.log(`Validation test: ${validated.length}/${testData.length} items passed`);
    
    console.log('\n=== Test Summary ===');
    console.log('API connection tests completed.');
    console.log('✅ Ready for data synchronization!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Please check your API keys and network connection.');
  }
}

// 테스트 실행
testAPIs();