import axios from 'axios'
import $store from '@/store/index'

// 请求的根路径
const baseURL="http://47.120.34.167:3000";//服务器地址

let ajaxTimer = 0;
export function request(config) {
    $store.commit('showLoading');
    const install = axios.create({
        baseURL,
        timeOut: 2000
    });
    install.interceptors.request.use(data => {
        ajaxTimer++;
        return data;
    }, err => {
        $store.commit('hiddenLoading');
        return err
    });
    install.interceptors.response.use(data => {
        ajaxTimer--;
        if (ajaxTimer == 0) $store.commit('hiddenLoading');
        return data;
    }, err => {
        $store.commit('hiddenLoading');
        throw err;
        return err;
    });
    return install(config);
}