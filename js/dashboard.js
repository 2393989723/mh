// 用户仪表板JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
        window.location.href = 'login.html';
        return;
    }
    
    // 加载用户信息
    loadUserInfo();
    
    // 充值表单处理
    const rechargeForm = document.getElementById('rechargeForm');
    if (rechargeForm) {
        rechargeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('rechargeAmount').value;
            
            // 创建充值订单
            createRechargeOrder(amount);
        });
    }
    
    // 复制订单号
    const copyOrderBtn = document.getElementById('copyOrderBtn');
    if (copyOrderBtn) {
        copyOrderBtn.addEventListener('click', function() {
            const orderId = document.getElementById('orderId').textContent;
            navigator.clipboard.writeText(orderId)
                .then(() => {
                    alert('订单号已复制到剪贴板');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动复制订单号');
                });
        });
    }
    
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

// 加载用户信息
function loadUserInfo() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userDiamonds').textContent = currentUser.diamonds;
    
    // 加载购买历史
    loadPurchaseHistory();
}

// 创建充值订单
function createRechargeOrder(amount) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // 生成订单ID
    const orderId = 'R' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 创建订单
    const order = {
        id: orderId,
        userId: currentUser.id,
        username: currentUser.username,
        amount: parseInt(amount),
        type: 'recharge',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 显示订单信息
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('orderAmount').textContent = amount;
    document.getElementById('orderInfo').style.display = 'block';
}

// 加载购买历史
function loadPurchaseHistory() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const userOrders = orders.filter(o => o.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const historyContainer = document.getElementById('purchaseHistory');
    
    if (userOrders.length === 0) {
        historyContainer.innerHTML = '<p>暂无购买记录</p>';
        return;
    }
    
    let historyHTML = '';
    userOrders.forEach(order => {
        historyHTML += `
            <div class="history-item">
                <p><strong>订单号:</strong> ${order.id}</p>
                <p><strong>商品:</strong> ${order.productName || '钻石充值'}</p>
                <p><strong>金额:</strong> ${order.amount} ${order.type === 'recharge' ? '元' : '钻石'}</p>
                <p><strong>状态:</strong> ${order.status}</p>
                <p><strong>时间:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHTML;
}
