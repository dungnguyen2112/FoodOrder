import { createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

const initialState = {
    buyNowItem: null // Lưu trữ sản phẩm "Mua ngay" (chỉ 1 sản phẩm)
};

export const buyNowSlice = createSlice({
    name: 'buyNow',
    initialState,
    reducers: {
        doBuyNowAction: (state, action) => {
            // Thay vì thêm vào danh sách, chỉ lưu một sản phẩm duy nhất
            state.buyNowItem = {
                quantity: action.payload.quantity,
                id: action.payload.id,
                detail: action.payload.detail
            };
            message.success("Sản phẩm đã được chọn để mua ngay");
        },
        clearBuyNowAction: (state) => {
            // Xóa sản phẩm "Mua ngay" sau khi đặt hàng xong
            state.buyNowItem = null;
        }
    }
});

export const { doBuyNowAction, clearBuyNowAction } = buyNowSlice.actions;

export default buyNowSlice.reducer;