import axios from '../utils/axios-customize';

export const callRegister = (username, fullName, email, password, phone, address, avatar, age, bio) => {
    return axios.post('/api/v1/auth/register', {
        username,
        name: fullName,
        email,
        password,
        phone,
        address,
        avatar,
        age,
        bio
    });
};


export const callLogin = (username, password) => {
    return axios.post('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get('/api/v1/auth/account')
}

export const callLogout = () => {
    return axios.post('/api/v1/auth/logout')
}

export const callFetchListUser = (query) => {
    // current=1&pageSize=3
    return axios.get(`/api/v1/users?${query}`)
}

export const callCreateAUser = (username, name, password, email, phone, age, bio, address) => {
    return axios.post('/api/v1/users/create', { username, name, password, email, phone, age, bio, address })
}


export const callUpdateUser = (id, username, name, passwordHash, email, phone, age, bio, address) => {
    return axios.put('/api/v1/users/update', { id, username, name, passwordHash, email, phone, age, bio, address })
}

export const callDeleteUser = (id) => {
    return axios.delete(`/api/v1/users/${id}`)
}

///////////////////////

export const callFetchListFood = (query) => {
    return axios.get(`/api/v1/products?${query}`)
}


export const callFetchCategory = () => {
    return axios.get('/api/v1/categories');
}

export const callCreateFood = (image, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc) => {
    return axios.post('/api/v1/products', {
        image, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc
    })
}

export const callUpdateFood = (id, image, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc) => {
    return axios.put(`/api/v1/products/${id}`, {
        image, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc
    })
}

export const callUploadFoodImg = (file, folderType) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const callDeleteFood = (id) => {
    return axios.delete(`/api/v1/products/${id}`);
}

export const callFetchFoodById = (id) => {
    return axios.get(`api/v1/products/${id}`)
}


///////////////////
export const callFetchCategoryPage = (query) => {
    return axios.get(`/api/v1/categories/pagination?${query}`)
}

export const callCreateCategory = (name, description) => {
    return axios.post('/api/v1/categories', { name, description })
}

export const callUpdateCategory = (id, name, description) => {
    return axios.put(`/api/v1/categories/${id}`, { name, description })
}

export const callDeleteCategory = (id) => {
    return axios.delete(`/api/v1/categories/${id}`)
}

export const callPlaceOrder = (data) => {
    return axios.post('/api/v1/ordproducts', {
        ...data
    })
}

export const callOrderHistory = () => {
    return axios.get('/api/v1/history/user');
}

export const callUpdateAvatar = (file, folderType) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const callUpdateUserInfo = (id, name, phone, avatar) => {
    return axios.put(`/api/v1/users/update/account`, {
        id, name, phone, avatar
    })
}

export const callUpdatePassword = (oldPassword, newPassword) => {
    return axios.post(`/api/v1/auth/change-password`, {
        oldPassword, newPassword
    })
}

export const callFetchDashboard = () => {
    return axios.get('/api/v1/database/dashboard')
}

export const callFetchListOrder = (query) => {
    return axios.get(`/api/v1/orders?${query}`)
}

export const callDeleteOrder = (id) => {
    return axios.delete(`/api/v1/orders/${id}`)
}

export const callUpdateOrder = (id, status) => {
    return axios.put(`/api/v1/orders/${id}`, status, { headers: { "Content-Type": "application/json" } });
};

export const callUpdatePayment = (id, payment) => {
    return axios.put(`/api/v1/orders/pay/${id}`, payment, { headers: { "Content-Type": "application/json" } });
}

export const callCreateTable = (tableNumber, status) => {
    return axios.post('/api/v1/tables', { tableNumber, status })
}

export const callFetchTable = (query) => {
    return axios.get(`/api/v1/tables?${query}`)
}

export const callDeleteTable = (id) => {
    return axios.delete(`/api/v1/tables/${id}`)
}

export const callUpdateStatusTable = (id, status) => {
    return axios.put(`/api/v1/tables/${id}`, status, { headers: { "Content-Type": "application/json" } })
}

export const callLoginGoogle = (tokenId) => {
    return axios.post('/api/v1/auth/google', { tokenId })
}

export const callForgotPassword = (email) => {
    return axios.post('/api/v1/auth/forgot-password', null, { params: { email } })
}

export const callResetPassword = (token, newPassword) => {
    return axios.post('/api/v1/auth/reset-password', { token, newPassword })
}