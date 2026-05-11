/**
 * 원인 분석 에이전트
 * 수집된 오류 데이터를 분석하고 가장 가능성 높은 원인을 찾는 에이전트
 */

class CauseAnalyzerAgent {
    constructor() {
        this.name = 'CauseAnalyzerAgent';
        this.version = '1.0.0';
        this.analysisStartTime = Date.now();
        
        // 오류 패턴 데이터베이스
        this.errorPatterns = {
            'JSON_PARSING_HTML': {
                symptoms: ['Unexpected token <', 'SyntaxError', 'not valid JSON'],
                causes: ['API returning HTML instead of JSON', 'Wrong Content-Type', 'CORS issues'],
                probability: 0.9,
                solutions: ['Check API endpoints', 'Verify Content-Type headers', 'Review CORS configuration']
            },
            'MANIFEST_SYNTAX_ERROR': {
                symptoms: ['Manifest: Line: 1, column: 1', 'Syntax error'],
                causes: ['Missing manifest file', 'Invalid JSON in manifest', 'Wrong MIME type'],
                probability: 0.8,
                solutions: ['Create valid manifest.json', 'Check web server MIME types', 'Verify manifest URL']
            },
            'NETWORK_CORS_ERROR': {
                symptoms: ['CORS', 'cross-origin', 'Access-Control-Allow-Origin'],
                causes: ['Missing CORS headers', 'Different domain origins', 'Wildcard CORS issues'],
                probability: 0.85,
                solutions: ['Configure CORS headers', 'Use same-origin resources', 'Update server configuration']
            },
            'SPA_ROUTING_ISSUE': {
                symptoms: ['404', 'HTML response', 'fallback to index.html'],
                causes: ['Server not configured for SPA', 'Missing rewrite rules', 'API and static file conflicts'],
                probability: 0.75,
                solutions: ['Configure server rewrite rules', 'Separate API routes', 'Implement proper fallback']
            },
            'FLUTTER_WEB_ISSUE': {
                symptoms: ['main.dart.js', 'flutter', 'FormatException'],
                causes: ['Base URL not set', 'Missing --base-href', 'Incorrect asset paths'],
                probability: 0.7,
                solutions: ['Set proper base-href', 'Check Flutter build configuration', 'Verify asset paths']
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log(`🧠 ${this.name} v${this.version} is starting...`);
        
        // 다른 에이전트가 데이터를 수집할 때까지 대기
        this.waitForErrorData();
    }
    
    waitForErrorData() {
        const maxWaitTime = 10000; // 10초 대기
        const startTime = Date.now();
        
        const checkInterval = setInterval(() => {
            if (window.errorReport || window.errorCollectorAgent) {
                clearInterval(checkInterval);
                this.analyzeCauses();
            } else if (Date.now() - startTime > maxWaitTime) {
                clearInterval(checkInterval);
                console.log(`⏰ ${this.name}: Timeout waiting for error data`);
                this.generateBasicAnalysis();
            }
        }, 500);
    }
    
    analyzeCauses() {
        const errorData = window.errorReport || this.collectErrorData();
        
        console.log(`🔍 ${this.name}: Starting analysis of ${errorData.errors.length} errors`);
        
        const analysis = {
            agent: this.name,
            timestamp: new Date().toISOString(),
            analysisDuration: Date.now() - this.analysisStartTime,
            primaryCause: null,
            secondaryCauses: [],
            confidence: 0,
            evidence: [],
            patterns: this.identifyPatterns(errorData),
            recommendations: []
        };
        
        // 패턴 분석
        for (const [patternName, patternData] of Object.entries(this.errorPatterns)) {
            const matchScore = this.calculatePatternMatch(errorData, patternData);
            
            if (matchScore > 0.5) {
                const causeAnalysis = {
                    pattern: patternName,
                    confidence: matchScore,
                    symptoms: patternData.symptoms,
                    likelyCauses: patternData.causes,
                    solutions: patternData.solutions,
                    evidence: this.findEvidence(errorData, patternData.symptoms)
                };
                
                if (!analysis.primaryCause || matchScore > analysis.confidence) {
                    if (analysis.primaryCause) {
                        analysis.secondaryCauses.push(analysis.primaryCause);
                    }
                    analysis.primaryCause = causeAnalysis;
                    analysis.confidence = matchScore;
                } else {
                    analysis.secondaryCauses.push(causeAnalysis);
                }
            }
        }
        
        // 추천 사항 생성
        analysis.recommendations = this.generateRecommendations(analysis);
        
        // 분석 결과 표시
        this.displayAnalysis(analysis);
        
        // 다른 에이전트와의 통신을 위해 저장
        window.causeAnalysis = analysis;
        
        return analysis;
    }
    
    collectErrorData() {
        // 기본적인 오류 데이터 수집
        return {
            errors: [],
            networkRequests: [],
            consoleMessages: [],
            summary: {
                totalErrors: 0,
                networkErrors: 0,
                errorTypes: [],
                failingUrls: [],
                criticalIssues: []
            }
        };
    }
    
    identifyPatterns(errorData) {
        const patterns = [];
        
        // JSON 파싱 오류 패턴
        const jsonErrors = errorData.errors.filter(error => 
            this.containsAny(error.message, ['JSON', 'Unexpected token', 'SyntaxError'])
        );
        
        if (jsonErrors.length > 0) {
            patterns.push({
                type: 'JSON_PARSING_ERROR',
                count: jsonErrors.length,
                severity: 'HIGH'
            });
        }
        
        // 네트워크 오류 패턴
        const networkErrors = errorData.networkRequests.filter(request =>
            request.status >= 400 || request.type === 'fetch_error'
        );
        
        if (networkErrors.length > 0) {
            patterns.push({
                type: 'NETWORK_ERROR',
                count: networkErrors.length,
                severity: 'MEDIUM'
            });
        }
        
        // Manifest 오류 패턴
        const manifestErrors = errorData.errors.filter(error =>
            this.containsAny(error.message, ['Manifest', 'Line: 1, column: 1'])
        );
        
        if (manifestErrors.length > 0) {
            patterns.push({
                type: 'MANIFEST_ERROR',
                count: manifestErrors.length,
                severity: 'MEDIUM'
            });
        }
        
        return patterns;
    }
    
    calculatePatternMatch(errorData, patternData) {
        let totalScore = 0;
        let maxScore = 0;
        
        // 증상 매칭 점수 계산
        for (const symptom of patternData.symptoms) {
            maxScore += 1;
            
            // 오류 메시지에서 증상 검색
            const errorMatches = errorData.errors.filter(error =>
                this.containsAny(error.message, [symptom])
            );
            
            // 콘솔 메시지에서 증상 검색
            const consoleMatches = errorData.consoleMessages.filter(msg =>
                this.containsAny(msg.message, [symptom])
            );
            
            // 네트워크 요청에서 증상 검색
            const networkMatches = errorData.networkRequests.filter(req =>
                this.containsAny(req.url, [symptom]) ||
                (req.body && this.containsAny(req.body, [symptom]))
            );
            
            const matchCount = errorMatches.length + consoleMatches.length + networkMatches.length;
            
            if (matchCount > 0) {
                totalScore += 1;
            }
        }
        
        // 원인별 추가 점수
        for (const cause of patternData.causes) {
            maxScore += 0.5;
            
            if (this.isCauseLikely(errorData, cause)) {
                totalScore += 0.5;
            }
        }
        
        return maxScore > 0 ? totalScore / maxScore : 0;
    }
    
    findEvidence(errorData, symptoms) {
        const evidence = [];
        
        for (const symptom of symptoms) {
            // 오류 메시지에서 증거 수집
            const errorEvidence = errorData.errors
                .filter(error => this.containsAny(error.message, [symptom]))
                .map(error => ({
                    type: 'error',
                    message: error.message,
                    location: error.filename
                }));
            
            // 네트워크 증거 수집
            const networkEvidence = errorData.networkRequests
                .filter(req => this.containsAny(req.url, [symptom]) ||
                    (req.body && this.containsAny(req.body, [symptom])))
                .map(req => ({
                    type: 'network',
                    url: req.url,
                    status: req.status,
                    method: req.method
                }));
            
            evidence.push(...errorEvidence, ...networkEvidence);
        }
        
        return evidence.slice(0, 5); // 상위 5개 증거만
    }
    
    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.primaryCause) {
            recommendations.push({
                priority: 'HIGH',
                title: `Primary Issue: ${analysis.primaryCause.pattern}`,
                description: `Detected with ${Math.round(analysis.primaryCause.confidence * 100)}% confidence`,
                causes: analysis.primaryCause.likelyCauses,
                solutions: analysis.primaryCause.solutions
            });
        }
        
        for (const secondary of analysis.secondaryCauses) {
            recommendations.push({
                priority: 'MEDIUM',
                title: `Secondary Issue: ${secondary.pattern}`,
                description: `Contributing factor with ${Math.round(secondary.confidence * 100)}% confidence`,
                causes: secondary.likelyCauses,
                solutions: secondary.solutions
            });
        }
        
        return recommendations;
    }
    
