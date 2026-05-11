/**
 * 오류 수집 에이전트
 * 웹 페이지의 모든 오류를 수집하고 분석하는 에이전트
 */

class ErrorCollectorAgent {
    constructor() {
        this.errors = [];
        this.networkRequests = [];
        this.consoleMessages = [];
        this.userAgent = navigator.userAgent;
        this.url = window.location.href;
        this.timestamp = new Date().toISOString();
        
        this.initialize();
    }
    
    initialize() {
        // 전역 오류 수집
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // 콘솔 메시지 가로채기
        this.hookConsole();
        
        // 네트워크 요청 가로채기
        this.hookFetch();
        this.hookXHR();
        
        // 3초 후 오류 보고서 생성
        setTimeout(() => {
            this.generateErrorReport();
        }, 3000);
    }
    
    handleGlobalError(event) {
        const error = {
            type: 'global_error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.stack || 'No stack trace',
            timestamp: new Date().toISOString()
        };
        
        this.errors.push(error);
        console.log('🔍 Error captured:', error);
    }
    
    handleUnhandledRejection(event) {
        const error = {
            type: 'unhandled_rejection',
            message: event.reason?.message || event.reason || 'Unknown rejection',
            stack: event.reason?.stack || 'No stack trace',
            timestamp: new Date().toISOString()
        };
        
        this.errors.push(error);
        console.log('🔍 Unhandled rejection captured:', error);
    }
    
    hookConsole() {
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        const originalConsoleLog = console.log;
        
        console.error = (...args) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            this.consoleMessages.push({
                type: 'error',
                message: message,
                timestamp: new Date().toISOString()
            });
            
            originalConsoleError.apply(console, args);
        };
        
        console.warn = (...args) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            this.consoleMessages.push({
                type: 'warn',
                message: message,
                timestamp: new Date().toISOString()
            });
            
