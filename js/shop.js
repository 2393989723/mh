// 商店页面JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 检查认证状态
    checkAuthStatus();
    
    // 加载商品
    loadProducts();
    
    // 筛选按钮事件
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterBtns.forEach(b => b.classList.remove('active'));
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 根据游戏类型筛选商品
            const game = this.getAttribute('data-game');
            filterProducts(game);
        });
    });
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

// 加载商品
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    displayProducts(products);
}

// 显示商品
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>暂无商品</p>';
        return;
    }
    
    let productsHTML = '';
    products.forEach(product => {
        if (product.stock > 0) {
            productsHTML += `
                <div class="product-card" data-game="${product.game}">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : '商品图片'}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="product-price">${product.price} 钻石</p>
                        <button class="buy-btn" data-id="${product.id}">立即购买</button>
                    </div>
                </div>
            `;
        }
    });
    
    productsGrid.innerHTML = productsHTML;
    
    // 添加购买按钮事件
    const buyBtns = document.querySelectorAll('.buy-btn');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            purchaseProduct(productId);
        });
    });
}

// 筛选商品
function filterProducts(game) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (game === 'all' || card.getAttribute('data-game') === game) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 购买商品
function purchaseProduct(productId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // 查找商品
    const product = products.find(p => p.id == productId);
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    if (product.stock <= 0) {
        alert('商品库存不足');
        return;
    }
    
    // 查找用户
    const user = users.find(u => u.id === currentUser.id);
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    // 检查钻石余额
    if (user.diamonds < product.price) {
        alert('钻石余额不足');
        return;
    }
    
    // 生成订单ID
    const orderId = 'P' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 创建购买订单
    const order = {
        id: orderId,
        userId: currentUser.id,
        username: currentUser.username,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        type: 'purchase',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 扣除用户钻石
    user.diamonds -= product.price;
    
    // 减少商品库存
    product.stock -= 1;
    
    // 更新数据
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('users', JSON.stringify(users));
    
    // 更新当前用户信息
    currentUser.diamonds = user.diamonds;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('购买成功！客服将很快联系您发送账号信息');
                          }
