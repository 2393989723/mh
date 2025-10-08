// 管理员页面JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员权限
    checkAdminAuth();
    
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新标签按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新标签内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + '-tab').classList.add('active');
            
            // 加载对应标签的数据
            if (tabId === 'orders') {
                loadOrders();
            } else if (tabId === 'users') {
                loadUsers();
            } else if (tabId === 'products') {
                loadProducts();
            }
        });
    });
    
    // 刷新订单
    document.getElementById('refreshOrdersBtn').addEventListener('click', loadOrders);
    
    // 刷新用户
    document.getElementById('refreshUsersBtn').addEventListener('click', loadUsers);
    
    // 刷新商品
    document.getElementById('refreshProductsBtn').addEventListener('click', loadProducts);
    
    // 添加商品按钮
    document.getElementById('addProductBtn').addEventListener('click', function() {
        document.getElementById('productFormTitle').textContent = '添加商品';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productFormModal').style.display = 'flex';
    });
    
    // 关闭模态框
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('productFormModal').style.display = 'none';
    });
    
    // 商品表单提交
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // 退出管理员
    document.getElementById('adminLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // 初始加载订单数据
    loadOrders();
});

// 检查管理员权限
function checkAdminAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id || currentUser.role !== 'admin') {
        alert('您没有管理员权限');
        window.location.href = 'login.html';
        return;
    }
}

// 加载订单数据
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    displayOrders(orders);
}

// 显示订单数据
function displayOrders(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">暂无订单</td></tr>';
        return;
    }
    
    // 按创建时间排序
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let ordersHTML = '';
    orders.forEach(order => {
        ordersHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.username}</td>
                <td>${order.type === 'recharge' ? '充值' : '购买'}</td>
                <td>${order.amount} ${order.type === 'recharge' ? '元' : '钻石'}</td>
                <td>${order.status}</td>
                <td>${new Date(order.createdAt).toLocaleString()}</td>
                <td>
                    ${order.status === 'pending' && order.type === 'recharge' ? 
                        `<button class="action-btn btn-success" onclick="completeOrder('${order.id}')">完成充值</button>` : 
                        ''}
                    ${order.status === 'pending' && order.type === 'purchase' ? 
                        `<button class="action-btn btn-success" onclick="completePurchase('${order.id}')">完成发货</button>` : 
                        ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = ordersHTML;
}

// 完成充值订单
function completeOrder(orderId) {
    const diamonds = prompt('请输入实际充值的钻石数量:');
    
    if (!diamonds || isNaN(diamonds) || diamonds < 1) {
        alert('请输入有效的钻石数量');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('订单不存在');
        return;
    }
    
    if (order.status !== 'pending') {
        alert('订单状态不可更改');
        return;
    }
    
    // 更新订单状态
    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    
    // 为用户添加钻石
    const user = users.find(u => u.id === order.userId);
    if (user) {
        user.diamonds += parseInt(diamonds);
        
        // 如果用户当前已登录，更新sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (currentUser.id === user.id) {
            currentUser.diamonds = user.diamonds;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
    
    // 更新数据
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('订单状态更新成功');
    loadOrders();
}

// 完成购买订单
function completePurchase(orderId) {
    if (!confirm('确认已完成发货？')) {
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('订单不存在');
        return;
    }
    
    if (order.status !== 'pending') {
        alert('订单状态不可更改');
        return;
    }
    
    // 更新订单状态
    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    
    // 更新数据
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert('订单状态更新成功');
    loadOrders();
}

// 加载用户数据
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    displayUsers(users);
}

// 显示用户数据
function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">暂无用户</td></tr>';
        return;
    }
    
    let usersHTML = '';
    users.forEach(user => {
        usersHTML += `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.diamonds}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn btn-warning" onclick="addDiamonds('${user.id}')">添加钻石</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = usersHTML;
}

// 为用户添加钻石
function addDiamonds(userId) {
    const diamonds = prompt('请输入要添加的钻石数量:');
    
    if (!diamonds || isNaN(diamonds) || diamonds < 1) {
        alert('请输入有效的钻石数量');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const user = users.find(u => u.id == userId);
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    user.diamonds += parseInt(diamonds);
    
    // 如果用户当前已登录，更新sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (currentUser.id === user.id) {
        currentUser.diamonds = user.diamonds;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('钻石添加成功');
    loadUsers();
}

// 加载商品数据
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    displayProducts(products);
}

// 显示商品数据
function displayProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">暂无商品</td></tr>';
        return;
    }
    
    let productsHTML = '';
    products.forEach(product => {
        productsHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price}</td>
                <td>${product.game}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="action-btn btn-warning" onclick="editProduct('${product.id}')">编辑</button>
                    <button class="action-btn btn-danger" onclick="deleteProduct('${product.id}')">删除</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = productsHTML;
}

// 编辑商品
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const product = products.find(p => p.id == productId);
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    document.getElementById('productFormTitle').textContent = '编辑商品';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productGame').value = product.game;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productFormModal').style.display = 'flex';
}

// 保存商品
function saveProduct() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productId = document.getElementById('productId').value;
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseInt(document.getElementById('productPrice').value),
        game: document.getElementById('productGame').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value
    };
    
    if (productId) {
        // 更新现有商品
        const productIndex = products.findIndex(p => p.id == productId);
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                ...productData
            };
        }
    } else {
        // 添加新商品
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...productData,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    alert(productId ? '商品更新成功' : '商品添加成功');
    document.getElementById('productFormModal').style.display = 'none';
    loadProducts();
}

// 删除商品
function deleteProduct(productId) {
    if (!confirm('确定要删除这个商品吗？')) {
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex(p => p.id == productId);
    
    if (productIndex === -1) {
        alert('商品不存在');
        return;
    }
    
    products.splice(productIndex, 1);
    localStorage.setItem('products', JSON.stringify(products));
    
    alert('商品删除成功');
    loadProducts();
        }
