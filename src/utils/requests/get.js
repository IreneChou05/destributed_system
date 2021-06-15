import Vue from "vue"
import {user_generateToken_url} from "@/config/api.js"
let vue = new Vue()

export function get(url, form = {}, config = {}) {
    return new Promise((resolve, reject) => {
        vue.$http.get(url, form, config).then((resp) => {
            if (resp.data.status == 'success') {
                resolve(resp);
            }
        })
        .catch((error) => {
            if(error.status == 401) {
                let user = JSON.parse(window.localStorage.getItem('user'))
                let userForm = {
                    userID: user.userID,
                    userName: user.userName
                }
                vue.$http.post(user_generateToken_url, userForm).then((resp) => {
                    if(resp.data.status == 'success') {
                        window.localStorage.setItem('token', resp.data.data.token);
                        form.token = resp.data.data.token;
                        vue.$http.get(url, form, config).then((resp) => {
                            if (resp.data.status == 'success') {
                                resolve(resp);
                            }
                        })
                    }
                })
                .catch((error) => {
                    reject.error(error)
                })
            } else {
                reject(error);
            }
        });
    });
}