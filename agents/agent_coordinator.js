/**
 * 에이전트 통합 스크립트
 * 오류 수집 에이전트와 원인 분석 에이전트를 통합하고 협업시키는 스크립트
 */

(function() {
    const agentCoordinator = {
        name: 'AgentCoordinator',
        version: '1.0.0',
        agents: {},
        startTime: Date.now(),
        
        async initialize() {
            console.log(`🤖 ${this.name} v${this.version} is initializing...`);
            
            // 에이전트 순차 로드
            await this.loadAgents();
            
            // 에이전트 협업 시작
            this.startCollaboration();
            
            // 분석 결과 보고서 생성
            setTimeout(() => {
                this.generateFinalReport();
            }, 8000); // 8초 후 최종 보고서 생성
        },
        
        async loadAgents() {
            console.log('📦 Loading agents...');
            
            // ErrorCollectorAgent 로드
            try {
                await this.loadScript('/agents/error_collector_agent.js');
                console.log('✅ ErrorCollectorAgent loaded');
            } catch (e) {
                console.error('❌ Failed to load ErrorCollectorAgent:', e);
            }
            
            // CauseAnalyzerAgent 로드
            try {
                await this.loadScript('/agents/cause_analyzer_agent.js');
                console.log('✅ CauseAnalyzerAgent loaded');
            } catch (e) {
                console.error('❌ Failed to load CauseAnalyzerAgent:', e);
            }
        },
        
        loadScript(url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.async = false;
                
                script.onload = () => {
                    console.log(`📦 Loaded: ${url}`);
                    resolve();
                };
                
                script.onerror = (error) => {
                    console.error(`❌ Failed to load: ${url}`, error);
                    reject(error);
                };
                
                document.head.appendChild(script);
            });
        },
        
        startCollaboration() {
            console.log('🤝 Starting agent collaboration...');
            
            // 에이전트 간 통신 설정
            const collaborationInterval = setInterval(() => {
                this.checkAgentStatus();
            }, 1000);
            
            // 10초 후 협업 종료
            setTimeout(() => {
                clearInterval(collaborationInterval);
                console.log('🤝 Agent collaboration completed');
            }, 10000);
        },
        
        checkAgentStatus() {
            const status = {
                timestamp: new Date().toISOString(),
                errorCollector: window.errorCollectorAgent ? 'active' : 'inactive',
                causeAnalyzer: window.causeAnalyzerAgent ? 'active' : 'inactive',
                errorReport: window.errorReport ? 'available' : 'pending',
                causeAnalysis: window.causeAnalysis ? 'available' : 'pending'
            };
            
            console.log('📊 Agent Status:', status);
        },
        
        generateFinalReport() {
            console.log('📋 Generating final analysis report...');
            
            const finalReport = {
                coordinator: {
                    name: this.name,
                    version: this.version,
                    duration: Date.now() - this.startTime
                },
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                
                // 오류 수집 결과
                errorReport: window.errorReport || null,
                
                // 원인 분석 결과
                causeAnalysis: window.causeAnalysis || null,
                
                // 통합 분석
                integratedAnalysis: this.createIntegratedAnalysis(),
                
                // 추천 사항
                recommendations: this.generateRecommendations()
            };
            
            console.log('📋 FINAL REPORT:', finalReport);
            
            // 전역으로 저장
            window.finalAgentReport = finalReport;
            
            // 화면에 보고서 표시
            this.displayFinalReport(finalReport);
            
            // 서버로 전송 (선택적)
            this.sendToServer(finalReport);
        },
        
        createIntegratedAnalysis() {
            const errorReport = window.errorReport;
            const causeAnalysis = window.causeAnalysis;
            
            if (!errorReport) {
                return {
                    status: 'insufficient_data',
                    message: 'No error report available'
                };
            }
            
            const integrated = {
                totalErrors: errorReport.summary.totalErrors,
                networkErrors: errorReport.summary.networkErrors,
                primaryCause: causeAnalysis?.primaryCause?.pattern || 'unknown',
                primaryCauseConfidence: causeAnalysis?.primaryCause?.confidence || 0,
                allCauses: causeAnalysis?.recommendations?.map(r => r.title) || [],
                
                // 통합 문제 식별
                issues: this.identifyIntegratedIssues(errorReport, causeAnalysis),
                
                // 심각도 평가
                severity: this.assessSeverity(errorReport, causeAnalysis)
            };
            
            return integrated;
        },
        
        identifyIntegratedIssues(errorReport, causeAnalysis) {
            const issues = [];
            
            // JSON 파싱 오류 확인
            const jsonErrors = errorReport.errors.filter(e => 
                e.message.includes('JSON') || e.message.includes('Unexpected token')
            );
            
            if (jsonErrors.length > 0) {
                issues.push({
                    type: 'JSON_PARSING_ERROR',
                    count: jsonErrors.length,
                    severity: 'CRITICAL',
                    description: 'Application expecting JSON but receiving HTML or other content',
                    confidence: 0.95
                });
            }
            
            // Manifest 오류 확인
            const manifestErrors = errorReport.errors.filter(e =>
                e.message.includes('Manifest') || e.message.includes('Line: 1, column: 1')
            );
            
            if (manifestErrors.length > 0) {
                issues.push({
                    type: 'MANIFEST_ERROR',
                    count: manifestErrors.length,
                    severity: 'HIGH',
                    description: 'Web app manifest loading issues',
                    confidence: 0.85
                });
            }
            
            // 네트워크 오류 확인
            const networkErrors = errorReport.networkRequests.filter(req =>
                req.status >= 400 || req.type === 'fetch_error'
            );
            
            if (networkErrors.length > 0) {
                issues.push({
                    type: 'NETWORK_ERROR',
                    count: networkErrors.length,
                    severity: 'MEDIUM',
                    description: 'Failed network requests detected',
                    confidence: 0.8
                });
            }
            
            return issues;
        },
        
        assessSeverity(errorReport, causeAnalysis) {
            let severity = 'LOW';
            
            const totalErrors = errorReport.summary.totalErrors;
            const criticalIssues = errorReport.summary.criticalIssues.length;
            
            if (totalErrors > 10 || criticalIssues > 3) {
                severity = 'CRITICAL';
            } else if (totalErrors > 5 || criticalIssues > 1) {
                severity = 'HIGH';
            } else if (totalErrors > 2 || criticalIssues > 0) {
                severity = 'MEDIUM';
            }
            
            return {
                level: severity,
                confidence: causeAnalysis?.primaryCause?.confidence || 0,
                recommendation: this.getSeverityRecommendation(severity)
            };
        },
        
        getSeverityRecommendation(severity) {
            switch (severity) {
                case 'CRITICAL':
                    return 'Immediate action required. Application is broken.';
                case 'HIGH':
                    return 'Urgent fix needed. Major functionality affected.';
                case 'MEDIUM':
                    return 'Fix recommended. Some functionality degraded.';
                case 'LOW':
                    return 'Monitor and fix when possible.';
                default:
                    return 'Unknown severity level.';
            }
        },
        
        generateRecommendations() {
            const recommendations = [];
            
            const errorReport = window.errorReport;
            const causeAnalysis = window.causeAnalysis;
            
            if (!causeAnalysis) {
                return [{
                    priority: 'HIGH',
                    title: 'Insufficient Analysis Data',
                    description: 'Cause analysis not available',
                    actions: ['Refresh page', 'Check browser console', 'Clear cache']
                }];
            }
            
            // 원인 분석 기반 추천
            for (const recommendation of causeAnalysis.recommendations) {
                recommendations.push({
                    priority: recommendation.priority,
                    category: 'CAUSE_BASED',
                    title: recommendation.title,
                    description: recommendation.description,
                    causes: recommendation.causes,
                    solutions: recommendation.solutions
                });
            }
            
            // 추가적인 Flutter 웹 특정 추천
            recommendations.push({
                priority: 'HIGH',
                category: 'FLUTTER_WEB_SPECIFIC',
                title: 'Flutter Web Configuration',
                description: 'Specific configuration for Flutter web deployment',
                causes: ['Base URL settings', 'Asset path configuration', 'Service worker issues'],
                solutions: [
                    'Check --base-href parameter',
                    'Verify build/web/ directory contents',
                    'Review nginx configuration',
                    'Ensure proper MIME types'
                ]
            });
            
            // 네트워크 관련 추천
            if (errorReport.summary.networkErrors > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'NETWORK',
                    title: 'Network Configuration',
                    description: 'Fix network-related issues',
                    causes: ['Missing API endpoints', 'CORS configuration', 'Server routing'],
                    solutions: [
                        'Configure proper API routes',
                        'Set CORS headers correctly',
                        'Review nginx rewrite rules',
                        'Check Content-Type headers'
                    ]
                });
            }
            
            return recommendations;
        },
        
        displayFinalReport(finalReport) {
            const reportDiv = document.createElement('div');
            reportDiv.id = 'final-agent-report';
            reportDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                width: 500px;
                max-height: 85vh;
                overflow-y: auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                color: white;
                z-index: 999999;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            `;
            
            const severityColors = {
                'CRITICAL': '#dc3545',
                'HIGH': '#fd7e14',
                'MEDIUM': '#ffc107',
                'LOW': '#28a745'
            };
            
            const integrated = finalReport.integratedAnalysis;
            
            reportDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">🤖</div>
                    <div style="font-size: 18px; font-weight: bold;">FINAL AGENT REPORT</div>
                    <div style="font-size: 12px; opacity: 0.8;">
                        Generated in ${finalReport.coordinator.duration}ms
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; margin-bottom: 10px;">
                        <strong>📊 Summary</strong>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                        <div><strong>Total Errors:</strong> ${integrated.totalErrors || 0}</div>
                        <div><strong>Network Errors:</strong> ${integrated.networkErrors || 0}</div>
                        <div><strong>Primary Cause:</strong> ${integrated.primaryCause || 'unknown'}</div>
                        <div><strong>Confidence:</strong> ${Math.round((integrated.primaryCauseConfidence || 0) * 100)}%</div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <strong style="color: ${severityColors[integrated.severity.level]};">
                            Severity: ${integrated.severity.level}
                        </strong>
                        <div style="font-size: 11px; margin-top: 5px;">
                            ${integrated.severity.recommendation}
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; margin-bottom: 10px;">
                        <strong>🎯 Primary Issue</strong>
                    </div>
                    <div style="font-size: 12px;">
                        ${finalReport.causeAnalysis?.primaryCause?.pattern || 'Unable to determine'}
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px;">
                    <div style="font-size: 14px; margin-bottom: 10px;">
                        <strong>💡 Top Recommendations</strong>
                    </div>
                    ${finalReport.recommendations.slice(0, 3).map(rec => `
                        <div style="margin: 8px 0; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; font-size: 11px;">
                            <div style="font-weight: bold; color: ${severityColors[rec.priority]};">
                                ${rec.priority}: ${rec.title}
                            </div>
                            <div style="margin: 4px 0;">${rec.description}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="
                        const report = JSON.stringify(window.finalAgentReport, null, 2);
                        navigator.clipboard.writeText(report);
                        alert('Report copied to clipboard!');
                    " style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 2px solid rgba(255,255,255,0.3);
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                        margin: 5px;
                    ">📋 Copy Report</button>
                    
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: rgba(220,53,69,0.8);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                        margin: 5px;
                    ">❌ Close</button>
                </div>
            `;
            
            document.body.appendChild(reportDiv);
        },
        
        sendToServer(report) {
            console.log('📤 Sending report to server...');
            
            // 현재는 로컬 분석으로만 진행
            // 나중에 서버로 전송하는 기능을 추가할 수 있음
            console.log('📊 Report ready for server transmission (currently disabled)');
        }
    };
    
    // 자동 실행
    if (typeof window !== 'undefined') {
        console.log('🤖 AgentCoordinator is starting...');
        
        // DOM 로딩 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                agentCoordinator.initialize();
            });
        } else {
            agentCoordinator.initialize();
        }
        
        // 전역으로 접근 가능하도록 설정
        window.agentCoordinator = agentCoordinator;
    }
})();
