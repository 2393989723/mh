// 认证相关的JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据存储
    initDataStorage();
    
    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 验证登录
            if (validateLogin(username, password)) {
                // 保存用户信息到sessionStorage
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.username === username);
                
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                // 根据用户角色跳转
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                alert('用户名或密码错误');
            }
        });
    }
    
    // 注册表单处理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            // 注册用户
            if (registerUser(username, email, password)) {
                alert('注册成功，请登录');
                window.location.href = 'login.html';
            } else {
                alert('注册失败，用户名或邮箱已存在');
            }
        });
    }
    
    // 检查用户是否已登录
    checkAuthStatus();
});

// 初始化数据存储
function initDataStorage() {
    // 如果还没有用户数据，创建默认管理员
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123', // 实际应用中应该加密
                diamonds: 0,
                role: 'admin',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // 如果还没有商品数据，创建默认商品
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: '高级游戏账号A',
                description: '包含大量稀有道具和皮肤',
                price: 1000,
                game: 'game1',
                stock: 5,
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: '中级游戏账号B',
                description: '拥有多个稀有角色',
                price: 500,
                game: 'game2',
                stock: 10,
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: '初级游戏账号C',
                description: '适合新手的入门账号',
                price: 200,
                game: 'game3',
                stock: 15,
                image: '',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    
    // 如果还没有订单数据，初始化空数组
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
}

// 验证登录
function validateLogin(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    return !!user;
}

// 注册用户
function registerUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 检查用户是否已存在
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return false;
    }
    
    // 创建新用户
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        email,
        password, // 实际应用中应该加密
        diamonds: 0,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
}

// 检查认证状态
function checkAuthStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser.id) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        if (currentUser.role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }
    }
    
    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}