    displayAnalysis(analysis) {
        const analysisDiv = document.createElement('div');
        analysisDiv.id = 'cause-analysis-report';
        analysisDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 450px;
            max-height: 80vh;
            overflow-y: auto;
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999998;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        const primaryCause = analysis.primaryCause ? 
            `<div style="color: #dc3545; font-weight: bold; margin-bottom: 8px;">
                🎯 Primary: ${analysis.primaryCause.pattern} (${Math.round(analysis.primaryCause.confidence * 100)}% confidence)
            </div>` : '';
        
        const recommendations = analysis.recommendations.map(rec => 
            `<div style="margin: 8px 0; padding: 8px; background: ${rec.priority === 'HIGH' ? '#f8d7da' : '#d1ecf1'}; border-radius: 4px;">
                <div style="font-weight: bold; color: ${rec.priority === 'HIGH' ? '#721c24' : '#0c5460'};">
                    ${rec.priority}: ${rec.title}
                </div>
                <div style="font-size: 10px; color: #6c757d; margin: 4px 0;">
                    ${rec.description}
                </div>
                <div style="font-size: 10px; margin: 4px 0;">
                    <strong>Causes:</strong> ${rec.causes.join(', ')}
                </div>
                <div style="font-size: 10px; margin: 4px 0;">
                    <strong>Solutions:</strong> ${rec.solutions.join(', ')}
                </div>
            </div>`
        ).join('');
        
        analysisDiv.innerHTML = `
            <div style="color: #007bff; font-weight: bold; margin-bottom: 10px;">
                🧠 CAUSE ANALYSIS AGENT
            </div>
            <div style="color: #6c757d; font-size: 10px; margin-bottom: 10px;">
                Analysis completed in ${analysis.analysisDuration}ms
            </div>
            ${primaryCause}
            ${recommendations}
            <button onclick="this.parentElement.remove()" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                margin-top: 10px;
            ">Close Analysis</button>
        `;
        
        document.body.appendChild(analysisDiv);
        
        console.log(`📋 ${this.name} Analysis Complete:`, analysis);
    }
    
