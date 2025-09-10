// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    
    // 導航欄相關功能
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    
    // 漢堡選單切換
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // 點擊導航連結時關閉手機選單
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // 滾動時改變導航欄樣式
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // 平滑滾動到指定區塊
    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 70; // 減去導航欄高度
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
    
    // 為所有內部連結添加平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScrollTo(targetId);
        });
    });
    
    // 滾動動畫觀察器
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 為需要動畫的元素添加觀察
    document.querySelectorAll('.benefit-card, .purification-card, .action-card, .image-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    /* 兩難困境：讓右側卡片群的中央，對齊左側圖片的中央 */
    function alignRightCardsToLeftPhoto() {
        const grid = document.querySelector('#dilemma .content-grid');
        const leftPhoto = document.querySelector('#dilemma .content-photo');
        const leftImg = document.querySelector('#dilemma .content-photo img');
        const rightCol = document.querySelector('#dilemma .content-images');
        if (!grid || !leftPhoto || !rightCol) return;
        // 僅在寬度足以並排時調整
        const isDesktop = window.innerWidth >= 992;
        if (!isDesktop) {
            document.documentElement.style.setProperty('--dilemma-right-offset', '0px');
            return;
        }
        const gridRect = grid.getBoundingClientRect();
        const rightRect = rightCol.getBoundingClientRect();
        const photoRect = (leftImg || leftPhoto).getBoundingClientRect();
        const gridTop = gridRect.top + window.scrollY;
        const photoCenter = photoRect.top + window.scrollY + (photoRect.height / 2);
        const rightHalf = rightRect.height / 2;
        // 讓右側中心 = 左圖中心
        const desiredOffset = Math.max(0, photoCenter - rightHalf - gridTop);
        document.documentElement.style.setProperty('--dilemma-right-offset', `${desiredOffset}px`);
    }
    // 初始與事件綁定
    alignRightCardsToLeftPhoto();
    window.addEventListener('load', alignRightCardsToLeftPhoto);
    window.addEventListener('resize', () => {
        // 使用 rAF 避免多次計算抖動
        window.requestAnimationFrame(alignRightCardsToLeftPhoto);
    });
    
    // 表單處理 - AJAX 提交後顯示感謝彈窗
    const contactForm = document.getElementById('contactFormModal');
    const thankYouPopup = document.getElementById('thankYouPopup');
    const closeThankYou = document.getElementById('closeThankYou');
    function openThankYou() {
        if (!thankYouPopup) return;
        thankYouPopup.classList.add('active');
        thankYouPopup.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        const btn = thankYouPopup.querySelector('button');
        if (btn) btn.focus();
    }
    function closeThankYouPopup() {
        if (!thankYouPopup) return;
        thankYouPopup.classList.remove('active');
        thankYouPopup.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
    }
    if (closeThankYou) closeThankYou.addEventListener('click', closeThankYouPopup);
    if (thankYouPopup) {
        thankYouPopup.addEventListener('click', (e)=>{ if(e.target===thankYouPopup) closeThankYouPopup(); });
    }
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && thankYouPopup && thankYouPopup.classList.contains('active')) closeThankYouPopup(); });
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            const name = this.querySelector('#name');
            const email = this.querySelector('#email');
            if (!name.value.trim() || !email.value.trim()) {
                alert('請填寫姓名與Email');
                return;
            }
            submitButton.textContent = '送出中...';
            submitButton.disabled = true;
            try {
                const formData = new FormData(this);
                // 送到 FormSubmit（使用其端點）
                const action = this.getAttribute('action');
                const res = await fetch(action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                // 無論是否 200 先顯示感謝視窗，保持使用者體驗
                openThankYou();
                this.reset();
            } catch (err) {
                alert('提交失敗，請稍後再試');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                // 關閉聯絡表單 modal
                const modal = document.getElementById('contactModal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden','true');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    // 顯示訊息函數
    function showMessage(message, type) {
        // 移除現有的訊息
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 創建新訊息
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
            ${type === 'success' ? 
                'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
                'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;
        
        // 插入訊息
    const form = document.getElementById('contactFormModal');
    if (form) form.insertBefore(messageDiv, form.firstChild);
        
        // 3秒後自動移除訊息
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    // 產品圖片懸停效果
    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 卡片懸停效果增強
    document.querySelectorAll('.benefit-card, .purification-card, .action-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 35px rgba(255, 140, 66, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // 滾動進度指示器
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // 創建進度條（如果不存在）
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 70px;
                left: 0;
                width: ${scrollPercent}%;
                height: 3px;
                background: linear-gradient(90deg, #ff8c42, #ffd700);
                z-index: 1001;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        } else {
            progressBar.style.width = scrollPercent + '%';
        }
    }
    
    window.addEventListener('scroll', updateScrollProgress);
    
    // 返回頂部按鈕
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff8c42, #ffd700);
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(backToTopButton);
    
    // 顯示/隱藏返回頂部按鈕
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    // 返回頂部功能
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 懸停效果
    backToTopButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 8px 25px rgba(255, 140, 66, 0.4)';
    });
    
    backToTopButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    });
    
    // 載入動畫
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    });
    
    // 初始設定
    document.body.style.opacity = '0';
    
    // 圖片懶加載
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                img.style.transition = 'opacity 0.3s ease';
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.style.opacity = '0';
        imageObserver.observe(img);
    });

    /* 彈出視窗：聯絡我們 */
    const modal = document.getElementById('contactModal');
    const openBtn = document.querySelector('.open-modal-button');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    let lastFocusedElement = null;

    function openModal() {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // 防止背景滾動
        document.body.style.overflow = 'hidden';
        // 將焦點移到第一個可聚焦元素
        const firstInput = modal.querySelector('input, textarea, button');
        if (firstInput) firstInput.focus();
        trapFocus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // ESC 關閉
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function trapFocus() {
        if (!modal) return;
        const focusable = modal.querySelectorAll('a[href], button, textarea, input, select');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        document.addEventListener('keydown', function handleTab(e) {
            if (!modal.classList.contains('active')) {
                document.removeEventListener('keydown', handleTab);
                return;
            }
            if (e.key === 'Tab') {
                if (e.shiftKey) { // shift + tab
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else { // tab
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        });
    }
});

// 視窗大小改變時的處理
window.addEventListener('resize', function() {
    // 關閉手機選單
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

