// DOM 관련 유틸리티 함수
export function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}

export function findById(id) {
    return document.getElementById(id);
}

export function findBySelector(selector) {
    return document.querySelector(selector);
}

export function findAllBySelector(selector) {
    return document.querySelectorAll(selector);
}

export function addEventListener(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

export function removeEventListener(element, event, handler) {
    if (element) {
        element.removeEventListener(event, handler);
    }
}

// 스크롤 관련 유틸리티
export function scrollToElement(element, behavior = 'smooth') {
    if (element) {
        element.scrollIntoView({ behavior });
    }
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 클래스 관리 유틸리티
export function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

export function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

export function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

export function hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
}