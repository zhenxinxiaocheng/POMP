import {request} from 'network/request'

export function _phoneVerify(phone){
    return request({
        url:'/cellphone/existence/check',
        params:{
            phone:phone
        }
    })
}

/**发送验证码 */
export function _sendCaptcha(phone, countrycode = '86'){
    return request({
        url:'/captcha/sent',
        params:{
            phone: phone,
            countrycode: countrycode
        }
    })
}

export function _login(params){
    return request({
        url:'/login/cellphone',
        params:{
            phone: params.phone,
            password: params.password,
            countrycode: params.countrycode || '86',
            md5_password: params.md5_password,
            captcha: params.captcha
        }
    })
}

/**获取用户歌单 */
export function _getSongList(id){
    return request({
        url:'/user/playlist',
        params:{
            uid:id
        }
    })
}

export class PlayList{
    constructor(playlist){
        this.name=playlist.name;//为了方便menu使用
        this.id=playlist.id;
        this.cover=playlist.coverImgUrl;
    }
}