    // 유틸리티 메서드
    containsAny(str, substrings) {
        if (!str) return false;
        str = String(str).toLowerCase();
        return substrings.some(sub => str.includes(String(sub).toLowerCase()));
    }
    
    isCauseLikely(errorData, cause) {
        // 특정 원인이 likely한지 확인
        return this.containsAny(JSON.stringify(errorData), [cause]);
    }
    
    generateBasicAnalysis() {
        // 기본 분석 생성 (오류 데이터가 없을 경우)
        const analysis = {
            agent: this.name,
            timestamp: new Date().toISOString(),
            primaryCause: {
                pattern: 'INSUFFICIENT_DATA',
                confidence: 0.3,
                likelyCauses: ['Error data not available', 'Agent timeout'],
                solutions: ['Refresh page', 'Check browser console', 'Wait for error collection']
            },
            confidence: 0.3,
            recommendations: [{
                priority: 'HIGH',
                title: 'No Error Data Available',
                description: 'Unable to analyze without error information',
                causes: ['Agent timeout', 'Network issues'],
                solutions: ['Refresh the page', 'Check browser console']
            }]
        };
        
        this.displayAnalysis(analysis);
        return analysis;
    }
}

// 에이전트 자동 실행
if (typeof window !== 'undefined') {
    console.log('🧠 CauseAnalyzerAgent is starting...');
    const causeAnalyzer = new CauseAnalyzerAgent();
    
    // 전역으로 접근 가능하도록 설정
    window.causeAnalyzerAgent = causeAnalyzer;
}