            originalConsoleWarn.apply(console, args);
        };
        
        console.log = (...args) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            this.consoleMessages.push({
                type: 'log',
                message: message,
                timestamp: new Date().toISOString()
            });
            
            originalConsoleLog.apply(console, args);
        };
    }
    
    hookFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const request = {
                url: args[0],
                method: args[1]?.method || 'GET',
                headers: args[1]?.headers || {},
                timestamp: new Date().toISOString()
            };
            
            this.networkRequests.push({
                ...request,
                type: 'fetch_start'
            });
            
            try {
                const response = await originalFetch(...args);
                
                const clonedResponse = response.clone();
                try {
                    const contentType = clonedResponse.headers.get('content-type');
                    let body = 'Response body not captured';
                    
                    if (contentType && contentType.includes('application/json')) {
                        body = await clonedResponse.text();
                    }
                    
                    this.networkRequests.push({
                        ...request,
                        type: 'fetch_success',
                        status: response.status,
                        contentType: contentType,
                        body: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    this.networkRequests.push({
                        ...request,
                        type: 'fetch_success_no_body',
                        status: response.status,
                        error: e.message,
                        timestamp: new Date().toISOString()
                    });
                }
                
                return response;
            } catch (error) {
                this.networkRequests.push({
                    ...request,
                    type: 'fetch_error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
                throw error;
            }
        };
    }
    
    hookXHR() {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(...args) {
            this._requestUrl = args[1];
            this._requestMethod = args[0] || 'GET';
            return originalXHROpen.apply(this, args);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            const request = {
                url: this._requestUrl,
                method: this._requestMethod,
                timestamp: new Date().toISOString()
            };
            
            // 에이전트가 XHR 요청을 수집할 수 있도록 이벤트 리스너 추가
            this.addEventListener('load', function() {
                console.log('🔍 XHR Response:', {
                    url: this._requestUrl,
                    status: this.status,
                    responseText: this.responseText?.substring(0, 200) || 'No response'
                });
            });
            
            this.addEventListener('error', function() {
                console.log('🔍 XHR Error:', {
                    url: this._requestUrl,
                    error: 'XHR request failed'
                });
            });
            
            return originalXHRSend.apply(this, args);
        };
    }
    
    generateErrorReport() {
        const report = {
            agent: 'ErrorCollectorAgent',
            timestamp: this.timestamp,
            url: this.url,
            userAgent: this.userAgent,
            errors: this.errors,
            networkRequests: this.networkRequests,
            consoleMessages: this.consoleMessages.slice(-50), // 최근 50개 메시지만
            summary: this.generateSummary()
        };
        
        console.log('📋 ERROR REPORT:', JSON.stringify(report, null, 2));
        
        // 페이지에 오류 보고서 표시
        this.displayErrorReport(report);
        
        // 다른 에이전트와의 통신을 위해 전역 객체에 저장
        window.errorReport = report;
        
        return report;
    }
    
    generateSummary() {
        const errorCount = this.errors.length;
        const networkErrorCount = this.networkRequests.filter(req => 
            req.type === 'fetch_error' || req.status >= 400
        ).length;
        
        const mainErrorTypes = [...new Set(this.errors.map(e => e.type))];
        const failingUrls = [...new Set(
            this.networkRequests
                .filter(req => req.status >= 400)
                .map(req => new URL(req.url).origin + new URL(req.url).pathname)
        )];
        
        return {
            totalErrors: errorCount,
            networkErrors: networkErrorCount,
            errorTypes: mainErrorTypes,
            failingUrls: failingUrls,
            criticalIssues: this.identifyCriticalIssues()
        };
    }
    
    identifyCriticalIssues() {
        const issues = [];
        
        // JSON 파싱 오류 확인
        const jsonErrors = this.errors.filter(e => 
            e.message.includes('JSON') || e.message.includes('Unexpected token')
        );
        
        if (jsonErrors.length > 0) {
            issues.push({
                type: 'JSON_PARSING_ERROR',
                count: jsonErrors.length,
                description: 'Application expecting JSON but receiving HTML or other content'
            });
        }
        
        // 네트워크 오류 확인
        const networkErrors = this.networkRequests.filter(req => 
            req.type === 'fetch_error' || req.status >= 400
        );
        
        if (networkErrors.length > 0) {
            issues.push({
                type: 'NETWORK_ERROR',
                count: networkErrors.length,
                description: 'Failed network requests detected'
            });
        }
        
        // Manifest 오류 확인
        const manifestErrors = this.errors.filter(e =>
            e.message.includes('Manifest') || e.message.includes('Line: 1, column: 1')
        );
        
        if (manifestErrors.length > 0) {
            issues.push({
                type: 'MANIFEST_ERROR',
                count: manifestErrors.length,
                description: 'Web app manifest issues detected'
            });
        }
        
        return issues;
    }
    
    displayErrorReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'error-agent-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: #f8f9fa;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        reportDiv.innerHTML = `
            <div style="color: #dc3545; font-weight: bold; margin-bottom: 10px;">
                🚨 ERROR AGENT REPORT
            </div>
            <div style="color: #6c757d; font-size: 10px; margin-bottom: 10px;">
                Generated: ${report.timestamp}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Total Errors:</strong> ${report.summary.totalErrors}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Network Errors:</strong> ${report.summary.networkErrors}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Critical Issues:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${report.summary.criticalIssues.map(issue => 
                        `<li style="color: #dc3545;">${issue.type}: ${issue.description}</li>`
                    ).join('')}
                </ul>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
            ">Close Report</button>
        `;
        
        document.body.appendChild(reportDiv);
    }
}

// 에이전트 자동 실행
if (typeof window !== 'undefined') {
    console.log('🤖 ErrorCollectorAgent is starting...');
    const errorCollector = new ErrorCollectorAgent();
    
    // 전역으로 접근 가능하도록 설정
    window.errorCollectorAgent = errorCollector;
}